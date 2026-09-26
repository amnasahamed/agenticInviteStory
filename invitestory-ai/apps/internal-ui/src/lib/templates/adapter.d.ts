import { InvitationSpec, TemplateManifest, TemplateCapability, Component, AssetRef, Venue, Person, ComponentId, AssetId, PersonId, VenueId } from "@invitestory/contracts";
export interface AdapterContext {
    spec: InvitationSpec;
    template: TemplateManifest;
    workspacePath: string;
}
export interface AdapterResult {
    changedFiles: string[];
    diff: string;
    warnings: string[];
}
export declare class TemplateAdapterError extends Error {
    code: string;
    componentId?: ComponentId | undefined;
    constructor(message: string, code: string, componentId?: ComponentId | undefined);
}
export declare abstract class BaseTemplateAdapter {
    protected context: AdapterContext;
    constructor(context: AdapterContext);
    abstract apply(): Promise<AdapterResult>;
    protected validateCapabilities(): void;
    protected getCapability(component: Component): TemplateCapability | undefined;
    protected findAsset(assetId: AssetId): AssetRef | undefined;
    protected findPerson(personId: PersonId): Person | undefined;
    protected findVenue(venueId: VenueId): Venue | undefined;
    protected getDesignValue(token: string): unknown;
}
export declare class RajmahalAdapter extends BaseTemplateAdapter {
    apply(): Promise<AdapterResult>;
    private applyHero;
    private applyEvent;
    private applyGallery;
    private applyRSVP;
    private applyMusic;
    private applyDesignTokens;
    private generateDiff;
}
export declare function createAdapter(templateId: string, context: AdapterContext): BaseTemplateAdapter;
export declare function getSupportedComponents(templateId: string): TemplateCapability[];
//# sourceMappingURL=adapter.d.ts.map