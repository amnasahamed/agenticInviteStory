// Model router - routes requests to appropriate models based on role

import {
  ModelRole,
  ModelConfig
} from "@invitestory/contracts";

export interface ModelProviderAdapter {
  call(prompt: string, options: CallOptions): Promise<ModelResponse>;
  getModelName(): string;
  supportsStructuredOutput(): boolean;
}

export interface CallOptions {
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: "text" | "json" | "json_schema";
  schema?: any;
  timeout?: number;
}

export interface ModelResponse {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    costInr: number;
  };
  model: string;
  finishReason: string;
}

export class ModelRouterError extends Error {
  constructor(
    message: string,
    public code: string,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = "ModelRouterError";
  }
}

export class ModelRouter {
  private configs: Map<ModelRole, ModelConfig> = new Map();
  private providers: Map<string, ModelProviderAdapter> = new Map();
  private usageLog: Array<{ role: ModelRole; model: string; tokens: number; cost: number; timestamp: Date }> = [];

  constructor() {
    this.registerDefaultConfigs();
    this.registerMockProviders();
  }

  private registerDefaultConfigs(): void {
    const defaultConfigs: Record<ModelRole, ModelConfig> = {
      transcribe: {
        role: "transcribe",
        primaryModel: "whisper-1",
        fallbackModels: ["whisper-large-v3"],
        contextLimit: 0,
        structuredOutput: false,
        timeoutSec: 120,
        privacyPolicy: "strict",
        perCallBudgetInr: 5
      },
      ocrVision: {
        role: "ocrVision",
        primaryModel: "gpt-4o",
        fallbackModels: ["claude-3-sonnet", "gemini-pro-vision"],
        contextLimit: 128000,
        structuredOutput: true,
        timeoutSec: 60,
        privacyPolicy: "standard",
        perCallBudgetInr: 10
      },
      requirements: {
        role: "requirements",
        primaryModel: "gpt-4o",
        fallbackModels: ["claude-3-sonnet", "gemini-pro"],
        contextLimit: 128000,
        structuredOutput: true,
        timeoutSec: 60,
        privacyPolicy: "standard",
        perCallBudgetInr: 15
      },
      normalCode: {
        role: "normalCode",
        primaryModel: "gpt-4o",
        fallbackModels: ["claude-3-sonnet", "deepseek-coder"],
        contextLimit: 128000,
        structuredOutput: false,
        timeoutSec: 120,
        privacyPolicy: "standard",
        perCallBudgetInr: 20
      },
      complexCode: {
        role: "complexCode",
        primaryModel: "gpt-4o",
        fallbackModels: ["claude-3-opus", "deepseek-coder"],
        contextLimit: 200000,
        structuredOutput: false,
        timeoutSec: 180,
        privacyPolicy: "standard",
        perCallBudgetInr: 50
      },
      visualQA: {
        role: "visualQA",
        primaryModel: "gpt-4o",
        fallbackModels: ["claude-3-sonnet", "gemini-pro-vision"],
        contextLimit: 128000,
        structuredOutput: true,
        timeoutSec: 60,
        privacyPolicy: "standard",
        perCallBudgetInr: 15
      },
      imageEdit: {
        role: "imageEdit",
        primaryModel: "dall-e-3",
        fallbackModels: ["stable-diffusion-xl"],
        contextLimit: 0,
        structuredOutput: false,
        timeoutSec: 60,
        privacyPolicy: "standard",
        perCallBudgetInr: 30
      },
      verification: {
        role: "verification",
        primaryModel: "gpt-4o",
        fallbackModels: ["claude-3-sonnet"],
        contextLimit: 128000,
        structuredOutput: true,
        timeoutSec: 60,
        privacyPolicy: "strict",
        perCallBudgetInr: 10
      }
    };

    for (const [role, config] of Object.entries(defaultConfigs)) {
      this.configs.set(role as ModelRole, config);
    }
  }

  private registerMockProviders(): void {
    this.providers.set("mock", new MockProvider());
    this.providers.set("openai", new MockProvider());
    this.providers.set("anthropic", new MockProvider());
    this.providers.set("google", new MockProvider());
  }

  getConfig(role: ModelRole): ModelConfig {
    const config = this.configs.get(role);
    if (!config) {
      throw new ModelRouterError(`No config for role: ${role}`, "CONFIG_NOT_FOUND");
    }
    return config;
  }

  setConfig(role: ModelRole, config: Partial<ModelConfig>): void {
    const existing = this.configs.get(role);
    if (existing) {
      this.configs.set(role, { ...existing, ...config });
    }
  }

  async call(role: ModelRole, prompt: string, options: CallOptions = {}): Promise<ModelResponse> {
    const config = this.getConfig(role);
    const startTime = Date.now();

    // Try primary model first
    let lastError: Error | null = null;
    const modelsToTry = [config.primaryModel, ...config.fallbackModels];

    for (const modelName of modelsToTry) {
      const provider = this.getProviderForModel(modelName);
      if (!provider) continue;

      try {
        const response = await this.callWithTimeout(
          provider,
          prompt,
          { ...options, timeout: config.timeoutSec * 1000 }
        );

        // Log usage
        this.usageLog.push({
          role,
          model: modelName,
          tokens: response.usage.totalTokens,
          cost: response.usage.costInr,
          timestamp: new Date()
        });

        return response;
      } catch (error) {
        lastError = error as Error;
        // Continue to fallback
      }
    }

    throw new ModelRouterError(
      `All models failed for role ${role}: ${lastError?.message}`,
      "ALL_MODELS_FAILED",
      true
    );
  }

  private getProviderForModel(modelName: string): ModelProviderAdapter | null {
    if (modelName.startsWith("gpt") || modelName.startsWith("whisper") || modelName.startsWith("dall-e")) {
      return this.providers.get("openai") || null;
    }
    if (modelName.startsWith("claude")) {
      return this.providers.get("anthropic") || null;
    }
    if (modelName.startsWith("gemini")) {
      return this.providers.get("google") || null;
    }
    return this.providers.get("mock") || null;
  }

  private async callWithTimeout(
    provider: ModelProviderAdapter,
    prompt: string,
    options: CallOptions
  ): Promise<ModelResponse> {
    const timeout = options.timeout || 60000;
    return Promise.race([
      provider.call(prompt, options),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Model call timeout")), timeout)
      )
    ]);
  }

  getUsageStats(): Array<{ role: ModelRole; model: string; tokens: number; cost: number; timestamp: Date }> {
    return [...this.usageLog];
  }

  getTotalCost(): number {
    return this.usageLog.reduce((sum, entry) => sum + entry.cost, 0);
  }

  resetUsageLog(): void {
    this.usageLog = [];
  }
}

class MockProvider implements ModelProviderAdapter {
  getModelName(): string {
    return "mock-model";
  }

  supportsStructuredOutput(): boolean {
    return true;
  }

  async call(prompt: string, options: CallOptions): Promise<ModelResponse> {
    await new Promise(r => setTimeout(r, 50));

    let content = "Mock response";
    if (options.responseFormat === "json") {
      content = JSON.stringify({ result: "mock", data: {} });
    }

    return {
      content,
      usage: {
        promptTokens: Math.floor(prompt.length / 4),
        completionTokens: Math.floor(content.length / 4),
        totalTokens: Math.floor((prompt.length + content.length) / 4),
        costInr: 0.1
      },
      model: this.getModelName(),
      finishReason: "stop"
    };
  }
}

export const modelRouter = new ModelRouter();

export async function callModel(role: ModelRole, prompt: string, options?: CallOptions): Promise<ModelResponse> {
  return modelRouter.call(role, prompt, options);
}

export function getModelConfig(role: ModelRole): ModelConfig {
  return modelRouter.getConfig(role);
}