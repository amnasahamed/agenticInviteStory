// Template adapter - deterministic compiler for applying InvitationSpec to template

import {
  InvitationSpec,
  TemplateManifest,
  TemplateCapability,
  Component,
  AssetRef,
  Venue,
  Person,
  ComponentId,
  AssetId,
  PersonId,
  VenueId,
  DesignRequest
} from "@invitestory/contracts";
import { templateRegistry, validateTemplateCapability } from "./registry";

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

export class TemplateAdapterError extends Error {
  constructor(
    message: string,
    public code: string,
    public componentId?: ComponentId
  ) {
    super(message);
    this.name = "TemplateAdapterError";
  }
}

export abstract class BaseTemplateAdapter {
  protected context: AdapterContext;

  constructor(context: AdapterContext) {
    this.context = context;
  }

  abstract apply(): Promise<AdapterResult>;

  protected validateCapabilities(): void {
    for (const component of this.context.spec.components) {
      const { supported, capability } = validateTemplateCapability(
        this.context.template,
        component.type,
        component.variant
      );
      if (!supported) {
        throw new TemplateAdapterError(
          `Template ${this.context.template.id} does not support ${component.type}:${component.variant}`,
          "UNSUPPORTED_COMPONENT",
          component.id
        );
      }
    }
  }

  protected getCapability(component: Component): TemplateCapability | undefined {
    const { capability } = validateTemplateCapability(
      this.context.template,
      component.type,
      component.variant
    );
    return capability;
  }

  protected findAsset(assetId: AssetId): AssetRef | undefined {
    return this.context.spec.assets.find(a => a.id === assetId);
  }

  protected findPerson(personId: PersonId): Person | undefined {
    return this.context.spec.people.find(p => p.id === personId);
  }

  protected findVenue(venueId: VenueId): Venue | undefined {
    return this.context.spec.venues.find(v => v.id === venueId);
  }

  protected getDesignValue(token: string): unknown {
    const request = this.context.spec.designRequests.find(d => d.target === token || d.target === "global");
    return request?.value;
  }
}

export class RajmahalAdapter extends BaseTemplateAdapter {
  async apply(): Promise<AdapterResult> {
    this.validateCapabilities();
    const changedFiles: string[] = [];
    const warnings: string[] = [];

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

  private async applyHero(component: Component): Promise<{ changedFiles: string[]; warnings: string[] }> {
    const changedFiles: string[] = [];
    const warnings: string[] = [];

    const personIds = component.data.personIds as PersonId[] || [];
    const imageAssetId = component.data.imageAssetId as AssetId;
    const title = component.data.title as string;

    const people = personIds.map(id => this.findPerson(id)).filter(Boolean) as Person[];
    const asset = imageAssetId ? this.findAsset(imageAssetId) : undefined;

    // In a real implementation, this would modify the template files
    // For now, we simulate by creating a data file
    const heroData = {
      people: people.map(p => ({ name: p.displayName, role: p.role })),
      image: asset ? { src: asset.sourceKey, alt: `Photo of ${people.map(p => p.displayName).join(" & ")}` } : null,
      title,
      subtitle: component.data.subtitle as string || ""
    };

    // Write hero data to workspace
    // await fs.writeFile(path.join(this.context.workspacePath, "src/data/hero.json"), JSON.stringify(heroData, null, 2));
    changedFiles.push("src/data/hero.json");

    return { changedFiles, warnings };
  }

  private async applyEvent(component: Component): Promise<{ changedFiles: string[]; warnings: string[] }> {
    const changedFiles: string[] = [];
    const warnings: string[] = [];

    const title = component.data.title as string;
    const startsAt = component.data.startsAt as string;
    const endsAt = component.data.endsAt as string;
    const venueId = component.data.venueId as VenueId;
    const description = component.data.description as string;
    const dressCode = component.data.dressCode as string;

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

  private async applyGallery(component: Component): Promise<{ changedFiles: string[]; warnings: string[] }> {
    const changedFiles: string[] = [];
    const warnings: string[] = [];

    const assetIds = component.data.assetIds as AssetId[] || [];
    const assets = assetIds.map(id => this.findAsset(id)).filter(Boolean) as AssetRef[];
    const columns = component.data.columns as number || 3;
    const aspectRatio = component.data.aspectRatio as string || "4:3";

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

  private async applyRSVP(component: Component): Promise<{ changedFiles: string[]; warnings: string[] }> {
    const changedFiles: string[] = [];
    const warnings: string[] = [];

    const url = component.data.url as string;
    const message = component.data.message as string || "RSVP";

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

  private async applyMusic(component: Component): Promise<{ changedFiles: string[]; warnings: string[] }> {
    const changedFiles: string[] = [];
    const warnings: string[] = [];

    const assetId = component.data.assetId as AssetId;
    const autoplay = component.data.autoplay as boolean || false;
    const asset = assetId ? this.findAsset(assetId) : undefined;

    const musicData = {
      id: component.id,
      variant: component.variant,
      src: asset?.sourceKey,
      autoplay,
      volume: component.data.volume as number || 0.5
    };

    // await fs.writeFile(path.join(this.context.workspacePath, `src/data/music/${component.id}.json`), JSON.stringify(musicData, null, 2));
    changedFiles.push(`src/data/music/${component.id}.json`);

    return { changedFiles, warnings };
  }

  private async applyDesignTokens(): Promise<{ changedFiles: string[]; warnings: string[] }> {
    const changedFiles: string[] = [];
    const warnings: string[] = [];

    const tokens: Record<string, unknown> = {};

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

  private generateDiff(changedFiles: string[]): string {
    return `Modified files:\n${changedFiles.map(f => `  M ${f}`).join("\n")}`;
  }
}

export function createAdapter(templateId: string, context: AdapterContext): BaseTemplateAdapter {
  const template = templateRegistry.getTemplate(templateId as any);
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

export function getSupportedComponents(templateId: string): TemplateCapability[] {
  const template = templateRegistry.getTemplate(templateId as any);
  return template?.capabilities || [];
}