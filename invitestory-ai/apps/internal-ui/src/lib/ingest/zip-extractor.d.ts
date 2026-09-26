import { MediaAsset, MessageId } from "@invitestory/contracts";
export type SHA256Hash = string;
export interface ExtractionLimits {
    maxUncompressedBytes: number;
    maxFileCount: number;
    maxNestingDepth: number;
    maxFileSize: number;
    allowedMimeTypes: string[];
}
export declare const DEFAULT_LIMITS: ExtractionLimits;
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
export declare class ZipExtractionError extends Error {
    code: string;
    retryable: boolean;
    constructor(message: string, code: string, retryable?: boolean);
}
export declare function extractZipSafely(zipBuffer: Buffer, limits?: ExtractionLimits): Promise<ZipExtractionResult>;
export declare function createMediaAsset(file: ExtractedFile, jobId: string, relatedMessageIds?: MessageId[]): MediaAsset;
//# sourceMappingURL=zip-extractor.d.ts.map