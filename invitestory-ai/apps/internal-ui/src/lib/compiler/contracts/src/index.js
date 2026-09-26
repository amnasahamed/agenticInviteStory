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
export const CreateJobInput = z.object({
    templateId: TemplateId,
    historicalOrderId: z.string().optional(),
    idempotencyKey: z.string()
});
// ============================================================================
// Media and ingestion
// ============================================================================
export const MediaKind = z.enum(["image", "audio", "video", "pdf", "document", "other"]);
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
export const ChatMessage = z.object({
    id: MessageId,
    timestamp: ISODateTime,
    sender: z.string(),
    rawText: z.string(),
    mediaAssetIds: z.array(AssetId).default([]),
    isVoice: z.boolean().default(false),
    voiceDurationSec: z.number().optional()
});
export const MediaManifest = z.object({
    jobId: JobId,
    chatMessages: z.array(ChatMessage),
    assets: z.array(MediaAsset),
    extractedAt: ISODateTime,
    extractorVersion: z.string()
});
// ============================================================================
// InvitationSpec - the core specification
// ============================================================================
export const Person = z.object({
    id: PersonId,
    displayName: z.string().min(1),
    role: z.enum(["partner", "parent", "sibling", "friend", "other"]),
    evidence: z.array(EvidenceRef).default([])
});
export const Venue = z.object({
    id: VenueId,
    name: z.string().min(1),
    address: z.string(),
    mapUrl: z.string().url().optional(),
    evidence: z.array(EvidenceRef).default([])
});
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
export const DesignRequest = z.object({
    id: z.string().brand("DesignRequestId"),
    kind: z.enum(["color", "font", "layout", "animation", "effect", "custom"]),
    target: z.string(), // component ID or "global"
    value: z.unknown(),
    referenceAssetId: AssetId.nullable(),
    evidence: z.array(EvidenceRef).default([])
});
export const CustomRequirement = z.object({
    id: z.string().brand("CustomRequirementId"),
    instruction: z.string(),
    target: ComponentId,
    status: z.enum(["pending", "requires-agent", "requires-image-tool", "in-progress", "done", "blocked"]),
    evidence: z.array(EvidenceRef).default([])
});
export const Uncertainty = z.object({
    id: z.string().brand("UncertaintyId"),
    field: z.string(), // JSON path like "components.event-1.data.startsAt"
    reason: z.string(),
    blocking: z.boolean(),
    resolution: z.enum(["omit", "ask", "infer", "use-default"]).optional(),
    resolvedValue: z.unknown().optional()
});
export const ExactFact = z.object({
    path: z.string(), // JSON path
    expected: z.unknown(),
    severity: z.enum(["critical", "major", "minor"])
});
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
export const SpecRevisionRecord = z.object({
    revision: SpecRevision,
    spec: InvitationSpec,
    editor: z.string(),
    timestamp: ISODateTime,
    changeSummary: z.string()
});
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
// ============================================================================
// QA and attempt types
// ============================================================================
export const QASeverity = z.enum(["critical", "major", "minor", "info"]);
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
// ============================================================================
// API contracts
// ============================================================================
export const UploadInstructions = z.object({
    uploadUrl: z.string().url(),
    fields: z.record(z.string()),
    maxSize: z.number(),
    acceptedTypes: z.array(z.string())
});
export const AnalyzeResponse = z.object({
    jobId: JobId,
    state: JobState,
    message: z.string()
});
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
export const ReviewAction = z.object({
    action: z.enum(["approveDraft", "requestRepair", "escalate", "cancel"]),
    reason: z.string(),
    specRevision: SpecRevision.optional()
});
// ============================================================================
// Sandbox provider interface
// ============================================================================
export const SandboxLimits = z.object({
    cpu: z.number().default(2),
    memoryMb: z.number().default(4096),
    timeoutSec: z.number().default(600)
});
export const ExecOptions = z.object({
    workdir: z.string().optional(),
    env: z.record(z.string()).optional(),
    timeoutSec: z.number().optional()
});
export const ExecResult = z.object({
    exitCode: z.number(),
    stdout: z.string(),
    stderr: z.string(),
    durationMs: z.number()
});
export const PreviewHandle = z.object({
    url: z.string().url(),
    port: z.number(),
    processId: z.number()
});
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
// ============================================================================
// Branded ID creators
// ============================================================================
export function createJobId() {
    return `job_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
export function createSpecRevision(n) {
    return n;
}
export function createAttemptNumber(n) {
    return n;
}
export function createTemplateId(id) {
    return id;
}
export function createAssetId(id) {
    return id;
}
export function createPersonId(id) {
    return id;
}
export function createComponentId(id) {
    return id;
}
export function createVenueId(id) {
    return id;
}
export function createMessageId(id) {
    return id;
}
export function createEvidenceRef(ref) {
    return ref;
}
export function createDesignRequestId(id) {
    return id;
}
export function createCustomRequirementId(id) {
    return id;
}
export function createUncertaintyId(id) {
    return id;
}
export function createQAIssueId(id) {
    return id;
}
//# sourceMappingURL=index.js.map