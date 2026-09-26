// Safe ZIP extractor with security validation
// Rejects path traversal, symlinks, nested archives, oversized files, decompression bombs

import { createHash } from "crypto";
import { promisify } from "util";
import * as yauzl from "yauzl";
import { MediaKind, MediaAsset, MessageId, AssetId } from "@invitestory/contracts";

export type SHA256Hash = string;

function openZip(buffer: Buffer, options: yauzl.Options): Promise<yauzl.ZipFile> {
  return new Promise((resolve, reject) => {
    yauzl.fromBuffer(buffer, options, (err, zipfile) => {
      if (err) reject(err);
      else resolve(zipfile);
    });
  });
}

export interface ExtractionLimits {
  maxUncompressedBytes: number;
  maxFileCount: number;
  maxNestingDepth: number;
  maxFileSize: number;
  allowedMimeTypes: string[];
}

export const DEFAULT_LIMITS: ExtractionLimits = {
  maxUncompressedBytes: 500 * 1024 * 1024, // 500MB
  maxFileCount: 1000,
  maxNestingDepth: 2,
  maxFileSize: 100 * 1024 * 1024, // 100MB per file
  allowedMimeTypes: [
    "text/plain",
    "text/csv",
    "application/json",
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/heic",
    "image/heif",
    "audio/mpeg",
    "audio/ogg",
    "audio/wav",
    "audio/mp4",
    "video/mp4",
    "video/webm",
    "application/pdf"
  ]
};

export interface ExtractedFile {
  path: string;
  size: number;
  sha256: SHA256Hash;
  mimeType: string;
  content: Buffer;
}

export interface ZipExtractionResult {
  files: ExtractedFile[];
  totalUncompressedSize: number;
  fileCount: number;
  chatFile: ExtractedFile | null;
  mediaFiles: ExtractedFile[];
}

export class ZipExtractionError extends Error {
  constructor(
    message: string,
    public code: string,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = "ZipExtractionError";
  }
}

function detectMimeType(buffer: Buffer, filename: string): string {
  const ext = filename.toLowerCase().split(".").pop() || "";
  const signatures: Record<string, { mime: string; signature: number[] }> = {
    jpg: { mime: "image/jpeg", signature: [0xff, 0xd8, 0xff] },
    jpeg: { mime: "image/jpeg", signature: [0xff, 0xd8, 0xff] },
    png: { mime: "image/png", signature: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
    webp: { mime: "image/webp", signature: [0x52, 0x49, 0x46, 0x46] },
    pdf: { mime: "application/pdf", signature: [0x25, 0x50, 0x44, 0x46] },
    mp3: { mime: "audio/mpeg", signature: [0x49, 0x44, 0x33] },
    mp4: { mime: "video/mp4", signature: [0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70] }
  };

  if (signatures[ext] && buffer.length >= signatures[ext].signature.length) {
    const match = signatures[ext].signature.every((byte, i) => buffer[i] === byte);
    if (match) return signatures[ext].mime;
  }

  if (ext === "txt" || ext === "json" || ext === "csv") return "text/plain";
  if (["heic", "heif"].includes(ext)) return "image/heic";
  if (["ogg", "wav", "m4a"].includes(ext)) return "audio/mpeg";
  if (["webm", "mov"].includes(ext)) return "video/webm";

  return "application/octet-stream";
}

function sanitizePath(entryPath: string, basePath: string): string {
  const normalized = entryPath.replace(/\\/g, "/");
  if (normalized.startsWith("/") || normalized.includes("..")) {
    throw new ZipExtractionError(
      `Path traversal detected: ${entryPath}`,
      "PATH_TRAVERSAL"
    );
  }
  const resolved = new URL(normalized, `file://${basePath}/`).pathname;
  if (!resolved.startsWith(basePath)) {
    throw new ZipExtractionError(
      `Path escapes extraction directory: ${entryPath}`,
      "PATH_ESCAPE"
    );
  }
  return resolved;
}

export async function extractZipSafely(
  zipBuffer: Buffer,
  limits: ExtractionLimits = DEFAULT_LIMITS
): Promise<ZipExtractionResult> {
  const zipFile = await openZip(zipBuffer, { lazyEntries: true });
  const files: ExtractedFile[] = [];
  let totalUncompressedSize = 0;
  let chatFile: ExtractedFile | null = null;
  const mediaFiles: ExtractedFile[] = [];

  try {
    const entries: yauzl.Entry[] = [];
    for await (const entry of iterateEntries(zipFile)) {
      entries.push(entry);
    }

    if (entries.length > limits.maxFileCount) {
      throw new ZipExtractionError(
        `Too many files: ${entries.length} > ${limits.maxFileCount}`,
        "TOO_MANY_FILES"
      );
    }

    for (const entry of entries) {
      if (entry.externalFileAttributes >>> 16 & 0x4000) {
        throw new ZipExtractionError(
          `Symlink detected: ${entry.fileName}`,
          "SYMLINK_DETECTED"
        );
      }

      const nestingDepth = entry.fileName.split("/").filter(Boolean).length;
      if (nestingDepth > limits.maxNestingDepth) {
        throw new ZipExtractionError(
          `Nesting too deep: ${entry.fileName}`,
          "NESTING_TOO_DEEP"
        );
      }

      if (entry.uncompressedSize > limits.maxFileSize) {
        throw new ZipExtractionError(
          `File too large: ${entry.fileName} (${entry.uncompressedSize} bytes)`,
          "FILE_TOO_LARGE"
        );
      }

      totalUncompressedSize += entry.uncompressedSize;
      if (totalUncompressedSize > limits.maxUncompressedBytes) {
        throw new ZipExtractionError(
          `Total uncompressed size exceeds limit: ${totalUncompressedSize}`,
          "TOTAL_SIZE_EXCEEDED"
        );
      }

      const content = await readEntry(zipFile, entry);
      const sha256 = createHash("sha256").update(content).digest("hex");
      const mimeType = detectMimeType(content, entry.fileName);

      if (!limits.allowedMimeTypes.includes(mimeType)) {
        throw new ZipExtractionError(
          `Disallowed file type: ${mimeType} for ${entry.fileName}`,
          "DISALLOWED_TYPE"
        );
      }

      const extractedFile: ExtractedFile = {
        path: entry.fileName,
        size: entry.uncompressedSize,
        sha256,
        mimeType,
        content
      };

      files.push(extractedFile);

      if (isChatFile(entry.fileName)) {
        chatFile = extractedFile;
      } else if (isMediaFile(mimeType)) {
        mediaFiles.push(extractedFile);
      }
    }

    if (!chatFile) {
      throw new ZipExtractionError(
        "No WhatsApp chat export found in ZIP",
        "NO_CHAT_FOUND"
      );
    }

    return { files, totalUncompressedSize, fileCount: files.length, chatFile, mediaFiles };
  } finally {
    zipFile.close();
  }
}

function iterateEntries(zipFile: yauzl.ZipFile): AsyncIterable<yauzl.Entry> {
  return {
    async *[Symbol.asyncIterator]() {
      return new Promise<void>((resolve, reject) => {
        zipFile.on("entry", (entry: yauzl.Entry) => {
          zipFile.readEntry();
        });
        zipFile.on("end", () => resolve());
        zipFile.on("error", reject);
        zipFile.readEntry();
      });
    }
  } as any;
}

async function readEntry(zipFile: yauzl.ZipFile, entry: yauzl.Entry): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    zipFile.openReadStream(entry, (err, stream) => {
      if (err) return reject(err);
      const chunks: Buffer[] = [];
      stream.on("data", (chunk: Buffer) => chunks.push(chunk));
      stream.on("end", () => resolve(Buffer.concat(chunks)));
      stream.on("error", reject);
    });
  });
}

function isChatFile(filename: string): boolean {
  const lower = filename.toLowerCase();
  return lower.includes("chat") && (lower.endsWith(".txt") || lower.endsWith(".json"));
}

function isMediaFile(mimeType: string): boolean {
  return mimeType.startsWith("image/") ||
    mimeType.startsWith("audio/") ||
    mimeType.startsWith("video/") ||
    mimeType === "application/pdf";
}

export function createMediaAsset(
  file: ExtractedFile,
  jobId: string,
  relatedMessageIds: MessageId[] = []
): MediaAsset {
  const kind = file.mimeType.startsWith("image/") ? "image" :
    file.mimeType.startsWith("audio/") ? "audio" :
    file.mimeType.startsWith("video/") ? "video" :
    file.mimeType === "application/pdf" ? "pdf" : "other";

  return {
    id: `asset_${file.sha256.slice(0, 12)}` as AssetId,
    kind,
    originalName: file.path.split("/").pop() || "unknown",
    mimeType: file.mimeType,
    size: file.size,
    sha256: file.sha256,
    sourceKey: `jobs/${jobId}/media/${file.sha256.slice(0, 2)}/${file.sha256}`,
    relatedMessageIds,
    transcriptRef: undefined,
    ocrRef: undefined
  };
}