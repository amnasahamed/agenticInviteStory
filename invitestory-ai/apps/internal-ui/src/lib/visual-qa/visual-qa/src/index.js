"use strict";
// Visual QA - baseline comparison and AI review
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VisualQAError = exports.DEFAULT_VISUAL_QA_CONFIG = void 0;
exports.compareWithBaseline = compareWithBaseline;
exports.runAIVisualReview = runAIVisualReview;
const contracts_1 = require("@invitestory/contracts");
const pngjs_1 = require("pngjs");
const pixelmatch_1 = __importDefault(require("pixelmatch"));
function createIssueId(prefix) {
    return (0, contracts_1.createQAIssueId)(`${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`);
}
exports.DEFAULT_VISUAL_QA_CONFIG = {
    threshold: 0.1,
    includeAA: true,
    diffColor: [255, 0, 0],
    minDiffPixels: 100
};
class VisualQAError extends Error {
    code;
    retryable;
    constructor(message, code, retryable = false) {
        super(message);
        this.code = code;
        this.retryable = retryable;
        this.name = "VisualQAError";
    }
}
exports.VisualQAError = VisualQAError;
async function compareWithBaseline(jobId, attempt, generatedScreenshots, baselineScreenshots, spec, config = exports.DEFAULT_VISUAL_QA_CONFIG) {
    const issues = [];
    // Compare mobile
    const mobileResult = compareImages(baselineScreenshots.mobile, generatedScreenshots.mobile, "mobile", config);
    issues.push(...mobileResult.issues);
    // Compare desktop
    const desktopResult = compareImages(baselineScreenshots.desktop, generatedScreenshots.desktop, "desktop", config);
    issues.push(...desktopResult.issues);
    // Check for design request compliance
    const designIssues = checkDesignRequests(generatedScreenshots, spec.designRequests);
    issues.push(...designIssues);
    return {
        issues,
        mobileDiff: mobileResult.diffPixels,
        desktopDiff: desktopResult.diffPixels,
        diffImages: {
            mobile: mobileResult.diffImage,
            desktop: desktopResult.diffImage
        }
    };
}
function compareImages(baseline, generated, viewport, config) {
    const issues = [];
    try {
        const baselineImg = pngjs_1.PNG.sync.read(baseline);
        const generatedImg = pngjs_1.PNG.sync.read(generated);
        // Resize if dimensions differ
        if (baselineImg.width !== generatedImg.width || baselineImg.height !== generatedImg.height) {
            issues.push({
                id: createIssueId(`dimension_mismatch_${viewport}`),
                severity: "major",
                category: "visual",
                message: `Screenshot dimensions differ: baseline ${baselineImg.width}x${baselineImg.height} vs generated ${generatedImg.width}x${generatedImg.height}`,
                screenshotRegion: { x: 0, y: 0, width: generatedImg.width, height: generatedImg.height }
            });
            // Resize generated to match baseline for comparison
            const resized = new pngjs_1.PNG({ width: baselineImg.width, height: baselineImg.height });
            // Simple nearest neighbor resize (in production, use sharp or similar)
            for (let y = 0; y < baselineImg.height; y++) {
                for (let x = 0; x < baselineImg.width; x++) {
                    const srcX = Math.floor(x * generatedImg.width / baselineImg.width);
                    const srcY = Math.floor(y * generatedImg.height / baselineImg.height);
                    const srcIdx = (srcY * generatedImg.width + srcX) * 4;
                    const dstIdx = (y * baselineImg.width + x) * 4;
                    resized.data[dstIdx] = generatedImg.data[srcIdx];
                    resized.data[dstIdx + 1] = generatedImg.data[srcIdx + 1];
                    resized.data[dstIdx + 2] = generatedImg.data[srcIdx + 2];
                    resized.data[dstIdx + 3] = generatedImg.data[srcIdx + 3];
                }
            }
            generatedImg.data = resized.data;
            generatedImg.width = baselineImg.width;
            generatedImg.height = baselineImg.height;
        }
        const diffImg = new pngjs_1.PNG({ width: baselineImg.width, height: baselineImg.height });
        const diffPixels = (0, pixelmatch_1.default)(baselineImg.data, generatedImg.data, diffImg.data, baselineImg.width, baselineImg.height, { threshold: config.threshold, includeAA: config.includeAA, diffColor: config.diffColor });
        const diffImage = pngjs_1.PNG.sync.write(diffImg);
        if (diffPixels > config.minDiffPixels) {
            const diffPercent = (diffPixels / (baselineImg.width * baselineImg.height)) * 100;
            issues.push({
                id: createIssueId(`visual_diff_${viewport}`),
                severity: diffPercent > 5 ? "major" : "minor",
                category: "visual",
                message: `Visual difference detected: ${diffPixels} pixels (${diffPercent.toFixed(2)}%) differ from baseline`,
                screenshotRegion: { x: 0, y: 0, width: baselineImg.width, height: baselineImg.height }
            });
        }
        return { diffPixels, diffImage, issues };
    }
    catch (error) {
        issues.push({
            id: createIssueId(`compare_error_${viewport}`),
            severity: "major",
            category: "visual",
            message: `Failed to compare images: ${error}`
        });
        return { diffPixels: 0, diffImage: null, issues };
    }
}
function checkDesignRequests(screenshots, designRequests) {
    const issues = [];
    for (const request of designRequests) {
        if (request.kind === "color") {
            // In a real implementation, this would analyze the screenshot for color compliance
            // For now, we add a placeholder issue for manual review
            issues.push({
                id: createIssueId(`design_check_${request.id}`),
                severity: "minor",
                category: "visual",
                message: `Design request needs visual verification: ${request.kind} ${request.target} = ${request.value}`,
                suggestedFix: "Verify color/theme matches request in screenshots"
            });
        }
    }
    return issues;
}
async function runAIVisualReview(jobId, attempt, screenshots, baselineScreenshots, spec, referenceImages) {
    // In a real implementation, this would call a vision model (GPT-4V, Claude, etc.)
    // For now, we return a mock result
    await new Promise(r => setTimeout(r, 100));
    const issues = [
        {
            id: createIssueId("ai_review_1"),
            severity: "minor",
            category: "visual",
            message: "AI review: Hero image appears well-cropped and centered",
            screenshotRegion: { x: 0, y: 0, width: 390, height: 400 }
        },
        {
            id: createIssueId("ai_review_2"),
            severity: "info",
            category: "visual",
            message: "AI review: Color scheme matches maroon theme request",
            screenshotRegion: { x: 0, y: 0, width: 390, height: 844 }
        }
    ];
    return {
        issues,
        summary: "Visual review completed. No critical issues found. Minor aesthetic suggestions noted.",
        confidence: 0.85
    };
}
//# sourceMappingURL=index.js.map