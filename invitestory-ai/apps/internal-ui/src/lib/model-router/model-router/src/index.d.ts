import { ModelRole, ModelConfig } from "@invitestory/contracts";
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
export declare class ModelRouterError extends Error {
    code: string;
    retryable: boolean;
    constructor(message: string, code: string, retryable?: boolean);
}
export declare class ModelRouter {
    private configs;
    private providers;
    private usageLog;
    constructor();
    private registerDefaultConfigs;
    private registerMockProviders;
    getConfig(role: ModelRole): ModelConfig;
    setConfig(role: ModelRole, config: Partial<ModelConfig>): void;
    call(role: ModelRole, prompt: string, options?: CallOptions): Promise<ModelResponse>;
    private getProviderForModel;
    private callWithTimeout;
    getUsageStats(): Array<{
        role: ModelRole;
        model: string;
        tokens: number;
        cost: number;
        timestamp: Date;
    }>;
    getTotalCost(): number;
    resetUsageLog(): void;
}
export declare const modelRouter: ModelRouter;
export declare function callModel(role: ModelRole, prompt: string, options?: CallOptions): Promise<ModelResponse>;
export declare function getModelConfig(role: ModelRole): ModelConfig;
//# sourceMappingURL=index.d.ts.map