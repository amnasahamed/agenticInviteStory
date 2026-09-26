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
export declare class TranscriptionError extends Error {
    code: string;
    retryable: boolean;
    constructor(message: string, code: string, retryable?: boolean);
}
export declare class MockTranscriptionProvider implements TranscriptionProvider {
    transcribe(asset: MediaAsset, audioBuffer: Buffer): Promise<TranscriptionResult>;
    getSupportedFormats(): string[];
    getMaxDurationSec(): number;
}
export declare function createTranscriptionProvider(type?: "mock" | "openai" | "deepgram" | "assemblyai"): TranscriptionProvider;
//# sourceMappingURL=transcription.d.ts.map