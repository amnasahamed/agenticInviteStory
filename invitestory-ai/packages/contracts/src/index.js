"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelConfig = exports.ModelRole = exports.PreviewHandle = exports.ExecResult = exports.ExecOptions = exports.SandboxLimits = exports.ReviewAction = exports.JobSummary = exports.AnalyzeResponse = exports.UploadInstructions = exports.Attempt = exports.QAReport = exports.QAIssue = exports.QASeverity = exports.TemplateManifest = exports.TemplateCapability = exports.SpecRevisionRecord = exports.InvitationSpec = exports.ExactFact = exports.Uncertainty = exports.CustomRequirement = exports.DesignRequest = exports.Component = exports.ComponentVariant = exports.AssetRef = exports.Venue = exports.Person = exports.MediaManifest = exports.ChatMessage = exports.MediaAsset = exports.MediaKind = exports.CreateJobInput = exports.Job = exports.JobState = exports.EvidenceRef = exports.MessageId = exports.VenueId = exports.ComponentId = exports.PersonId = exports.AssetId = exports.TemplateId = exports.AttemptNumber = exports.SpecRevision = exports.JobId = exports.ULID = exports.SHA256Hash = exports.ISODateTime = void 0;
exports.createJobId = createJobId;
exports.createSpecRevision = createSpecRevision;
exports.createAttemptNumber = createAttemptNumber;
exports.createTemplateId = createTemplateId;
exports.createAssetId = createAssetId;
exports.createPersonId = createPersonId;
exports.createComponentId = createComponentId;
exports.createVenueId = createVenueId;
exports.createMessageId = createMessageId;
exports.createEvidenceRef = createEvidenceRef;
exports.createDesignRequestId = createDesignRequestId;
exports.createCustomRequirementId = createCustomRequirementId;
exports.createUncertaintyId = createUncertaintyId;
exports.createQAIssueId = createQAIssueId;
const zod_1 = require("zod");
// ============================================================================
// Base types and utilities
// ============================================================================
exports.ISODateTime = zod_1.z.string().datetime({ offset: true });
exports.SHA256Hash = zod_1.z.string().regex(/^[a-f0-9]{64}$/);
exports.ULID = zod_1.z.string().regex(/^[0-9A-HJKMNP-TV-Z]{26}$/);
exports.JobId = zod_1.z.string().brand("JobId");
exports.SpecRevision = zod_1.z.number().int().positive();
exports.AttemptNumber = zod_1.z.number().int().positive();
exports.TemplateId = zod_1.z.string().brand("TemplateId");
exports.AssetId = zod_1.z.string().brand("AssetId");
exports.PersonId = zod_1.z.string().brand("PersonId");
exports.ComponentId = zod_1.z.string().brand("ComponentId");
exports.VenueId = zod_1.z.string().brand("VenueId");
exports.MessageId = zod_1.z.string().brand("MessageId");
exports.EvidenceRef = zod_1.z.string().brand("EvidenceRef");
// ============================================================================
// Job and state machine
// ============================================================================
exports.JobState = zod_1.z.enum([
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
exports.Job = zod_1.z.object({
    jobId: exports.JobId,
    state: exports.JobState,
    template: zod_1.z.object({
        id: exports.TemplateId,
        version: zod_1.z.string(), // git commit hash or version tag
        capabilityVersion: zod_1.z.string()
    }),
    historicalOrderId: zod_1.z.string().optional(),
    createdBy: zod_1.z.string(),
    createdAt: exports.ISODateTime,
    updatedAt: exports.ISODateTime,
    approvedSpecRevision: exports.SpecRevision.nullable(),
    currentAttempt: exports.AttemptNumber,
    inputHash: exports.SHA256Hash,
    uploadKeys: zod_1.z.object({
        originalZip: zod_1.z.string(),
        extras: zod_1.z.array(zod_1.z.string()).default([])
    }),
    usage: zod_1.z.object({
        modelCostInr: zod_1.z.number().default(0),
        sandboxSeconds: zod_1.z.number().default(0),
        humanReviewSeconds: zod_1.z.number().nullable()
    }).default({ modelCostInr: 0, sandboxSeconds: 0, humanReviewSeconds: null }),
    error: zod_1.z.object({
        code: zod_1.z.string(),
        message: zod_1.z.string(),
        retryable: zod_1.z.boolean()
    }).nullable(),
    transitionLog: zod_1.z.array(zod_1.z.object({
        from: exports.JobState,
        to: exports.JobState,
        actor: zod_1.z.string(),
        timestamp: exports.ISODateTime,
        reason: zod_1.z.string().optional(),
        specRevision: exports.SpecRevision.optional(),
        attempt: exports.AttemptNumber.optional()
    })).default([])
});
exports.CreateJobInput = zod_1.z.object({
    templateId: exports.TemplateId,
    historicalOrderId: zod_1.z.string().optional(),
    idempotencyKey: zod_1.z.string()
});
// ============================================================================
// Media and ingestion
// ============================================================================
exports.MediaKind = zod_1.z.enum(["image", "audio", "video", "pdf", "document", "other"]);
exports.MediaAsset = zod_1.z.object({
    id: exports.AssetId,
    kind: exports.MediaKind,
    originalName: zod_1.z.string(),
    mimeType: zod_1.z.string(),
    size: zod_1.z.number().int().positive(),
    sha256: exports.SHA256Hash,
    sourceKey: zod_1.z.string(), // R2 key
    relatedMessageIds: zod_1.z.array(exports.MessageId).default([]),
    transcriptRef: zod_1.z.string().optional(), // R2 key for transcript
    ocrRef: zod_1.z.string().optional() // R2 key for OCR result
});
exports.ChatMessage = zod_1.z.object({
    id: exports.MessageId,
    timestamp: exports.ISODateTime,
    sender: zod_1.z.string(),
    rawText: zod_1.z.string(),
    mediaAssetIds: zod_1.z.array(exports.AssetId).default([]),
    isVoice: zod_1.z.boolean().default(false),
    voiceDurationSec: zod_1.z.number().optional()
});
exports.MediaManifest = zod_1.z.object({
    jobId: exports.JobId,
    chatMessages: zod_1.z.array(exports.ChatMessage),
    assets: zod_1.z.array(exports.MediaAsset),
    extractedAt: exports.ISODateTime,
    extractorVersion: zod_1.z.string()
});
// ============================================================================
// InvitationSpec - the core specification
// ============================================================================
exports.Person = zod_1.z.object({
    id: exports.PersonId,
    displayName: zod_1.z.string().min(1),
    role: zod_1.z.enum(["partner", "parent", "sibling", "friend", "other"]),
    evidence: zod_1.z.array(exports.EvidenceRef).default([])
});
exports.Venue = zod_1.z.object({
    id: exports.VenueId,
    name: zod_1.z.string().min(1),
    address: zod_1.z.string(),
    mapUrl: zod_1.z.string().url().optional(),
    evidence: zod_1.z.array(exports.EvidenceRef).default([])
});
exports.AssetRef = zod_1.z.object({
    id: exports.AssetId,
    kind: exports.MediaKind,
    sourceKey: zod_1.z.string(),
    sha256: exports.SHA256Hash,
    purpose: zod_1.z.enum(["hero", "gallery", "profile", "background", "music", "other"]),
    crop: zod_1.z.enum(["face-safe", "center", "custom", "none"]).default("face-safe"),
    cropParams: zod_1.z.object({ x: zod_1.z.number(), y: zod_1.z.number(), width: zod_1.z.number(), height: zod_1.z.number() }).optional(),
    evidence: zod_1.z.array(exports.EvidenceRef).default([])
});
exports.ComponentVariant = zod_1.z.union([
    zod_1.z.literal("portrait"),
    zod_1.z.literal("landscape"),
    zod_1.z.literal("ceremony"),
    zod_1.z.literal("reception"),
    zod_1.z.literal("mehndi"),
    zod_1.z.literal("sangeet"),
    zod_1.z.literal("grid"),
    zod_1.z.literal("carousel"),
    zod_1.z.literal("masonry"),
    zod_1.z.literal("whatsapp"),
    zod_1.z.literal("form"),
    zod_1.z.literal("toggle"),
    zod_1.z.literal("player"),
    zod_1.z.literal("embed"),
    zod_1.z.literal("timer"),
    zod_1.z.literal("side-by-side")
]);
exports.Component = zod_1.z.object({
    id: exports.ComponentId,
    type: zod_1.z.enum([
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
    variant: exports.ComponentVariant,
    data: zod_1.z.record(zod_1.z.unknown()),
    evidence: zod_1.z.array(exports.EvidenceRef).default([])
});
exports.DesignRequest = zod_1.z.object({
    id: zod_1.z.string().brand("DesignRequestId"),
    kind: zod_1.z.enum(["color", "font", "layout", "animation", "effect", "custom"]),
    target: zod_1.z.string(), // component ID or "global"
    value: zod_1.z.unknown(),
    referenceAssetId: exports.AssetId.nullable(),
    evidence: zod_1.z.array(exports.EvidenceRef).default([])
});
exports.CustomRequirement = zod_1.z.object({
    id: zod_1.z.string().brand("CustomRequirementId"),
    instruction: zod_1.z.string(),
    target: exports.ComponentId,
    status: zod_1.z.enum(["pending", "requires-agent", "requires-image-tool", "in-progress", "done", "blocked"]),
    evidence: zod_1.z.array(exports.EvidenceRef).default([])
});
exports.Uncertainty = zod_1.z.object({
    id: zod_1.z.string().brand("UncertaintyId"),
    field: zod_1.z.string(), // JSON path like "components.event-1.data.startsAt"
    reason: zod_1.z.string(),
    blocking: zod_1.z.boolean(),
    resolution: zod_1.z.enum(["omit", "ask", "infer", "use-default"]).optional(),
    resolvedValue: zod_1.z.unknown().optional()
});
exports.ExactFact = zod_1.z.object({
    path: zod_1.z.string(), // JSON path
    expected: zod_1.z.unknown(),
    severity: zod_1.z.enum(["critical", "major", "minor"])
});
exports.InvitationSpec = zod_1.z.object({
    schemaVersion: zod_1.z.string().default("1.0"),
    jobId: exports.JobId,
    revision: exports.SpecRevision,
    template: zod_1.z.object({
        id: exports.TemplateId,
        version: zod_1.z.string(),
        capabilityVersion: zod_1.z.string()
    }),
    locale: zod_1.z.string().default("en-IN"),
    timeZone: zod_1.z.string().default("Asia/Kolkata"),
    people: zod_1.z.array(exports.Person).min(1),
    assets: zod_1.z.array(exports.AssetRef).default([]),
    components: zod_1.z.array(exports.Component).min(1),
    venues: zod_1.z.array(exports.Venue).default([]),
    designRequests: zod_1.z.array(exports.DesignRequest).default([]),
    customRequirements: zod_1.z.array(exports.CustomRequirement).default([]),
    uncertainties: zod_1.z.array(exports.Uncertainty).default([]),
    exactFacts: zod_1.z.array(exports.ExactFact).default([]),
    createdAt: exports.ISODateTime,
    updatedAt: exports.ISODateTime,
    createdBy: zod_1.z.string()
});
exports.SpecRevisionRecord = zod_1.z.object({
    revision: exports.SpecRevision,
    spec: exports.InvitationSpec,
    editor: zod_1.z.string(),
    timestamp: exports.ISODateTime,
    changeSummary: zod_1.z.string()
});
// ============================================================================
// Template capability contract
// ============================================================================
exports.TemplateCapability = zod_1.z.object({
    componentType: zod_1.z.string(),
    variant: exports.ComponentVariant,
    requiredData: zod_1.z.array(zod_1.z.string()),
    optionalData: zod_1.z.array(zod_1.z.string()).default([]),
    assetSlots: zod_1.z.array(zod_1.z.object({
        purpose: zod_1.z.string(),
        aspectRatio: zod_1.z.string().optional(),
        required: zod_1.z.boolean().default(false)
    })).default([]),
    editableTokens: zod_1.z.array(zod_1.z.string()).default([])
});
exports.TemplateManifest = zod_1.z.object({
    id: exports.TemplateId,
    name: zod_1.z.string(),
    version: zod_1.z.string(),
    capabilityVersion: zod_1.z.string(),
    capabilities: zod_1.z.array(exports.TemplateCapability),
    buildCommand: zod_1.z.string(),
    previewCommand: zod_1.z.string(),
    installCommand: zod_1.z.string(),
    baselineScreenshots: zod_1.z.object({
        mobile: zod_1.z.string(), // R2 key
        desktop: zod_1.z.string()
    }),
    knownDifferences: zod_1.z.array(zod_1.z.string()).default([]),
    unsupportedInteractions: zod_1.z.array(zod_1.z.string()).default([]),
    adapterEntryPoint: zod_1.z.string() // path to adapter module
});
// ============================================================================
// QA and attempt types
// ============================================================================
exports.QASeverity = zod_1.z.enum(["critical", "major", "minor", "info"]);
exports.QAIssue = zod_1.z.object({
    id: zod_1.z.string().brand("QAIssueId"),
    severity: exports.QASeverity,
    category: zod_1.z.enum(["build", "browser", "fact", "visual", "accessibility"]),
    message: zod_1.z.string(),
    specPath: zod_1.z.string().optional(),
    domSelector: zod_1.z.string().optional(),
    screenshotRegion: zod_1.z.object({
        x: zod_1.z.number(),
        y: zod_1.z.number(),
        width: zod_1.z.number(),
        height: zod_1.z.number()
    }).optional(),
    expected: zod_1.z.unknown().optional(),
    actual: zod_1.z.unknown().optional(),
    suggestedFix: zod_1.z.string().optional()
});
exports.QAReport = zod_1.z.object({
    jobId: exports.JobId,
    attempt: exports.AttemptNumber,
    specRevision: exports.SpecRevision,
    build: zod_1.z.object({
        status: zod_1.z.enum(["pass", "fail"]),
        logs: zod_1.z.array(zod_1.z.string()).default([]),
        durationMs: zod_1.z.number()
    }),
    browser: zod_1.z.object({
        status: zod_1.z.enum(["pass", "fail"]),
        consoleErrors: zod_1.z.array(zod_1.z.string()).default([]),
        pageErrors: zod_1.z.array(zod_1.z.string()).default([]),
        failedRequests: zod_1.z.array(zod_1.z.object({
            url: zod_1.z.string(),
            status: zod_1.z.number(),
            error: zod_1.z.string()
        })).default([]),
        screenshots: zod_1.z.object({
            mobile: zod_1.z.string(), // R2 key
            desktop: zod_1.z.string()
        }),
        viewportSizes: zod_1.z.object({
            mobile: zod_1.z.object({ width: zod_1.z.number(), height: zod_1.z.number() }),
            desktop: zod_1.z.object({ width: zod_1.z.number(), height: zod_1.z.number() })
        }),
        durationMs: zod_1.z.number()
    }),
    facts: zod_1.z.object({
        status: zod_1.z.enum(["pass", "fail"]),
        issues: zod_1.z.array(exports.QAIssue).default([]),
        checkedCount: zod_1.z.number(),
        passedCount: zod_1.z.number()
    }),
    visual: zod_1.z.object({
        status: zod_1.z.enum(["pass", "review", "fail"]),
        issues: zod_1.z.array(exports.QAIssue).default([]),
        baselineComparison: zod_1.z.object({
            mobileDiff: zod_1.z.number().optional(),
            desktopDiff: zod_1.z.number().optional()
        }).optional()
    }),
    overallStatus: zod_1.z.enum(["pass", "fail", "review"]),
    blockingIssues: zod_1.z.number(),
    createdAt: exports.ISODateTime,
    modelUsage: zod_1.z.object({
        transcription: zod_1.z.number().default(0),
        ocr: zod_1.z.number().default(0),
        extraction: zod_1.z.number().default(0),
        coding: zod_1.z.number().default(0),
        visualQA: zod_1.z.number().default(0)
    }).default({})
});
exports.Attempt = zod_1.z.object({
    jobId: exports.JobId,
    attempt: exports.AttemptNumber,
    specRevision: exports.SpecRevision,
    workspaceKey: zod_1.z.string(), // R2 prefix for this attempt
    qaReport: exports.QAReport.nullable(),
    changedFiles: zod_1.z.array(zod_1.z.string()).default([]),
    diff: zod_1.z.string().optional(),
    logs: zod_1.z.string(), // R2 key for NDJSON logs
    status: zod_1.z.enum(["pending", "building", "qa", "completed", "failed"]),
    startedAt: exports.ISODateTime,
    completedAt: exports.ISODateTime.nullable()
});
// ============================================================================
// API contracts
// ============================================================================
exports.UploadInstructions = zod_1.z.object({
    uploadUrl: zod_1.z.string().url(),
    fields: zod_1.z.record(zod_1.z.string()),
    maxSize: zod_1.z.number(),
    acceptedTypes: zod_1.z.array(zod_1.z.string())
});
exports.AnalyzeResponse = zod_1.z.object({
    jobId: exports.JobId,
    state: exports.JobState,
    message: zod_1.z.string()
});
exports.JobSummary = zod_1.z.object({
    jobId: exports.JobId,
    state: exports.JobState,
    template: zod_1.z.object({
        id: exports.TemplateId,
        version: zod_1.z.string()
    }),
    approvedSpecRevision: exports.SpecRevision.nullable(),
    currentAttempt: exports.AttemptNumber,
    blockingIssues: zod_1.z.number(),
    usage: zod_1.z.object({
        modelCostInr: zod_1.z.number(),
        sandboxSeconds: zod_1.z.number(),
        humanReviewSeconds: zod_1.z.number().nullable()
    }),
    createdAt: exports.ISODateTime,
    updatedAt: exports.ISODateTime
});
exports.ReviewAction = zod_1.z.object({
    action: zod_1.z.enum(["approveDraft", "requestRepair", "escalate", "cancel"]),
    reason: zod_1.z.string(),
    specRevision: exports.SpecRevision.optional()
});
// ============================================================================
// Sandbox provider interface
// ============================================================================
exports.SandboxLimits = zod_1.z.object({
    cpu: zod_1.z.number().default(2),
    memoryMb: zod_1.z.number().default(4096),
    timeoutSec: zod_1.z.number().default(600)
});
exports.ExecOptions = zod_1.z.object({
    workdir: zod_1.z.string().optional(),
    env: zod_1.z.record(zod_1.z.string()).optional(),
    timeoutSec: zod_1.z.number().optional()
});
exports.ExecResult = zod_1.z.object({
    exitCode: zod_1.z.number(),
    stdout: zod_1.z.string(),
    stderr: zod_1.z.string(),
    durationMs: zod_1.z.number()
});
exports.PreviewHandle = zod_1.z.object({
    url: zod_1.z.string().url(),
    port: zod_1.z.number(),
    processId: zod_1.z.number()
});
// ============================================================================
// Model router types
// ============================================================================
exports.ModelRole = zod_1.z.enum([
    "transcribe",
    "ocrVision",
    "requirements",
    "normalCode",
    "complexCode",
    "visualQA",
    "imageEdit",
    "verification"
]);
exports.ModelConfig = zod_1.z.object({
    role: exports.ModelRole,
    primaryModel: zod_1.z.string(),
    fallbackModels: zod_1.z.array(zod_1.z.string()).default([]),
    contextLimit: zod_1.z.number(),
    structuredOutput: zod_1.z.boolean().default(false),
    timeoutSec: zod_1.z.number().default(120),
    privacyPolicy: zod_1.z.enum(["strict", "standard", "flexible"]).default("standard"),
    perCallBudgetInr: zod_1.z.number().default(10)
});
// ============================================================================
// Branded ID creators
// ============================================================================
function createJobId() {
    return `job_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
function createSpecRevision(n) {
    return n;
}
function createAttemptNumber(n) {
    return n;
}
function createTemplateId(id) {
    return id;
}
function createAssetId(id) {
    return id;
}
function createPersonId(id) {
    return id;
}
function createComponentId(id) {
    return id;
}
function createVenueId(id) {
    return id;
}
function createMessageId(id) {
    return id;
}
function createEvidenceRef(ref) {
    return ref;
}
function createDesignRequestId(id) {
    return id;
}
function createCustomRequirementId(id) {
    return id;
}
function createUncertaintyId(id) {
    return id;
}
function createQAIssueId(id) {
    return id;
}
//# sourceMappingURL=index.js.map