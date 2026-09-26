"use strict";
// OCR and Vision service interface and implementations
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockVisionProvider = exports.MockOCRProvider = exports.VisionError = exports.OCRError = void 0;
exports.createOCRProvider = createOCRProvider;
exports.createVisionProvider = createVisionProvider;
class OCRError extends Error {
    code;
    retryable;
    constructor(message, code, retryable = false) {
        super(message);
        this.code = code;
        this.retryable = retryable;
        this.name = "OCRError";
    }
}
exports.OCRError = OCRError;
class VisionError extends Error {
    code;
    retryable;
    constructor(message, code, retryable = false) {
        super(message);
        this.code = code;
        this.retryable = retryable;
        this.name = "VisionError";
    }
}
exports.VisionError = VisionError;
class MockOCRProvider {
    async extractText(asset, imageBuffer) {
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
    getSupportedFormats() {
        return ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    }
    getMaxFileSize() {
        return 20 * 1024 * 1024;
    }
}
exports.MockOCRProvider = MockOCRProvider;
class MockVisionProvider {
    async analyzeImage(asset, imageBuffer, prompt) {
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
    getSupportedFormats() {
        return ["image/jpeg", "image/png", "image/webp"];
    }
    getMaxFileSize() {
        return 20 * 1024 * 1024;
    }
}
exports.MockVisionProvider = MockVisionProvider;
function createOCRProvider(type = "mock") {
    return new MockOCRProvider();
}
function createVisionProvider(type = "mock") {
    return new MockVisionProvider();
}
//# sourceMappingURL=ocr-vision.js.map