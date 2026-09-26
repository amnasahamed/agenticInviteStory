import { InvitationSpec, JobId, TemplateId, AssetId, Uncertainty, EvidenceRef, ChatMessage, MediaAsset, ISODateTimeType } from "@invitestory/contracts";
import { TranscriptionResult } from "./transcription";
import { OCRResult, VisionAnalysisResult } from "./ocr-vision";
export type ISODateTime = ISODateTimeType;
export interface ExtractionContext {
    jobId: JobId;
    templateId: TemplateId;
    templateVersion: string;
    capabilityVersion: string;
    chatMessages: ChatMessage[];
    mediaAssets: MediaAsset[];
    transcripts: Map<AssetId, TranscriptionResult>;
    ocrResults: Map<AssetId, OCRResult>;
    visionResults: Map<AssetId, VisionAnalysisResult>;
}
export interface ExtractionResult {
    spec: InvitationSpec;
    uncertainties: Uncertainty[];
    evidenceMap: Map<EvidenceRef, {
        type: "message" | "transcript" | "ocr" | "vision";
        sourceId: string;
        excerpt: string;
    }>;
}
export declare function extractInvitationSpec(context: ExtractionContext): ExtractionResult;
export declare function validateSpec(spec: InvitationSpec): {
    valid: boolean;
    errors: string[];
};
//# sourceMappingURL=spec-extractor.d.ts.map