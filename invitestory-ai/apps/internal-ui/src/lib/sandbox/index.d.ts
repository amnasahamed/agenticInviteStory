import { SandboxProvider, SandboxHandle, SandboxLimits, ExecOptions, ExecResult, PreviewHandle } from "@invitestory/contracts";
export interface SandboxConfig {
    provider: "cloudflare" | "daytona" | "modal" | "e2b" | "local";
    image: string;
    defaultLimits: SandboxLimits;
}
export declare const DEFAULT_SANDBOX_CONFIG: SandboxConfig;
export declare class SandboxError extends Error {
    code: string;
    retryable: boolean;
    constructor(message: string, code: string, retryable?: boolean);
}
export declare abstract class BaseSandboxProvider implements SandboxProvider {
    protected config: SandboxConfig;
    constructor(config?: SandboxConfig);
    abstract create(jobId: string, limits: SandboxLimits): Promise<SandboxHandle>;
    abstract copyTemplate(handle: SandboxHandle, templateRef: string): Promise<void>;
    abstract putInput(handle: SandboxHandle, manifestRef: string): Promise<void>;
    abstract exec(handle: SandboxHandle, argv: string[], options?: ExecOptions): Promise<ExecResult>;
    abstract startPreview(handle: SandboxHandle, argv: string[], port: number): Promise<PreviewHandle>;
    abstract captureArtifacts(handle: SandboxHandle, paths: string[]): Promise<string[]>;
    abstract destroy(handle: SandboxHandle): Promise<void>;
    protected generateHandleId(jobId: string): string;
}
export declare class CloudflareSandboxProvider extends BaseSandboxProvider {
    private activeHandles;
    create(jobId: string, limits: SandboxLimits): Promise<SandboxHandle>;
    copyTemplate(handle: SandboxHandle, templateRef: string): Promise<void>;
    putInput(handle: SandboxHandle, manifestRef: string): Promise<void>;
    exec(handle: SandboxHandle, argv: string[], options?: ExecOptions): Promise<ExecResult>;
    startPreview(handle: SandboxHandle, argv: string[], port: number): Promise<PreviewHandle>;
    captureArtifacts(handle: SandboxHandle, paths: string[]): Promise<string[]>;
    destroy(handle: SandboxHandle): Promise<void>;
    private callCloudflareAPI;
}
export interface CloudflareSandboxHandle extends SandboxHandle {
    containerId?: string;
    previewUrl?: string;
    status: "creating" | "ready" | "preview-running" | "failed" | "destroyed";
}
export declare class LocalSandboxProvider extends BaseSandboxProvider {
    create(jobId: string, limits: SandboxLimits): Promise<SandboxHandle>;
    copyTemplate(handle: SandboxHandle, templateRef: string): Promise<void>;
    putInput(handle: SandboxHandle, manifestRef: string): Promise<void>;
    exec(handle: SandboxHandle, argv: string[], options?: ExecOptions): Promise<ExecResult>;
    startPreview(handle: SandboxHandle, argv: string[], port: number): Promise<PreviewHandle>;
    captureArtifacts(handle: SandboxHandle, paths: string[]): Promise<string[]>;
    destroy(handle: SandboxHandle): Promise<void>;
}
export declare function createSandboxProvider(config?: Partial<SandboxConfig>): SandboxProvider;
//# sourceMappingURL=index.d.ts.map