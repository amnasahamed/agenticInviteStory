import { z } from "zod";

// ============================================================================
// Base types and utilities
// ============================================================================

export const ISODateTime = z.string().datetime({ offset: true });
export const SHA256Hash = z.string().regex(/^[a-f0-9]{64}$/);
export const ULID = z.string().regex(/^[0-9A-HJKMNP-TV-Z]{26}$/);

export const JobId = z.string().brand("JobId");
export const SpecRevision = z.number().int().positive();
export const AttemptNumber = z.number().int().positive();
export const TemplateId = z.string().brand("TemplateId");
export const AssetId = z.string().brand("AssetId");
export const PersonId = z.string().brand("PersonId");
export const ComponentId = z.string().brand("ComponentId");
export const VenueId = z.string().brand("VenueId");
export const MessageId = z.string().brand("MessageId");
export const EvidenceRef = z.string().brand("EvidenceRef");

export type JobId = z.infer<typeof JobId>;
export type SpecRevision = z.infer<typeof SpecRevision>;
export type AttemptNumber = z.infer<typeof AttemptNumber>;
export type TemplateId = z.infer<typeof TemplateId>;
export type AssetId = z.infer<typeof AssetId>;
export type PersonId = z.infer<typeof PersonId>;
export type ComponentId = z.infer<typeof ComponentId>;
export type VenueId = z.infer<typeof VenueId>;
export type MessageId = z.infer<typeof MessageId>;
export type EvidenceRef = z.infer<typeof EvidenceRef>;

// ============================================================================
// Job and state machine
// ============================================================================

export const JobState = z.enum([
  "RECEIVED",
  "INGESTING",
  "EXTRACTING",
  "VALIDATING",
  "NEEDS_INPUT",
  "READY_TO_BUILD",
  "BUILDING",
  "BUILD_FAILED",
  "BROWSER_QA",
  "QA_FAILED",
  "REPAIRING",
  "QA_PASSED",
  "READY_FOR_STAFF",
  "APPROVED",
  "PUSHING_GIT",
  "DEPLOYING",
  "COMPLETED",
  "CANCELLED",
  "ESCALATED",
  "FAILED"
]);

export type JobState = z.infer<typeof JobState>;

export const Job = z.object({
  jobId: JobId,
  state: JobState,
  template: z.object({
    id: TemplateId,
    version: z.string(), // git commit hash or version tag
    capabilityVersion: z.string()
  }),
  historicalOrderId: z.string().optional(),
  createdBy: z.string(),
  createdAt: ISODateTime,
  updatedAt: ISODateTime,
  approvedSpecRevision: SpecRevision.nullable(),
  currentAttempt: AttemptNumber,
  inputHash: SHA256Hash,
  uploadKeys: z.object({
    originalZip: z.string(),
    extras: z.array(z.string()).default([])
  }),
  usage: z.object({
    modelCostInr: z.number().default(0),
    sandboxSeconds: z.number().default(0),
    humanReviewSeconds: z.number().nullable()
  }).default({ modelCostInr: 0, sandboxSeconds: 0, humanReviewSeconds: null }),
  error: z.object({
    code: z.string(),
    message: z.string(),
    retryable: z.boolean()
  }).nullable(),
  transitionLog: z.array(z.object({
    from: JobState,
    to: JobState,
    actor: z.string(),
    timestamp: ISODateTime,
    reason: z.string().optional(),
    specRevision: SpecRevision.optional(),
    attempt: AttemptNumber.optional()
  })).default([])
});

export type Job = z.infer<typeof Job>;

export const CreateJobInput = z.object({
  templateId: TemplateId,
  historicalOrderId: z.string().optional(),
  idempotencyKey: z.string()
});

export type CreateJobInput = z.infer<typeof CreateJobInput>;

// ============================================================================
// Media and ingestion
// ============================================================================

export const MediaKind = z.enum(["image", "audio", "video", "pdf", "document", "other"]);

export type MediaKind = z.infer<typeof MediaKind>;

export const MediaAsset = z.object({
  id: AssetId,
  kind: MediaKind,
  originalName: z.string(),
  mimeType: z.string(),
  size: z.number().int().positive(),
  sha256: SHA256Hash,
  sourceKey: z.string(), // R2 key
  relatedMessageIds: z.array(MessageId).default([]),
  transcriptRef: z.string().optional(), // R2 key for transcript
  ocrRef: z.string().optional() // R2 key for OCR result
});

export type MediaAsset = z.infer<typeof MediaAsset>;

export const ChatMessage = z.object({
  id: MessageId,
  timestamp: ISODateTime,
  sender: z.string(),
  rawText: z.string(),
  mediaAssetIds: z.array(AssetId).default([]),
  isVoice: z.boolean().default(false),
  voiceDurationSec: z.number().optional()
});

export type ChatMessage = z.infer<typeof ChatMessage>;

export const MediaManifest = z.object({
  jobId: JobId,
  chatMessages: z.array(ChatMessage),
  assets: z.array(MediaAsset),
  extractedAt: ISODateTime,
  extractorVersion: z.string()
});

export type MediaManifest = z.infer<typeof MediaManifest>;

// ============================================================================
// InvitationSpec - the core specification
// ============================================================================

export const Person = z.object({
  id: PersonId,
  displayName: z.string().min(1),
  role: z.enum(["partner", "parent", "sibling", "friend", "other"]),
  evidence: z.array(EvidenceRef).default([])
});

export type Person = z.infer<typeof Person>;

export const Venue = z.object({
  id: VenueId,
  name: z.string().min(1),
  address: z.string(),
  mapUrl: z.string().url().optional(),
  evidence: z.array(EvidenceRef).default([])
});

export type Venue = z.infer<typeof Venue>;

export const AssetRef = z.object({
  id: AssetId,
  kind: MediaKind,
  sourceKey: z.string(),
  sha256: SHA256Hash,
  purpose: z.enum(["hero", "gallery", "profile", "background", "music", "other"]),
  crop: z.enum(["face-safe", "center", "custom", "none"]).default("face-safe"),
  cropParams: z.object({ x: z.number(), y: z.number(), width: z.number(), height: z.number() }).optional(),
  evidence: z.array(EvidenceRef).default([])
});

export type AssetRef = z.infer<typeof AssetRef>;

export const ComponentVariant = z.union([
  z.literal("portrait"),
  z.literal("landscape"),
  z.literal("ceremony"),
  z.literal("reception"),
  z.literal("mehndi"),
  z.literal("sangeet"),
  z.literal("grid"),
  z.literal("carousel"),
  z.literal("masonry"),
  z.literal("whatsapp"),
  z.literal("form"),
  z.literal("toggle"),
  z.literal("player"),
  z.literal("embed"),
  z.literal("timer"),
  z.literal("side-by-side")
]);

export type ComponentVariant = z.infer<typeof ComponentVariant>;

export const Component = z.object({
  id: ComponentId,
  type: z.enum([
    "hero",
    "event",
    "gallery",
    "rsvp",
    "music",
    "map",
    "countdown",
    "couple",
    "family",
    "story",
    "note",
    "custom"
  ]),
  variant: ComponentVariant,
  data: z.record(z.unknown()),
  evidence: z.array(EvidenceRef).default([])
});

export type Component = z.infer<typeof Component>;

export const DesignRequest = z.object({
  id: z.string().brand("DesignRequestId"),
  kind: z.enum(["color", "font", "layout", "animation", "effect", "custom"]),
  target: z.string(), // component ID or "global"
  value: z.unknown(),
  referenceAssetId: AssetId.nullable(),
  evidence: z.array(EvidenceRef).default([])
});

export type DesignRequest = z.infer<typeof DesignRequest>;

export const CustomRequirement = z.object({
  id: z.string().brand("CustomRequirementId"),
  instruction: z.string(),
  target: ComponentId,
  status: z.enum(["pending", "requires-agent", "requires-image-tool", "in-progress", "done", "blocked"]),
  evidence: z.array(EvidenceRef).default([])
});

export type CustomRequirement = z.infer<typeof CustomRequirement>;

export const Uncertainty = z.object({
  id: z.string().brand("UncertaintyId"),
  field: z.string(), // JSON path like "components.event-1.data.startsAt"
  reason: z.string(),
  blocking: z.boolean(),
  resolution: z.enum(["omit", "ask", "infer", "use-default"]).optional(),
  resolvedValue: z.unknown().optional()
});

export type Uncertainty = z.infer<typeof Uncertainty>;

export const ExactFact = z.object({
  path: z.string(), // JSON path
  expected: z.unknown(),
  severity: z.enum(["critical", "major", "minor"])
});

export type ExactFact = z.infer<typeof ExactFact>;

export const InvitationSpec = z.object({
  schemaVersion: z.string().default("1.0"),
  jobId: JobId,
  revision: SpecRevision,
  template: z.object({
    id: TemplateId,
    version: z.string(),
    capabilityVersion: z.string()
  }),
  locale: z.string().default("en-IN"),
  timeZone: z.string().default("Asia/Kolkata"),
  people: z.array(Person).min(1),
  assets: z.array(AssetRef).default([]),
  components: z.array(Component).min(1),
  venues: z.array(Venue).default([]),
  designRequests: z.array(DesignRequest).default([]),
  customRequirements: z.array(CustomRequirement).default([]),
  uncertainties: z.array(Uncertainty).default([]),
  exactFacts: z.array(ExactFact).default([]),
  createdAt: ISODateTime,
  updatedAt: ISODateTime,
  createdBy: z.string()
});

export type InvitationSpec = z.infer<typeof InvitationSpec>;

export const SpecRevisionRecord = z.object({
  revision: SpecRevision,
  spec: InvitationSpec,
  editor: z.string(),
  timestamp: ISODateTime,
  changeSummary: z.string()
});

export type SpecRevisionRecord = z.infer<typeof SpecRevisionRecord>;

// ============================================================================
// Template capability contract
// ============================================================================

export const TemplateCapability = z.object({
  componentType: z.string(),
  variant: ComponentVariant,
  requiredData: z.array(z.string()),
  optionalData: z.array(z.string()).default([]),
  assetSlots: z.array(z.object({
    purpose: z.string(),
    aspectRatio: z.string().optional(),
    required: z.boolean().default(false)
  })).default([]),
  editableTokens: z.array(z.string()).default([])
});

export type TemplateCapability = z.infer<typeof TemplateCapability>;

export const TemplateManifest = z.object({
  id: TemplateId,
  name: z.string(),
  version: z.string(),
  capabilityVersion: z.string(),
  capabilities: z.array(TemplateCapability),
  buildCommand: z.string(),
  previewCommand: z.string(),
  installCommand: z.string(),
  baselineScreenshots: z.object({
    mobile: z.string(), // R2 key
    desktop: z.string()
  }),
  knownDifferences: z.array(z.string()).default([]),
  unsupportedInteractions: z.array(z.string()).default([]),
  adapterEntryPoint: z.string() // path to adapter module
});

export type TemplateManifest = z.infer<typeof TemplateManifest>;

// ============================================================================
// QA and attempt types
// ============================================================================

export const QASeverity = z.enum(["critical", "major", "minor", "info"]);

export type QASeverity = z.infer<typeof QASeverity>;

export const QAIssue = z.object({
  id: z.string().brand("QAIssueId"),
  severity: QASeverity,
  category: z.enum(["build", "browser", "fact", "visual", "accessibility"]),
  message: z.string(),
  specPath: z.string().optional(),
  domSelector: z.string().optional(),
  screenshotRegion: z.object({
    x: z.number(),
    y: z.number(),
    width: z.number(),
    height: z.number()
  }).optional(),
  expected: z.unknown().optional(),
  actual: z.unknown().optional(),
  suggestedFix: z.string().optional()
});

export type QAIssue = z.infer<typeof QAIssue>;

export const QAReport = z.object({
  jobId: JobId,
  attempt: AttemptNumber,
  specRevision: SpecRevision,
  build: z.object({
    status: z.enum(["pass", "fail"]),
    logs: z.array(z.string()).default([]),
    durationMs: z.number()
  }),
  browser: z.object({
    status: z.enum(["pass", "fail"]),
    consoleErrors: z.array(z.string()).default([]),
    pageErrors: z.array(z.string()).default([]),
    failedRequests: z.array(z.object({
      url: z.string(),
      status: z.number(),
      error: z.string()
    })).default([]),
    screenshots: z.object({
      mobile: z.string(), // R2 key
      desktop: z.string()
    }),
    viewportSizes: z.object({
      mobile: z.object({ width: z.number(), height: z.number() }),
      desktop: z.object({ width: z.number(), height: z.number() })
    }),
    durationMs: z.number()
  }),
  facts: z.object({
    status: z.enum(["pass", "fail"]),
    issues: z.array(QAIssue).default([]),
    checkedCount: z.number(),
    passedCount: z.number()
  }),
  visual: z.object({
    status: z.enum(["pass", "review", "fail"]),
    issues: z.array(QAIssue).default([]),
    baselineComparison: z.object({
      mobileDiff: z.number().optional(),
      desktopDiff: z.number().optional()
    }).optional()
  }),
  overallStatus: z.enum(["pass", "fail", "review"]),
  blockingIssues: z.number(),
  createdAt: ISODateTime,
  modelUsage: z.object({
    transcription: z.number().default(0),
    ocr: z.number().default(0),
    extraction: z.number().default(0),
    coding: z.number().default(0),
    visualQA: z.number().default(0)
  }).default({})
});

export type QAReport = z.infer<typeof QAReport>;

export const Attempt = z.object({
  jobId: JobId,
  attempt: AttemptNumber,
  specRevision: SpecRevision,
  workspaceKey: z.string(), // R2 prefix for this attempt
  qaReport: QAReport.nullable(),
  changedFiles: z.array(z.string()).default([]),
  diff: z.string().optional(),
  logs: z.string(), // R2 key for NDJSON logs
  status: z.enum(["pending", "building", "qa", "completed", "failed"]),
  startedAt: ISODateTime,
  completedAt: ISODateTime.nullable()
});

export type Attempt = z.infer<typeof Attempt>;

// ============================================================================
// API contracts
// ============================================================================

export const UploadInstructions = z.object({
  uploadUrl: z.string().url(),
  fields: z.record(z.string()),
  maxSize: z.number(),
  acceptedTypes: z.array(z.string())
});

export type UploadInstructions = z.infer<typeof UploadInstructions>;

export const AnalyzeResponse = z.object({
  jobId: JobId,
  state: JobState,
  message: z.string()
});

export type AnalyzeResponse = z.infer<typeof AnalyzeResponse>;

export const JobSummary = z.object({
  jobId: JobId,
  state: JobState,
  template: z.object({
    id: TemplateId,
    version: z.string()
  }),
  approvedSpecRevision: SpecRevision.nullable(),
  currentAttempt: AttemptNumber,
  blockingIssues: z.number(),
  usage: z.object({
    modelCostInr: z.number(),
    sandboxSeconds: z.number(),
    humanReviewSeconds: z.number().nullable()
  }),
  createdAt: ISODateTime,
  updatedAt: ISODateTime
});

export type JobSummary = z.infer<typeof JobSummary>;

export const ReviewAction = z.object({
  action: z.enum(["approveDraft", "requestRepair", "escalate", "cancel"]),
  reason: z.string(),
  specRevision: SpecRevision.optional()
});

export type ReviewAction = z.infer<typeof ReviewAction>;

// ============================================================================
// Sandbox provider interface
// ============================================================================

export const SandboxLimits = z.object({
  cpu: z.number().default(2),
  memoryMb: z.number().default(4096),
  timeoutSec: z.number().default(600)
});

export type SandboxLimits = z.infer<typeof SandboxLimits>;

export const ExecOptions = z.object({
  workdir: z.string().optional(),
  env: z.record(z.string()).optional(),
  timeoutSec: z.number().optional()
});

export type ExecOptions = z.infer<typeof ExecOptions>;

export const ExecResult = z.object({
  exitCode: z.number(),
  stdout: z.string(),
  stderr: z.string(),
  durationMs: z.number()
});

export type ExecResult = z.infer<typeof ExecResult>;

export const PreviewHandle = z.object({
  url: z.string().url(),
  port: z.number(),
  processId: z.number()
});

export type PreviewHandle = z.infer<typeof PreviewHandle>;

// ============================================================================
// Model router types
// ============================================================================

export const ModelRole = z.enum([
  "transcribe",
  "ocrVision",
  "requirements",
  "normalCode",
  "complexCode",
  "visualQA",
  "imageEdit",
  "verification"
]);

export type ModelRole = z.infer<typeof ModelRole>;

export const ModelConfig = z.object({
  role: ModelRole,
  primaryModel: z.string(),
  fallbackModels: z.array(z.string()).default([]),
  contextLimit: z.number(),
  structuredOutput: z.boolean().default(false),
  timeoutSec: z.number().default(120),
  privacyPolicy: z.enum(["strict", "standard", "flexible"]).default("standard"),
  perCallBudgetInr: z.number().default(10)
});

export type ModelConfig = z.infer<typeof ModelConfig>;

// ============================================================================
// Sandbox provider interface types
// ============================================================================

export interface SandboxProvider {
  create(jobId: string, limits: SandboxLimits): Promise<SandboxHandle>;
  copyTemplate(handle: SandboxHandle, templateRef: string): Promise<void>;
  putInput(handle: SandboxHandle, manifestRef: string): Promise<void>;
  exec(handle: SandboxHandle, argv: string[], options?: ExecOptions): Promise<ExecResult>;
  startPreview(handle: SandboxHandle, argv: string[], port: number): Promise<PreviewHandle>;
  captureArtifacts(handle: SandboxHandle, paths: string[]): Promise<string[]>;
  destroy(handle: SandboxHandle): Promise<void>;
}

export interface SandboxHandle {
  id: string;
  jobId: string;
  limits: SandboxLimits;
}

// ============================================================================
// Model router additional types
// ============================================================================

export type ModelProvider = string;

export interface ModelProviderAdapter {
  call(prompt: string, options: any): Promise<any>;
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

// ============================================================================
// Branded ID creators
// ============================================================================

export function createJobId(): JobId {
  return `job_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}` as JobId;
}

export function createSpecRevision(n: number): SpecRevision {
  return n as SpecRevision;
}

export function createAttemptNumber(n: number): AttemptNumber {
  return n as AttemptNumber;
}

export function createTemplateId(id: string): TemplateId {
  return id as TemplateId;
}

export function createAssetId(id: string): AssetId {
  return id as AssetId;
}

export function createPersonId(id: string): PersonId {
  return id as PersonId;
}

export function createComponentId(id: string): ComponentId {
  return id as ComponentId;
}

export function createVenueId(id: string): VenueId {
  return id as VenueId;
}

export function createMessageId(id: string): MessageId {
  return id as MessageId;
}

export function createEvidenceRef(ref: string): EvidenceRef {
  return ref as EvidenceRef;
}

export function createDesignRequestId(id: string): DesignRequestId {
  return id as DesignRequestId;
}

export function createCustomRequirementId(id: string): CustomRequirementId {
  return id as CustomRequirementId;
}

export function createUncertaintyId(id: string): UncertaintyId {
  return id as UncertaintyId;
}

export function createQAIssueId(id: string): QAIssueId {
  return id as QAIssueId;
}

// Type aliases for the branded IDs used in creators
export type DesignRequestId = z.infer<typeof DesignRequest>["id"];
export type CustomRequirementId = z.infer<typeof CustomRequirement>["id"];
export type UncertaintyId = z.infer<typeof Uncertainty>["id"];
export type QAIssueId = z.infer<typeof QAIssue>["id"];