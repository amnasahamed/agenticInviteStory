// SandboxProvider interface and Cloudflare Sandbox implementation

import {
  SandboxProvider,
  SandboxHandle,
  SandboxLimits,
  ExecOptions,
  ExecResult,
  PreviewHandle
} from "@invitestory/contracts";

export interface SandboxConfig {
  provider: "cloudflare" | "daytona" | "modal" | "e2b" | "local";
  image: string;
  defaultLimits: SandboxLimits;
}

export const DEFAULT_SANDBOX_CONFIG: SandboxConfig = {
  provider: "cloudflare",
  image: "invitestory/sandbox:node20-chromium-ffmpeg",
  defaultLimits: {
    cpu: 2,
    memoryMb: 4096,
    timeoutSec: 600
  }
};

export class SandboxError extends Error {
  constructor(
    message: string,
    public code: string,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = "SandboxError";
  }
}

export abstract class BaseSandboxProvider implements SandboxProvider {
  protected config: SandboxConfig;

  constructor(config: SandboxConfig = DEFAULT_SANDBOX_CONFIG) {
    this.config = config;
  }

  abstract create(jobId: string, limits: SandboxLimits): Promise<SandboxHandle>;
  abstract copyTemplate(handle: SandboxHandle, templateRef: string): Promise<void>;
  abstract putInput(handle: SandboxHandle, manifestRef: string): Promise<void>;
  abstract exec(handle: SandboxHandle, argv: string[], options?: ExecOptions): Promise<ExecResult>;
  abstract startPreview(handle: SandboxHandle, argv: string[], port: number): Promise<PreviewHandle>;
  abstract captureArtifacts(handle: SandboxHandle, paths: string[]): Promise<string[]>;
  abstract destroy(handle: SandboxHandle): Promise<void>;

  protected generateHandleId(jobId: string): string {
    return `sandbox_${jobId}_${Date.now().toString(36)}`;
  }
}

export class CloudflareSandboxProvider extends BaseSandboxProvider {
  private activeHandles = new Map<string, CloudflareSandboxHandle>();

  async create(jobId: string, limits: SandboxLimits): Promise<SandboxHandle> {
    const handleId = this.generateHandleId(jobId);
    const handle: CloudflareSandboxHandle = {
      id: handleId,
      jobId,
      limits,
      status: "creating",
      containerId: undefined,
      previewUrl: undefined
    };

    try {
      // In real implementation, this would call Cloudflare Sandbox API
      // await this.callCloudflareAPI("create", { jobId, limits, image: this.config.image });
      
      handle.status = "ready";
      handle.containerId = `cf-container-${handleId}`;
      this.activeHandles.set(handleId, handle);
      
      return handle;
    } catch (error) {
      handle.status = "failed";
      throw new SandboxError(
        `Failed to create sandbox: ${error}`,
        "SANDBOX_CREATE_FAILED",
        true
      );
    }
  }

  async copyTemplate(handle: SandboxHandle, templateRef: string): Promise<void> {
    const cfHandle = this.activeHandles.get(handle.id);
    if (!cfHandle) throw new SandboxError("Handle not found", "HANDLE_NOT_FOUND");

    try {
      // In real implementation, copy template from R2 or Git to sandbox
      // await this.callCloudflareAPI("copy", { handleId: handle.id, templateRef });
    } catch (error) {
      throw new SandboxError(
        `Failed to copy template: ${error}`,
        "TEMPLATE_COPY_FAILED",
        true
      );
    }
  }

  async putInput(handle: SandboxHandle, manifestRef: string): Promise<void> {
    const cfHandle = this.activeHandles.get(handle.id);
    if (!cfHandle) throw new SandboxError("Handle not found", "HANDLE_NOT_FOUND");

    try {
      // In real implementation, put input manifest into sandbox
      // await this.callCloudflareAPI("putInput", { handleId: handle.id, manifestRef });
    } catch (error) {
      throw new SandboxError(
        `Failed to put input: ${error}`,
        "INPUT_PUT_FAILED",
        true
      );
    }
  }

  async exec(handle: SandboxHandle, argv: string[], options?: ExecOptions): Promise<ExecResult> {
    const cfHandle = this.activeHandles.get(handle.id);
    if (!cfHandle) throw new SandboxError("Handle not found", "HANDLE_NOT_FOUND");

    try {
      // In real implementation, execute command in sandbox
      // const result = await this.callCloudflareAPI("exec", { handleId: handle.id, argv, options });
      
      // Simulated result
      return {
        exitCode: 0,
        stdout: `Executed: ${argv.join(" ")}`,
        stderr: "",
        durationMs: 1000
      };
    } catch (error) {
      throw new SandboxError(
        `Execution failed: ${error}`,
        "EXEC_FAILED",
        false
      );
    }
  }

  async startPreview(handle: SandboxHandle, argv: string[], port: number): Promise<PreviewHandle> {
    const cfHandle = this.activeHandles.get(handle.id);
    if (!cfHandle) throw new SandboxError("Handle not found", "HANDLE_NOT_FOUND");

    try {
      // In real implementation, start preview server and expose port
      // const preview = await this.callCloudflareAPI("startPreview", { handleId: handle.id, argv, port });
      
      const previewUrl = `https://${handle.id}.preview.invitestory.dev`;
      cfHandle.previewUrl = previewUrl;
      cfHandle.status = "preview-running";

      return {
        url: previewUrl,
        port,
        processId: Date.now()
      };
    } catch (error) {
      throw new SandboxError(
        `Failed to start preview: ${error}`,
        "PREVIEW_START_FAILED",
        true
      );
    }
  }

  async captureArtifacts(handle: SandboxHandle, paths: string[]): Promise<string[]> {
    const cfHandle = this.activeHandles.get(handle.id);
    if (!cfHandle) throw new SandboxError("Handle not found", "HANDLE_NOT_FOUND");

    try {
      // In real implementation, capture artifacts from sandbox to R2
      // const artifacts = await this.callCloudflareAPI("capture", { handleId: handle.id, paths });
      
      return paths.map(p => `jobs/${cfHandle.jobId}/attempts/${Date.now()}/artifacts/${p}`);
    } catch (error) {
      throw new SandboxError(
        `Failed to capture artifacts: ${error}`,
        "ARTIFACT_CAPTURE_FAILED",
        true
      );
    }
  }

  async destroy(handle: SandboxHandle): Promise<void> {
    const cfHandle = this.activeHandles.get(handle.id);
    if (!cfHandle) return;

    try {
      // In real implementation, destroy sandbox
      // await this.callCloudflareAPI("destroy", { handleId: handle.id });
      
      cfHandle.status = "destroyed";
      this.activeHandles.delete(handle.id);
    } catch (error) {
      throw new SandboxError(
        `Failed to destroy sandbox: ${error}`,
        "SANDBOX_DESTROY_FAILED",
        true
      );
    }
  }

  private async callCloudflareAPI(action: string, payload: any): Promise<any> {
    // Placeholder for actual Cloudflare Sandbox API calls
    // This would use the Cloudflare Sandbox SDK
    return {};
  }
}

export interface CloudflareSandboxHandle extends SandboxHandle {
  containerId?: string;
  previewUrl?: string;
  status: "creating" | "ready" | "preview-running" | "failed" | "destroyed";
}

export class LocalSandboxProvider extends BaseSandboxProvider {
  // Local implementation for development/testing using Docker or similar
  async create(jobId: string, limits: SandboxLimits): Promise<SandboxHandle> {
    return {
      id: this.generateHandleId(jobId),
      jobId,
      limits
    };
  }

  async copyTemplate(handle: SandboxHandle, templateRef: string): Promise<void> {}
  async putInput(handle: SandboxHandle, manifestRef: string): Promise<void> {}
  
  async exec(handle: SandboxHandle, argv: string[], options?: ExecOptions): Promise<ExecResult> {
    return { exitCode: 0, stdout: "", stderr: "", durationMs: 0 };
  }

  async startPreview(handle: SandboxHandle, argv: string[], port: number): Promise<PreviewHandle> {
    return { url: `http://localhost:${port}`, port, processId: 0 };
  }

  async captureArtifacts(handle: SandboxHandle, paths: string[]): Promise<string[]> {
    return paths;
  }

  async destroy(handle: SandboxHandle): Promise<void> {}
}

export function createSandboxProvider(config?: Partial<SandboxConfig>): SandboxProvider {
  const fullConfig = { ...DEFAULT_SANDBOX_CONFIG, ...config };
  
  switch (fullConfig.provider) {
    case "cloudflare":
      return new CloudflareSandboxProvider(fullConfig);
    case "local":
      return new LocalSandboxProvider(fullConfig);
    default:
      return new CloudflareSandboxProvider(fullConfig);
  }
}