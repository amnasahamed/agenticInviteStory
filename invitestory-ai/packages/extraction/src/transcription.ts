// Transcription service interface and implementations

import { MediaAsset, AssetId, ISODateTimeType } from "@invitestory/contracts";

export type ISODateTime = ISODateTimeType;

export interface TranscriptionSegment {
  startSec: number;
  endSec: number;
  text: string;
  confidence: number;
  language: string;
}

export interface TranscriptionResult {
  assetId: AssetId;
  language: string;
  fullText: string;
  segments: TranscriptionSegment[];
  durationSec: number;
  processedAt: ISODateTime;
  model: string;
}

export interface TranscriptionProvider {
  transcribe(asset: MediaAsset, audioBuffer: Buffer): Promise<TranscriptionResult>;
  getSupportedFormats(): string[];
  getMaxDurationSec(): number;
}

export class TranscriptionError extends Error {
  constructor(
    message: string,
    public code: string,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = "TranscriptionError";
  }
}

export class MockTranscriptionProvider implements TranscriptionProvider {
  async transcribe(asset: MediaAsset, audioBuffer: Buffer): Promise<TranscriptionResult> {
    await new Promise(r => setTimeout(r, 100));
    return {
      assetId: asset.id,
      language: "en-IN",
      fullText: "[Mock transcription] This is a sample voice message about the wedding invitation.",
      segments: [
        { startSec: 0, endSec: 5, text: "[Mock transcription] This is a sample voice message about the wedding invitation.", confidence: 0.9, language: "en-IN" }
      ],
      durationSec: 5,
      processedAt: new Date().toISOString(),
      model: "mock-transcriber-v1"
    };
  }

  getSupportedFormats(): string[] {
    return ["audio/mpeg", "audio/ogg", "audio/wav", "audio/mp4"];
  }

  getMaxDurationSec(): number {
    return 300;
  }
}

export function createTranscriptionProvider(type: "mock" | "openai" | "deepgram" | "assemblyai" = "mock"): TranscriptionProvider {
  switch (type) {
    case "mock":
      return new MockTranscriptionProvider();
    default:
      return new MockTranscriptionProvider();
  }
}