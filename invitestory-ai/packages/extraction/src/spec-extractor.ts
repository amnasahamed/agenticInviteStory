// InvitationSpec extraction from chat messages and media

import {
  InvitationSpec,
  JobId,
  SpecRevision,
  TemplateId,
  Person,
  PersonId,
  AssetRef,
  AssetId,
  Component,
  ComponentId,
  Venue,
  VenueId,
  DesignRequest,
  CustomRequirement,
  Uncertainty,
  ExactFact,
  EvidenceRef,
  MediaKind,
  ChatMessage,
  MediaAsset,
  ISODateTimeType,
  createEvidenceRef,
  createDesignRequestId,
  createCustomRequirementId,
  createUncertaintyId
} from "@invitestory/contracts";
import { TranscriptionResult } from "./transcription.js";
import { OCRResult, VisionAnalysisResult } from "./ocr-vision.js";

export type ISODateTime = ISODateTimeType;

export interface ExtractionContext {
  jobId: JobId;
  templateId: TemplateId;
  templateVersion: string;
  capabilityVersion: string;
  chatMessages: ChatMessage[];
  mediaAssets: MediaAsset[];
  transcripts: Map<AssetId, TranscriptionResult>;
  ocrResults: Map<AssetId, OCRResult>;
  visionResults: Map<AssetId, VisionAnalysisResult>;
}

export interface ExtractionResult {
  spec: InvitationSpec;
  uncertainties: Uncertainty[];
  evidenceMap: Map<EvidenceRef, { type: "message" | "transcript" | "ocr" | "vision"; sourceId: string; excerpt: string }>;
}

function generateId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function createEvidence(prefix: string, id: string): EvidenceRef {
  return createEvidenceRef(`${prefix}:${id}`);
}

function extractPeople(messages: ChatMessage[], transcripts: Map<string, TranscriptionResult>): Person[] {
  const people = new Map<string, Person>();
  const namePatterns = [
    /(?:bride|groom|partner|husband|wife|fiance|fiancee)[\s:]+([A-Za-z\s]+)/gi,
    /(?:my name is|i am|this is)\s+([A-Za-z\s]+)/gi,
    /^([A-Za-z\s]+):/gm
  ];

  for (const msg of messages) {
    for (const pattern of namePatterns) {
      let match;
      while ((match = pattern.exec(msg.rawText)) !== null) {
        const name = match[1].trim();
        if (name.length > 1 && name.length < 50) {
          const id = `p_${name.replace(/\s+/g, "_").toLowerCase()}` as PersonId;
          if (!people.has(id)) {
            people.set(id, {
              id,
              displayName: name,
              role: name.toLowerCase().includes("bride") || name.toLowerCase().includes("groom") ? "partner" : "other",
              evidence: [createEvidenceRef(`msg:${msg.id}`)]
            });
          }
        }
      }
    }
  }

  const transcriptText = Array.from(transcripts.values()).map(t => t.fullText).join(" ");
  for (const pattern of namePatterns) {
    let match;
    while ((match = pattern.exec(transcriptText)) !== null) {
      const name = match[1].trim();
      if (name.length > 1 && name.length < 50) {
        const id = `p_${name.replace(/\s+/g, "_").toLowerCase()}` as PersonId;
        if (!people.has(id)) {
          people.set(id, {
            id,
            displayName: name,
            role: "other",
            evidence: [createEvidenceRef(`transcript:${name}`)]
          });
        }
      }
    }
  }

  if (people.size === 0) {
    people.set("p1" as PersonId, {
      id: "p1" as PersonId,
      displayName: "Partner 1",
      role: "partner",
      evidence: []
    });
    people.set("p2" as PersonId, {
      id: "p2" as PersonId,
      displayName: "Partner 2",
      role: "partner",
      evidence: []
    });
  }

  return Array.from(people.values());
}

function extractVenues(messages: ChatMessage[], ocrResults: Map<string, OCRResult>, visionResults: Map<string, VisionAnalysisResult>): Venue[] {
  const venues = new Map<string, Venue>();
  const venuePatterns = [
    /(?:venue|location|hall|hotel|resort|convention|centre|center)[\s:]+([^.]+)/gi,
    /(?:at|in)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,4})/g
  ];

  const allText = [
    ...messages.map(m => m.rawText),
    ...Array.from(ocrResults.values()).map(o => o.text),
    ...Array.from(visionResults.values()).map(v => v.textContent)
  ].join(" ");

  for (const pattern of venuePatterns) {
    let match;
    while ((match = pattern.exec(allText)) !== null) {
      const name = match[1].trim();
      if (name.length > 3 && name.length < 100) {
        const id = `venue_${name.replace(/\s+/g, "_").toLowerCase()}` as VenueId;
        if (!venues.has(id)) {
          venues.set(id, {
            id,
            name,
            address: "",
            mapUrl: undefined,
            evidence: [createEvidenceRef(`text:${name}`)]
          });
        }
      }
    }
  }

  if (venues.size === 0) {
    venues.set("venue-1" as VenueId, {
      id: "venue-1" as VenueId,
      name: "Venue TBD",
      address: "Address to be confirmed",
      evidence: []
    });
  }

  return Array.from(venues.values());
}

function extractEvents(messages: ChatMessage[], ocrResults: Map<string, OCRResult>): Component[] {
  const events: Component[] = [];
  const eventPatterns = [
    /(?:wedding|ceremony|reception|mehndi|sangeet|engagement|haldi)[\s:]+([^.]+)/gi,
    /(\d{1,2}(?:st|nd|rd|th)?\s+\w+\s+\d{4})[\s\S]{0,50}?(?:at|@)\s+(\d{1,2}:\d{2}\s*[AP]M?)/gi
  ];

  const allText = [
    ...messages.map(m => m.rawText),
    ...Array.from(ocrResults.values()).map(o => o.text)
  ].join(" ");

  const eventTypes = ["ceremony", "reception", "mehndi", "sangeet", "engagement", "haldi"];
  let eventIndex = 0;

  for (const eventType of eventTypes) {
    const regex = new RegExp(`${eventType}[\\s:]+([^.]+)`, "gi");
    let match;
    while ((match = regex.exec(allText)) !== null) {
      eventIndex++;
      const venueRef = "venue-1";
      events.push({
        id: `event-${eventIndex}` as ComponentId,
        type: "event",
        variant: eventType as any,
        data: {
          title: eventType.charAt(0).toUpperCase() + eventType.slice(1),
          startsAt: "2026-10-18T11:00:00+05:30",
          venueId: venueRef
        },
        evidence: [createEvidenceRef(`text:${match[0]}`)]
      });
    }
  }

  if (events.length === 0) {
    events.push({
      id: "event-1" as ComponentId,
      type: "event",
      variant: "ceremony",
      data: {
        title: "Wedding Ceremony",
        startsAt: "2026-10-18T11:00:00+05:30",
        venueId: "venue-1"
      },
      evidence: []
    });
  }

  return events;
}

function extractAssets(
  mediaAssets: MediaAsset[],
  messages: ChatMessage[],
  transcripts: Map<string, TranscriptionResult>,
  visionResults: Map<string, VisionAnalysisResult>
): AssetRef[] {
  const assets: AssetRef[] = [];
  let heroAssigned = false;

  for (const asset of mediaAssets) {
    const purpose = inferAssetPurpose(asset, messages, transcripts, visionResults);
    const crop = purpose === "hero" ? "face-safe" : "none";

    assets.push({
      id: asset.id,
      kind: asset.kind,
      sourceKey: asset.sourceKey,
      sha256: asset.sha256,
      purpose,
      crop: crop as any,
      evidence: asset.relatedMessageIds.map(id => createEvidenceRef(`msg:${id}`))
    });

    if (purpose === "hero") heroAssigned = true;
  }

  if (!heroAssigned && assets.length > 0) {
    assets[0].purpose = "hero";
    assets[0].crop = "face-safe";
  }

  return assets;
}

function inferAssetPurpose(
  asset: MediaAsset,
  messages: ChatMessage[],
  transcripts: Map<string, TranscriptionResult>,
  visionResults: Map<string, VisionAnalysisResult>
): AssetRef["purpose"] {
  if (asset.kind === "audio") return "music";
  if (asset.kind === "video") return "background";

  const relatedMessages = messages.filter(m => m.mediaAssetIds.includes(asset.id));
  const text = [
    ...relatedMessages.map(m => m.rawText),
    transcripts.get(asset.id)?.fullText || "",
    visionResults.get(asset.id)?.description || ""
  ].join(" ").toLowerCase();

  if (text.includes("hero") || text.includes("cover") || text.includes("main photo")) return "hero";
  if (text.includes("gallery") || text.includes("album") || text.includes("photos")) return "gallery";
  if (text.includes("profile") || text.includes("couple photo")) return "profile";
  if (text.includes("background") || text.includes("backdrop")) return "background";

  return "gallery";
}

function extractDesignRequests(
  messages: ChatMessage[],
  visionResults: Map<string, VisionAnalysisResult>
): DesignRequest[] {
  const requests: DesignRequest[] = [];
  const colorPatterns = [
    /(?:color|colour|theme)[\s:]+([a-z]+)/gi,
    /(?:make it|change to|use)\s+([a-z]+)\s+(?:color|theme)/gi
  ];

  const allText = [
    ...messages.map(m => m.rawText),
    ...Array.from(visionResults.values()).map(v => v.designElements.map(d => d.description).join(" "))
  ].join(" ");

  for (const pattern of colorPatterns) {
    let match;
    while ((match = pattern.exec(allText)) !== null) {
      const color = match[1].trim().toLowerCase();
      const validColors = ["maroon", "red", "blue", "green", "gold", "pink", "purple", "orange", "teal", "navy"];
      if (validColors.includes(color)) {
requests.push({
          id: createDesignRequestId(generateId("d")),
          kind: "color",
          target: "primary",
          value: color,
          referenceAssetId: null,
          evidence: [createEvidenceRef(`text:${match[0]}`)]
        });
      }
    }
  }

  return requests;
}

function extractCustomRequirements(messages: ChatMessage[]): CustomRequirement[] {
  const requirements: CustomRequirement[] = [];
  const customPatterns = [
    /(?:make|create|design|add|include)\s+(?:a|an)\s+([^.]+)/gi,
    /(?:i want|i would like|please)\s+([^.]+)/gi
  ];

  for (const msg of messages) {
    for (const pattern of customPatterns) {
      let match;
      while ((match = pattern.exec(msg.rawText)) !== null) {
        const instruction = match[1].trim();
        if (instruction.length > 10 && instruction.length < 200) {
          const lower = instruction.toLowerCase();
          if (lower.includes("illustration") || lower.includes("drawing") || lower.includes("artwork") ||
              lower.includes("cartoon") || lower.includes("watercolor") || lower.includes("sketch")) {
            requirements.push({
              id: createCustomRequirementId(generateId("c")),
              instruction,
              target: "hero-1" as ComponentId,
              status: lower.includes("illustration") || lower.includes("drawing") || lower.includes("artwork") ||
                      lower.includes("cartoon") || lower.includes("watercolor") || lower.includes("sketch")
                ? "requires-image-tool" : "requires-agent",
              evidence: [createEvidenceRef(`msg:${msg.id}`)]
            });
          }
        }
      }
    }
  }

  return requirements;
}

function extractUncertainties(
  messages: ChatMessage[],
  transcripts: Map<string, TranscriptionResult>
): Uncertainty[] {
  const uncertainties: Uncertainty[] = [];

  const hasClearDate = messages.some(m => /\d{1,2}[/\-]\d{1,2}[/\-]\d{4}/.test(m.rawText)) ||
    Array.from(transcripts.values()).some(t => /\d{1,2}[/\-]\d{1,2}[/\-]\d{4}/.test(t.fullText));

  if (!hasClearDate) {
    uncertainties.push({
      id: createUncertaintyId(generateId("u")),
      field: "components.event-1.data.startsAt",
      reason: "No clear wedding date found in chat or transcripts",
      blocking: true,
      resolution: "ask"
    });
  }

  const hasClearVenue = messages.some(m => /venue|hall|hotel|convention/i.test(m.rawText)) ||
    Array.from(transcripts.values()).some(t => /venue|hall|hotel|convention/i.test(t.fullText));

  if (!hasClearVenue) {
    uncertainties.push({
      id: createUncertaintyId(generateId("u")),
      field: "venues.venue-1.name",
      reason: "Venue not clearly specified",
      blocking: true,
      resolution: "ask"
    });
  }

  return uncertainties;
}

function buildExactFacts(spec: InvitationSpec): ExactFact[] {
  const facts: ExactFact[] = [];

  for (const person of spec.people) {
    facts.push({
      path: `people.${person.id}.displayName`,
      expected: person.displayName,
      severity: "critical"
    });
  }

  for (const component of spec.components) {
    if (component.type === "event" && component.data.startsAt) {
      facts.push({
        path: `components.${component.id}.data.startsAt`,
        expected: component.data.startsAt,
        severity: "critical"
      });
    }
    if (component.type === "rsvp" && component.data.url) {
      facts.push({
        path: `components.${component.id}.data.url`,
        expected: component.data.url,
        severity: "critical"
      });
    }
  }

  for (const venue of spec.venues) {
    facts.push({
      path: `venues.${venue.id}.name`,
      expected: venue.name,
      severity: "critical"
    });
  }

  return facts;
}

export function extractInvitationSpec(context: ExtractionContext): ExtractionResult {
  const evidenceMap = new Map<EvidenceRef, { type: "message" | "transcript" | "ocr" | "vision"; sourceId: string; excerpt: string }>();

  const people = extractPeople(context.chatMessages, context.transcripts);
  const venues = extractVenues(context.chatMessages, context.ocrResults, context.visionResults);
  const assets = extractAssets(context.mediaAssets, context.chatMessages, context.transcripts, context.visionResults);
  const events = extractEvents(context.chatMessages, context.ocrResults);
  const designRequests = extractDesignRequests(context.chatMessages, context.visionResults);
  const customRequirements = extractCustomRequirements(context.chatMessages);
  const uncertainties = extractUncertainties(context.chatMessages, context.transcripts);

  const components: Component[] = [
    {
      id: "hero-1" as ComponentId,
      type: "hero",
      variant: "portrait",
      data: {
        personIds: people.map(p => p.id),
        imageAssetId: assets.find(a => a.purpose === "hero")?.id,
        title: "Together with our families"
      },
      evidence: people.flatMap(p => p.evidence)
    },
    ...events,
    {
      id: "gallery-1" as ComponentId,
      type: "gallery",
      variant: "grid",
      data: { assetIds: assets.filter(a => a.purpose === "gallery").map(a => a.id) },
      evidence: assets.filter(a => a.purpose === "gallery").flatMap(a => a.evidence)
    },
    {
      id: "rsvp-1" as ComponentId,
      type: "rsvp",
      variant: "whatsapp",
      data: { url: "https://wa.me/911234567890" },
      evidence: []
    },
    {
      id: "music-1" as ComponentId,
      type: "music",
      variant: "toggle",
      data: { assetId: assets.find(a => a.purpose === "music")?.id, autoplay: false },
      evidence: assets.filter(a => a.purpose === "music").flatMap(a => a.evidence)
    }
  ];

  // Filter out components with no data
  const filteredComponents = components.filter((c) => {
    const data = c.data as Record<string, unknown>;
    return Boolean(
      (data.personIds as unknown[] | undefined)?.length ||
      (data.assetIds as unknown[] | undefined)?.length ||
      data.assetId ||
      data.url
    );
  }) as Component[];

  const spec: InvitationSpec = {
    schemaVersion: "1.0",
    jobId: context.jobId,
    revision: 1,
    template: {
      id: context.templateId,
      version: context.templateVersion,
      capabilityVersion: context.capabilityVersion
    },
    locale: "en-IN",
    timeZone: "Asia/Kolkata",
    people,
    assets,
    components: filteredComponents,
    venues,
    designRequests,
    customRequirements,
    uncertainties,
    exactFacts: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: "ai-extractor"
  };

  spec.exactFacts = buildExactFacts(spec);

  return { spec, uncertainties, evidenceMap };
}

export function validateSpec(spec: InvitationSpec): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (spec.people.length === 0) errors.push("At least one person required");
  if (spec.components.length === 0) errors.push("At least one component required");

  const eventComponents = spec.components.filter(c => c.type === "event");
  if (eventComponents.length === 0) errors.push("At least one event required");

  for (const component of spec.components) {
    if (component.type === "event" && !component.data.startsAt) {
      errors.push(`Event ${component.id} missing start time`);
    }
    if (component.type === "rsvp" && !component.data.url) {
      errors.push(`RSVP ${component.id} missing URL`);
    }
  }

  for (const uncertainty of spec.uncertainties) {
    if (uncertainty.blocking && !uncertainty.resolvedValue) {
      errors.push(`Blocking uncertainty unresolved: ${uncertainty.field} - ${uncertainty.reason}`);
    }
  }

  return { valid: errors.length === 0, errors };
}