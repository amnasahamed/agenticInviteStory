// Template registry and capability manifest

import {
  TemplateManifest,
  TemplateCapability,
  TemplateId,
  ComponentVariant,
  ComponentId
} from "@invitestory/contracts";

export interface TemplateRegistry {
  getTemplate(id: TemplateId): TemplateManifest | undefined;
  registerTemplate(manifest: TemplateManifest): void;
  listTemplates(): TemplateManifest[];
  getSupportedTemplates(): TemplateManifest[];
}

const templates = new Map<TemplateId, TemplateManifest>();

export const templateRegistry: TemplateRegistry = {
  getTemplate(id: TemplateId) {
    return templates.get(id);
  },
  registerTemplate(manifest: TemplateManifest) {
    templates.set(manifest.id, manifest);
  },
  listTemplates() {
    return Array.from(templates.values());
  },
  getSupportedTemplates() {
    return Array.from(templates.values()).filter(t => t.capabilities.length > 0);
  }
};

// Rajmahal template - example from the spec
export const rajmahalTemplate: TemplateManifest = {
  id: "rajmahal" as TemplateId,
  name: "Rajmahal",
  version: "git:abc123",
  capabilityVersion: "2",
  capabilities: [
    {
      componentType: "hero",
      variant: "portrait",
      requiredData: ["personIds", "imageAssetId", "title"],
      optionalData: ["subtitle"],
      assetSlots: [
        { purpose: "hero", aspectRatio: "3:4", required: true }
      ],
      editableTokens: ["primaryColor", "fontFamily", "heroTitleSize"]
    },
    {
      componentType: "hero",
      variant: "landscape",
      requiredData: ["personIds", "imageAssetId", "title"],
      optionalData: ["subtitle"],
      assetSlots: [
        { purpose: "hero", aspectRatio: "16:9", required: true }
      ],
      editableTokens: ["primaryColor", "fontFamily", "heroTitleSize"]
    },
    {
      componentType: "event",
      variant: "ceremony",
      requiredData: ["title", "startsAt", "venueId"],
      optionalData: ["endsAt", "description", "dressCode"],
      assetSlots: [],
      editableTokens: ["eventCardStyle", "dateFormat"]
    },
    {
      componentType: "event",
      variant: "reception",
      requiredData: ["title", "startsAt", "venueId"],
      optionalData: ["endsAt", "description", "dressCode"],
      assetSlots: [],
      editableTokens: ["eventCardStyle", "dateFormat"]
    },
    {
      componentType: "event",
      variant: "mehndi",
      requiredData: ["title", "startsAt", "venueId"],
      optionalData: ["endsAt", "description"],
      assetSlots: [],
      editableTokens: ["eventCardStyle", "dateFormat"]
    },
    {
      componentType: "event",
      variant: "sangeet",
      requiredData: ["title", "startsAt", "venueId"],
      optionalData: ["endsAt", "description"],
      assetSlots: [],
      editableTokens: ["eventCardStyle", "dateFormat"]
    },
    {
      componentType: "gallery",
      variant: "grid",
      requiredData: ["assetIds"],
      optionalData: ["columns", "gap", "aspectRatio"],
      assetSlots: [
        { purpose: "gallery", aspectRatio: "4:3", required: false }
      ],
      editableTokens: ["galleryColumns", "imageBorderRadius"]
    },
    {
      componentType: "gallery",
      variant: "carousel",
      requiredData: ["assetIds"],
      optionalData: ["autoplay", "interval"],
      assetSlots: [
        { purpose: "gallery", aspectRatio: "16:9", required: false }
      ],
      editableTokens: ["carouselAutoplay", "carouselInterval"]
    },
    {
      componentType: "rsvp",
      variant: "whatsapp",
      requiredData: ["url"],
      optionalData: ["message"],
      assetSlots: [],
      editableTokens: ["buttonStyle", "buttonText"]
    },
    {
      componentType: "rsvp",
      variant: "form",
      requiredData: ["url"],
      optionalData: ["fields", "successMessage"],
      assetSlots: [],
      editableTokens: ["formStyle", "submitButtonText"]
    },
    {
      componentType: "music",
      variant: "toggle",
      requiredData: ["assetId"],
      optionalData: ["autoplay", "volume"],
      assetSlots: [
        { purpose: "music", required: true }
      ],
      editableTokens: ["playerStyle"]
    },
    {
      componentType: "music",
      variant: "player",
      requiredData: ["assetId"],
      optionalData: ["autoplay", "loop"],
      assetSlots: [
        { purpose: "music", required: true }
      ],
      editableTokens: ["playerStyle"]
    },
    {
      componentType: "map",
      variant: "embed",
      requiredData: ["venueId"],
      optionalData: ["zoom", "style"],
      assetSlots: [],
      editableTokens: ["mapStyle"]
    },
    {
      componentType: "countdown",
      variant: "timer",
      requiredData: ["targetDate"],
      optionalData: ["timezone", "labels"],
      assetSlots: [],
      editableTokens: ["timerStyle", "digitColor"]
    },
    {
      componentType: "couple",
      variant: "side-by-side",
      requiredData: ["personIds"],
      optionalData: ["descriptions"],
      assetSlots: [
        { purpose: "profile", aspectRatio: "1:1", required: false }
      ],
      editableTokens: ["layout", "imageShape"]
    },
    {
      componentType: "family",
      variant: "grid",
      requiredData: ["personIds"],
      optionalData: ["roles", "descriptions"],
      assetSlots: [
        { purpose: "profile", aspectRatio: "1:1", required: false }
      ],
      editableTokens: ["gridColumns", "cardStyle"]
    }
  ],
  buildCommand: "npm run build",
  previewCommand: "npm run preview",
  installCommand: "npm ci",
  baselineScreenshots: {
    mobile: "templates/rajmahal/baselines/mobile.png",
    desktop: "templates/rajmahal/baselines/desktop.png"
  },
  knownDifferences: [
    "Hero image aspect ratio may vary based on uploaded photo",
    "Gallery layout adapts to number of images",
    "Event count varies per invitation"
  ],
  unsupportedInteractions: [
    "Custom animations beyond CSS transitions",
    "3D effects",
    "Video backgrounds in hero",
    "Real-time guest list updates"
  ],
  adapterEntryPoint: "templates/rajmahal/adapter.ts"
};

// Register the template
templateRegistry.registerTemplate(rajmahalTemplate);

export function createTemplateManifest(
  id: TemplateId,
  name: string,
  version: string,
  capabilityVersion: string,
  capabilities: TemplateCapability[],
  buildCommand: string,
  previewCommand: string,
  installCommand: string,
  baselineScreenshots: { mobile: string; desktop: string },
  adapterEntryPoint: string
): TemplateManifest {
  return {
    id,
    name,
    version,
    capabilityVersion,
    capabilities,
    buildCommand,
    previewCommand,
    installCommand,
    baselineScreenshots,
    knownDifferences: [],
    unsupportedInteractions: [],
    adapterEntryPoint
  };
}

export function validateTemplateCapability(
  template: TemplateManifest,
  componentType: string,
  variant: ComponentVariant
): { supported: boolean; capability?: TemplateCapability } {
  const capability = template.capabilities.find(
    c => c.componentType === componentType && c.variant === variant
  );
  return {
    supported: !!capability,
    capability
  };
}

export function getTemplateCapabilities(template: TemplateManifest): TemplateCapability[] {
  return template.capabilities;
}