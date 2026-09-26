import { MediaAsset, AssetId, ISODateTimeType } from "@invitestory/contracts";
export type ISODateTime = ISODateTimeType;
export interface OCRResult {
    assetId: AssetId;
    text: string;
    confidence: number;
    language: string;
    boundingBoxes: Array<{
        text: string;
        x: number;
        y: number;
        width: number;
        height: number;
        confidence: number;
    }>;
    processedAt: ISODateTime;
    model: string;
}
export interface VisionAnalysisResult {
    assetId: AssetId;
    description: string;
    detectedObjects: Array<{
        label: string;
        confidence: number;
        bbox: {
            x: number;
            y: number;
            width: number;
            height: number;
        };
    }>;
    textContent: string;
    designElements: Array<{
        type: "color" | "font" | "layout" | "decoration";
        description: string;
        reference: string;
    }>;
    processedAt: ISODateTime;
    model: string;
}
export interface OCRProvider {
    extractText(asset: MediaAsset, imageBuffer: Buffer): Promise<OCRResult>;
    getSupportedFormats(): string[];
    getMaxFileSize(): number;
}
export interface VisionProvider {
    analyzeImage(asset: MediaAsset, imageBuffer: Buffer, prompt?: string): Promise<VisionAnalysisResult>;
    getSupportedFormats(): string[];
    getMaxFileSize(): number;
}
export declare class OCRError extends Error {
    code: string;
    retryable: boolean;
    constructor(message: string, code: string, retryable?: boolean);
}
export declare class VisionError extends Error {
    code: string;
    retryable: boolean;
    constructor(message: string, code: string, retryable?: boolean);
}
export declare class MockOCRProvider implements OCRProvider {
    extractText(asset: MediaAsset, imageBuffer: Buffer): Promise<OCRResult>;
    getSupportedFormats(): string[];
    getMaxFileSize(): number;
}
export declare class MockVisionProvider implements VisionProvider {
    analyzeImage(asset: MediaAsset, imageBuffer: Buffer, prompt?: string): Promise<VisionAnalysisResult>;
    getSupportedFormats(): string[];
    getMaxFileSize(): number;
}
export declare function createOCRProvider(type?: "mock" | "google" | "aws" | "azure"): OCRProvider;
export declare function createVisionProvider(type?: "mock" | "openai" | "anthropic" | "google"): VisionProvider;
//# sourceMappingURL=ocr-vision.d.ts.map