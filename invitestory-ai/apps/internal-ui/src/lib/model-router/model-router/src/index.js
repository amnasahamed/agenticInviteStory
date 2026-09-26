"use strict";
// Model router - routes requests to appropriate models based on role
Object.defineProperty(exports, "__esModule", { value: true });
exports.modelRouter = exports.ModelRouter = exports.ModelRouterError = void 0;
exports.callModel = callModel;
exports.getModelConfig = getModelConfig;
class ModelRouterError extends Error {
    code;
    retryable;
    constructor(message, code, retryable = false) {
        super(message);
        this.code = code;
        this.retryable = retryable;
        this.name = "ModelRouterError";
    }
}
exports.ModelRouterError = ModelRouterError;
class ModelRouter {
    configs = new Map();
    providers = new Map();
    usageLog = [];
    constructor() {
        this.registerDefaultConfigs();
        this.registerMockProviders();
    }
    registerDefaultConfigs() {
        const defaultConfigs = {
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
            this.configs.set(role, config);
        }
    }
    registerMockProviders() {
        this.providers.set("mock", new MockProvider());
        this.providers.set("openai", new MockProvider());
        this.providers.set("anthropic", new MockProvider());
        this.providers.set("google", new MockProvider());
    }
    getConfig(role) {
        const config = this.configs.get(role);
        if (!config) {
            throw new ModelRouterError(`No config for role: ${role}`, "CONFIG_NOT_FOUND");
        }
        return config;
    }
    setConfig(role, config) {
        const existing = this.configs.get(role);
        if (existing) {
            this.configs.set(role, { ...existing, ...config });
        }
    }
    async call(role, prompt, options = {}) {
        const config = this.getConfig(role);
        const startTime = Date.now();
        // Try primary model first
        let lastError = null;
        const modelsToTry = [config.primaryModel, ...config.fallbackModels];
        for (const modelName of modelsToTry) {
            const provider = this.getProviderForModel(modelName);
            if (!provider)
                continue;
            try {
                const response = await this.callWithTimeout(provider, prompt, { ...options, timeout: config.timeoutSec * 1000 });
                // Log usage
                this.usageLog.push({
                    role,
                    model: modelName,
                    tokens: response.usage.totalTokens,
                    cost: response.usage.costInr,
                    timestamp: new Date()
                });
                return response;
            }
            catch (error) {
                lastError = error;
                // Continue to fallback
            }
        }
        throw new ModelRouterError(`All models failed for role ${role}: ${lastError?.message}`, "ALL_MODELS_FAILED", true);
    }
    getProviderForModel(modelName) {
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
    async callWithTimeout(provider, prompt, options) {
        const timeout = options.timeout || 60000;
        return Promise.race([
            provider.call(prompt, options),
            new Promise((_, reject) => setTimeout(() => reject(new Error("Model call timeout")), timeout))
        ]);
    }
    getUsageStats() {
        return [...this.usageLog];
    }
    getTotalCost() {
        return this.usageLog.reduce((sum, entry) => sum + entry.cost, 0);
    }
    resetUsageLog() {
        this.usageLog = [];
    }
}
exports.ModelRouter = ModelRouter;
class MockProvider {
    getModelName() {
        return "mock-model";
    }
    supportsStructuredOutput() {
        return true;
    }
    async call(prompt, options) {
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
exports.modelRouter = new ModelRouter();
async function callModel(role, prompt, options) {
    return exports.modelRouter.call(role, prompt, options);
}
function getModelConfig(role) {
    return exports.modelRouter.getConfig(role);
}
//# sourceMappingURL=index.js.map