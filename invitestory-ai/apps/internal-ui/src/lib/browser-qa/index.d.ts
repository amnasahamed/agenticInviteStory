import { QAReport, JobId, AttemptNumber, SpecRevision, Component, ExactFact } from "@invitestory/contracts";
export type ISODateTime = string;
export interface BrowserQAConfig {
    viewports: {
        mobile: {
            width: number;
            height: number;
        };
        desktop: {
            width: number;
            height: number;
        };
    };
    timeouts: {
        pageLoad: number;
        screenshot: number;
        script: number;
    };
    screenshotPaths: {
        mobile: string;
        desktop: string;
    };
}
export declare const DEFAULT_QA_CONFIG: BrowserQAConfig;
export interface BrowserQAResult {
    qaReport: QAReport;
    screenshots: {
        mobile: Buffer;
        desktop: Buffer;
    };
    domSnapshots: {
        mobile: string;
        desktop: string;
    };
}
export declare class BrowserQAError extends Error {
    code: string;
    retryable: boolean;
    constructor(message: string, code: string, retryable?: boolean);
}
export declare class BrowserQARunner {
    private browser;
    private config;
    constructor(config?: BrowserQAConfig);
    initialize(): Promise<void>;
    runQA(jobId: JobId, attempt: AttemptNumber, specRevision: SpecRevision, previewUrl: string, spec: {
        components: Component[];
        exactFacts: ExactFact[];
    }): Promise<BrowserQAResult>;
    private testViewport;
    private runFactualChecks;
    private checkFactInDOM;
    private countComponentInDOM;
    private buildQAReport;
    close(): Promise<void>;
}
export declare function runBrowserQA(jobId: JobId, attempt: AttemptNumber, specRevision: SpecRevision, previewUrl: string, spec: {
    components: Component[];
    exactFacts: ExactFact[];
}, config?: BrowserQAConfig): Promise<BrowserQAResult>;
//# sourceMappingURL=index.d.ts.map