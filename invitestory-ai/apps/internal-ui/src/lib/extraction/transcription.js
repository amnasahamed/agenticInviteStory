// Transcription service interface and implementations
export class TranscriptionError extends Error {
    code;
    retryable;
    constructor(message, code, retryable = false) {
        super(message);
        this.code = code;
        this.retryable = retryable;
        this.name = "TranscriptionError";
    }
}
export class MockTranscriptionProvider {
    async transcribe(asset, audioBuffer) {
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
    getSupportedFormats() {
        return ["audio/mpeg", "audio/ogg", "audio/wav", "audio/mp4"];
    }
    getMaxDurationSec() {
        return 300;
    }
}
export function createTranscriptionProvider(type = "mock") {
    switch (type) {
        case "mock":
            return new MockTranscriptionProvider();
        default:
            return new MockTranscriptionProvider();
    }
}
//# sourceMappingURL=transcription.js.map