import { TemplateManifest, TemplateCapability, TemplateId, ComponentVariant } from "@invitestory/contracts";
export interface TemplateRegistry {
    getTemplate(id: TemplateId): TemplateManifest | undefined;
    registerTemplate(manifest: TemplateManifest): void;
    listTemplates(): TemplateManifest[];
    getSupportedTemplates(): TemplateManifest[];
}
export declare const templateRegistry: TemplateRegistry;
export declare const rajmahalTemplate: TemplateManifest;
export declare function createTemplateManifest(id: TemplateId, name: string, version: string, capabilityVersion: string, capabilities: TemplateCapability[], buildCommand: string, previewCommand: string, installCommand: string, baselineScreenshots: {
    mobile: string;
    desktop: string;
}, adapterEntryPoint: string): TemplateManifest;
export declare function validateTemplateCapability(template: TemplateManifest, componentType: string, variant: ComponentVariant): {
    supported: boolean;
    capability?: TemplateCapability;
};
export declare function getTemplateCapabilities(template: TemplateManifest): TemplateCapability[];
//# sourceMappingURL=registry.d.ts.map