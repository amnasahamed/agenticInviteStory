// OCR and Vision service interface and implementations

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
    bbox: { x: number; y: number; width: number; height: number };
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

export class OCRError extends Error {
  constructor(
    message: string,
    public code: string,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = "OCRError";
  }
}

export class VisionError extends Error {
  constructor(
    message: string,
    public code: string,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = "VisionError";
  }
}

export class MockOCRProvider implements OCRProvider {
  async extractText(asset: MediaAsset, imageBuffer: Buffer): Promise<OCRResult> {
    await new Promise(r => setTimeout(r, 50));
    return {
      assetId: asset.id,
      text: "[Mock OCR] Wedding venue: ABC Convention Centre. Date: 18th October 2026. Time: 11:00 AM",
      confidence: 0.85,
      language: "en",
      boundingBoxes: [
        { text: "Wedding venue:", x: 10, y: 10, width: 120, height: 20, confidence: 0.9 },
        { text: "ABC Convention Centre", x: 10, y: 35, width: 200, height: 20, confidence: 0.85 },
        { text: "Date: 18th October 2026", x: 10, y: 60, width: 180, height: 20, confidence: 0.9 },
        { text: "Time: 11:00 AM", x: 10, y: 85, width: 120, height: 20, confidence: 0.9 }
      ],
      processedAt: new Date().toISOString(),
      model: "mock-ocr-v1"
    };
  }

  getSupportedFormats(): string[] {
    return ["image/jpeg", "image/png", "image/webp", "application/pdf"];
  }

  getMaxFileSize(): number {
    return 20 * 1024 * 1024;
  }
}

export class MockVisionProvider implements VisionProvider {
  async analyzeImage(asset: MediaAsset, imageBuffer: Buffer, prompt?: string): Promise<VisionAnalysisResult> {
    await new Promise(r => setTimeout(r, 50));
    return {
      assetId: asset.id,
      description: "A wedding invitation reference image showing maroon color theme with floral decorations",
      detectedObjects: [
        { label: "floral decoration", confidence: 0.9, bbox: { x: 50, y: 50, width: 200, height: 200 } },
        { label: "text", confidence: 0.95, bbox: { x: 10, y: 10, width: 300, height: 100 } }
      ],
      textContent: "Maroon theme wedding invitation",
      designElements: [
        { type: "color", description: "Primary color is maroon/deep red", reference: "hero section background" },
        { type: "font", description: "Elegant serif font for names", reference: "couple names" },
        { type: "layout", description: "Centered layout with decorative borders", reference: "full page" }
      ],
      processedAt: new Date().toISOString(),
      model: "mock-vision-v1"
    };
  }

  getSupportedFormats(): string[] {
    return ["image/jpeg", "image/png", "image/webp"];
  }

  getMaxFileSize(): number {
    return 20 * 1024 * 1024;
  }
}

export function createOCRProvider(type: "mock" | "google" | "aws" | "azure" = "mock"): OCRProvider {
  return new MockOCRProvider();
}

export function createVisionProvider(type: "mock" | "openai" | "anthropic" | "google" = "mock"): VisionProvider {
  return new MockVisionProvider();
}