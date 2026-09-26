"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createVisionProvider = exports.createOCRProvider = exports.MockVisionProvider = exports.MockOCRProvider = exports.VisionError = exports.OCRError = exports.createTranscriptionProvider = exports.MockTranscriptionProvider = exports.TranscriptionError = void 0;
var transcription_1 = require("./transcription");
Object.defineProperty(exports, "TranscriptionError", { enumerable: true, get: function () { return transcription_1.TranscriptionError; } });
Object.defineProperty(exports, "MockTranscriptionProvider", { enumerable: true, get: function () { return transcription_1.MockTranscriptionProvider; } });
Object.defineProperty(exports, "createTranscriptionProvider", { enumerable: true, get: function () { return transcription_1.createTranscriptionProvider; } });
var ocr_vision_1 = require("./ocr-vision");
Object.defineProperty(exports, "OCRError", { enumerable: true, get: function () { return ocr_vision_1.OCRError; } });
Object.defineProperty(exports, "VisionError", { enumerable: true, get: function () { return ocr_vision_1.VisionError; } });
Object.defineProperty(exports, "MockOCRProvider", { enumerable: true, get: function () { return ocr_vision_1.MockOCRProvider; } });
Object.defineProperty(exports, "MockVisionProvider", { enumerable: true, get: function () { return ocr_vision_1.MockVisionProvider; } });
Object.defineProperty(exports, "createOCRProvider", { enumerable: true, get: function () { return ocr_vision_1.createOCRProvider; } });
Object.defineProperty(exports, "createVisionProvider", { enumerable: true, get: function () { return ocr_vision_1.createVisionProvider; } });
__exportStar(require("./spec-extractor"), exports);
//# sourceMappingURL=index.js.map