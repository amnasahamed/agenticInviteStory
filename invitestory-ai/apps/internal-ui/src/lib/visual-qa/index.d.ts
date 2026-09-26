import { QAIssue, JobId, AttemptNumber, Component } from "@invitestory/contracts";
export interface VisualQAConfig {
    threshold: number;
    includeAA: boolean;
    diffColor: [number, number, number];
    minDiffPixels: number;
}
export declare const DEFAULT_VISUAL_QA_CONFIG: VisualQAConfig;
export interface BaselineScreenshots {
    mobile: Buffer;
    desktop: Buffer;
}
export interface VisualQAResult {
    issues: QAIssue[];
    mobileDiff: number;
    desktopDiff: number;
    diffImages: {
        mobile: Buffer | null;
        desktop: Buffer | null;
    };
}
export declare class VisualQAError extends Error {
    code: string;
    retryable: boolean;
    constructor(message: string, code: string, retryable?: boolean);
}
export declare function compareWithBaseline(jobId: JobId, attempt: AttemptNumber, generatedScreenshots: {
    mobile: Buffer;
    desktop: Buffer;
}, baselineScreenshots: BaselineScreenshots, spec: {
    components: Component[];
    designRequests: any[];
}, config?: VisualQAConfig): Promise<VisualQAResult>;
export interface AIReviewResult {
    issues: QAIssue[];
    summary: string;
    confidence: number;
}
export declare function runAIVisualReview(jobId: JobId, attempt: AttemptNumber, screenshots: {
    mobile: Buffer;
    desktop: Buffer;
}, baselineScreenshots: BaselineScreenshots, spec: {
    components: Component[];
    designRequests: any[];
    customRequirements: any[];
}, referenceImages: Buffer[]): Promise<AIReviewResult>;
//# sourceMappingURL=index.d.ts.map