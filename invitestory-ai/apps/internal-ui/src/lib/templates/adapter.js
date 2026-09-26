"use strict";
// Template adapter - deterministic compiler for applying InvitationSpec to template
Object.defineProperty(exports, "__esModule", { value: true });
exports.RajmahalAdapter = exports.BaseTemplateAdapter = exports.TemplateAdapterError = void 0;
exports.createAdapter = createAdapter;
exports.getSupportedComponents = getSupportedComponents;
const registry_js_1 = require("./registry.js");
class TemplateAdapterError extends Error {
    code;
    componentId;
    constructor(message, code, componentId) {
        super(message);
        this.code = code;
        this.componentId = componentId;
        this.name = "TemplateAdapterError";
    }
}
exports.TemplateAdapterError = TemplateAdapterError;
class BaseTemplateAdapter {
    context;
    constructor(context) {
        this.context = context;
    }
    validateCapabilities() {
        for (const component of this.context.spec.components) {
            const { supported, capability } = (0, registry_js_1.validateTemplateCapability)(this.context.template, component.type, component.variant);
            if (!supported) {
                throw new TemplateAdapterError(`Template ${this.context.template.id} does not support ${component.type}:${component.variant}`, "UNSUPPORTED_COMPONENT", component.id);
            }
        }
    }
    getCapability(component) {
        const { capability } = (0, registry_js_1.validateTemplateCapability)(this.context.template, component.type, component.variant);
        return capability;
    }
    findAsset(assetId) {
        return this.context.spec.assets.find(a => a.id === assetId);
    }
    findPerson(personId) {
        return this.context.spec.people.find(p => p.id === personId);
    }
    findVenue(venueId) {
        return this.context.spec.venues.find(v => v.id === venueId);
    }
    getDesignValue(token) {
        const request = this.context.spec.designRequests.find(d => d.target === token || d.target === "global");
        return request?.value;
    }
}
exports.BaseTemplateAdapter = BaseTemplateAdapter;
class RajmahalAdapter extends BaseTemplateAdapter {
    async apply() {
        this.validateCapabilities();
        const changedFiles = [];
        const warnings = [];
        // Apply hero component
        const heroComponent = this.context.spec.components.find(c => c.type === "hero");
        if (heroComponent) {
            const result = await this.applyHero(heroComponent);
            changedFiles.push(...result.changedFiles);
            warnings.push(...result.warnings);
        }
        // Apply event components
        const eventComponents = this.context.spec.components.filter(c => c.type === "event");
        for (const event of eventComponents) {
            const result = await this.applyEvent(event);
            changedFiles.push(...result.changedFiles);
            warnings.push(...result.warnings);
        }
        // Apply gallery
        const galleryComponent = this.context.spec.components.find(c => c.type === "gallery");
        if (galleryComponent) {
            const result = await this.applyGallery(galleryComponent);
            changedFiles.push(...result.changedFiles);
            warnings.push(...result.warnings);
        }
        // Apply RSVP
        const rsvpComponent = this.context.spec.components.find(c => c.type === "rsvp");
        if (rsvpComponent) {
            const result = await this.applyRSVP(rsvpComponent);
            changedFiles.push(...result.changedFiles);
            warnings.push(...result.warnings);
        }
        // Apply music
        const musicComponent = this.context.spec.components.find(c => c.type === "music");
        if (musicComponent) {
            const result = await this.applyMusic(musicComponent);
            changedFiles.push(...result.changedFiles);
            warnings.push(...result.warnings);
        }
        // Apply design tokens
        const designResult = await this.applyDesignTokens();
        changedFiles.push(...designResult.changedFiles);
        warnings.push(...designResult.warnings);
        // Generate diff summary
        const diff = this.generateDiff(changedFiles);
        return { changedFiles, diff, warnings };
    }
    async applyHero(component) {
        const changedFiles = [];
        const warnings = [];
        const personIds = component.data.personIds || [];
        const imageAssetId = component.data.imageAssetId;
        const title = component.data.title;
        const people = personIds.map(id => this.findPerson(id)).filter(Boolean);
        const asset = imageAssetId ? this.findAsset(imageAssetId) : undefined;
        // In a real implementation, this would modify the template files
        // For now, we simulate by creating a data file
        const heroData = {
            people: people.map(p => ({ name: p.displayName, role: p.role })),
            image: asset ? { src: asset.sourceKey, alt: `Photo of ${people.map(p => p.displayName).join(" & ")}` } : null,
            title,
            subtitle: component.data.subtitle || ""
        };
        // Write hero data to workspace
        // await fs.writeFile(path.join(this.context.workspacePath, "src/data/hero.json"), JSON.stringify(heroData, null, 2));
        changedFiles.push("src/data/hero.json");
        return { changedFiles, warnings };
    }
    async applyEvent(component) {
        const changedFiles = [];
        const warnings = [];
        const title = component.data.title;
        const startsAt = component.data.startsAt;
        const endsAt = component.data.endsAt;
        const venueId = component.data.venueId;
        const description = component.data.description;
        const dressCode = component.data.dressCode;
        const venue = venueId ? this.findVenue(venueId) : undefined;
        const eventData = {
            id: component.id,
            variant: component.variant,
            title,
            startsAt,
            endsAt,
            venue: venue ? { name: venue.name, address: venue.address, mapUrl: venue.mapUrl } : null,
            description,
            dressCode
        };
        // await fs.writeFile(path.join(this.context.workspacePath, `src/data/events/${component.id}.json`), JSON.stringify(eventData, null, 2));
        changedFiles.push(`src/data/events/${component.id}.json`);
        return { changedFiles, warnings };
    }
    async applyGallery(component) {
        const changedFiles = [];
        const warnings = [];
        const assetIds = component.data.assetIds || [];
        const assets = assetIds.map(id => this.findAsset(id)).filter(Boolean);
        const columns = component.data.columns || 3;
        const aspectRatio = component.data.aspectRatio || "4:3";
        const galleryData = {
            id: component.id,
            variant: component.variant,
            images: assets.map(a => ({ src: a.sourceKey, alt: `Gallery image` })),
            columns,
            aspectRatio
        };
        // await fs.writeFile(path.join(this.context.workspacePath, `src/data/gallery/${component.id}.json`), JSON.stringify(galleryData, null, 2));
        changedFiles.push(`src/data/gallery/${component.id}.json`);
        return { changedFiles, warnings };
    }
    async applyRSVP(component) {
        const changedFiles = [];
        const warnings = [];
        const url = component.data.url;
        const message = component.data.message || "RSVP";
        const rsvpData = {
            id: component.id,
            variant: component.variant,
            url,
            message,
            buttonText: this.getDesignValue("buttonText") || "RSVP Now"
        };
        // await fs.writeFile(path.join(this.context.workspacePath, `src/data/rsvp/${component.id}.json`), JSON.stringify(rsvpData, null, 2));
        changedFiles.push(`src/data/rsvp/${component.id}.json`);
        return { changedFiles, warnings };
    }
    async applyMusic(component) {
        const changedFiles = [];
        const warnings = [];
        const assetId = component.data.assetId;
        const autoplay = component.data.autoplay || false;
        const asset = assetId ? this.findAsset(assetId) : undefined;
        const musicData = {
            id: component.id,
            variant: component.variant,
            src: asset?.sourceKey,
            autoplay,
            volume: component.data.volume || 0.5
        };
        // await fs.writeFile(path.join(this.context.workspacePath, `src/data/music/${component.id}.json`), JSON.stringify(musicData, null, 2));
        changedFiles.push(`src/data/music/${component.id}.json`);
        return { changedFiles, warnings };
    }
    async applyDesignTokens() {
        const changedFiles = [];
        const warnings = [];
        const tokens = {};
        for (const request of this.context.spec.designRequests) {
            if (request.target === "global" || request.target === "primary") {
                tokens[request.kind === "color" ? "primaryColor" : request.kind] = request.value;
            }
        }
        if (Object.keys(tokens).length > 0) {
            // await fs.writeFile(path.join(this.context.workspacePath, "src/styles/tokens.json"), JSON.stringify(tokens, null, 2));
            changedFiles.push("src/styles/tokens.json");
        }
        return { changedFiles, warnings };
    }
    generateDiff(changedFiles) {
        return `Modified files:\n${changedFiles.map(f => `  M ${f}`).join("\n")}`;
    }
}
exports.RajmahalAdapter = RajmahalAdapter;
function createAdapter(templateId, context) {
    const template = registry_js_1.templateRegistry.getTemplate(templateId);
    if (!template) {
        throw new TemplateAdapterError(`Template not found: ${templateId}`, "TEMPLATE_NOT_FOUND");
    }
    switch (template.id) {
        case "rajmahal":
            return new RajmahalAdapter(context);
        default:
            throw new TemplateAdapterError(`No adapter for template: ${templateId}`, "NO_ADAPTER");
    }
}
function getSupportedComponents(templateId) {
    const template = registry_js_1.templateRegistry.getTemplate(templateId);
    return template?.capabilities || [];
}
//# sourceMappingURL=adapter.js.map