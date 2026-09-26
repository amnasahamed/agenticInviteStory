// Cloudflare Worker API for InviteStory AI

import { Hono } from "hono";
import { cors } from "hono/cors";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { ulid } from "ulid";
import {
  Job,
  JobState,
  JobId,
  SpecRevision,
  AttemptNumber,
  CreateJobInput,
  InvitationSpec,
  MediaManifest,
  QAReport,
  UploadInstructions,
  AnalyzeResponse,
  JobSummary,
  ReviewAction,
  ISODateTime,
  SHA256Hash,
  TemplateId
} from "@invitestory/contracts";
import {
  extractZipSafely,
  createMediaAsset,
  ZipExtractionError
} from "@invitestory/ingest";
import { parseWhatsAppChat } from "@invitestory/ingest";
import {
  TranscriptionResult,
  OCRResult,
  VisionAnalysisResult,
  MockTranscriptionProvider,
  MockOCRProvider,
  MockVisionProvider,
  createTranscriptionProvider,
  createOCRProvider,
  createVisionProvider
} from "@invitestory/extraction";
import { extractInvitationSpec, validateSpec, ExtractionContext } from "@invitestory/extraction";
import { templateRegistry } from "@invitestory/templates";
import { compileInvitation, CompilerContext } from "@invitestory/compiler";
import { createSandboxProvider, SandboxProvider, SandboxHandle } from "@invitestory/sandbox";
import { runBrowserQA } from "@invitestory/browser-qa";
import { compareWithBaseline, runAIVisualReview } from "@invitestory/visual-qa";
import { modelRouter } from "@invitestory/model-router";

// ============================================================================
// Types and bindings
// ============================================================================

interface Env {
  DB: D1Database;
  R2: R2Bucket;
  AI: any; // Cloudflare AI binding
}

interface JobRecord {
  job_id: string;
  state: string;
  template_id: string;
  template_version: string;
  capability_version: string;
  historical_order_id: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  approved_spec_revision: number | null;
  current_attempt: number;
  input_hash: string;
  upload_keys: string; // JSON
  usage: string; // JSON
  error: string | null; // JSON
  transition_log: string; // JSON
}

interface SpecRecord {
  id: number;
  job_id: string;
  revision: number;
  spec_json: string;
  editor: string;
  timestamp: string;
  change_summary: string;
}

interface AttemptRecord {
  id: number;
  job_id: string;
  attempt: number;
  spec_revision: number;
  workspace_key: string;
  qa_report: string | null; // JSON
  changed_files: string; // JSON
  diff: string | null;
  logs: string;
  status: string;
  started_at: string;
  completed_at: string | null;
}

// ============================================================================
// Utility functions
// ============================================================================

function generateJobId(): JobId {
  return `job_${ulid()}` as JobId;
}

function nowISO(): ISODateTime {
  return new Date().toISOString();
}

async function hashBuffer(buffer: Buffer): Promise<SHA256Hash> {
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("") as SHA256Hash;
}

function createInitialJob(input: CreateJobInput, uploadKeys: { originalZip: string; extras: string[] }, inputHash: SHA256Hash): Job {
  const jobId = generateJobId();
  const template = templateRegistry.getTemplate(input.templateId);
  
  return {
    jobId,
    state: "RECEIVED",
    template: {
      id: input.templateId,
      version: template?.version || "unknown",
      capabilityVersion: template?.capabilityVersion || "1"
    },
    historicalOrderId: input.historicalOrderId,
    createdBy: "staff", // Would come from auth
    createdAt: nowISO(),
    updatedAt: nowISO(),
    approvedSpecRevision: null,
    currentAttempt: 1,
    inputHash,
    uploadKeys,
    usage: { modelCostInr: 0, sandboxSeconds: 0, humanReviewSeconds: null },
    error: null,
    transitionLog: [{
      from: "RECEIVED" as JobState,
      to: "RECEIVED" as JobState,
      actor: "system",
      timestamp: nowISO(),
      reason: "Job created"
    }]
  };
}

function jobToRecord(job: Job): JobRecord {
  return {
    job_id: job.jobId,
    state: job.state,
    template_id: job.template.id,
    template_version: job.template.version,
    capability_version: job.template.capabilityVersion,
    historical_order_id: job.historicalOrderId || null,
    created_by: job.createdBy,
    created_at: job.createdAt,
    updated_at: job.updatedAt,
    approved_spec_revision: job.approvedSpecRevision,
    current_attempt: job.currentAttempt,
    input_hash: job.inputHash,
    upload_keys: JSON.stringify(job.uploadKeys),
    usage: JSON.stringify(job.usage),
    error: job.error ? JSON.stringify(job.error) : null,
    transition_log: JSON.stringify(job.transitionLog)
  };
}

function recordToJob(record: JobRecord): Job {
  return {
    jobId: record.job_id as JobId,
    state: record.state as JobState,
    template: {
      id: record.template_id as TemplateId,
      version: record.template_version,
      capabilityVersion: record.capability_version
    },
    historicalOrderId: record.historical_order_id || undefined,
    createdBy: record.created_by,
    createdAt: record.created_at as ISODateTime,
    updatedAt: record.updated_at as ISODateTime,
    approvedSpecRevision: record.approved_spec_revision,
    currentAttempt: record.current_attempt,
    inputHash: record.input_hash as SHA256Hash,
    uploadKeys: JSON.parse(record.upload_keys),
    usage: JSON.parse(record.usage),
    error: record.error ? JSON.parse(record.error) : null,
    transitionLog: JSON.parse(record.transition_log)
  };
}

async function saveJob(env: Env, job: Job): Promise<void> {
  const record = jobToRecord(job);
  await env.DB.prepare(`
    INSERT OR REPLACE INTO jobs (job_id, state, template_id, template_version, capability_version, historical_order_id, created_by, created_at, updated_at, approved_spec_revision, current_attempt, input_hash, upload_keys, usage, error, transition_log)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    record.job_id, record.state, record.template_id, record.template_version,
    record.capability_version, record.historical_order_id, record.created_by,
    record.created_at, record.updated_at, record.approved_spec_revision,
    record.current_attempt, record.input_hash, record.upload_keys,
    record.usage, record.error, record.transition_log
  ).run();
}

async function getJob(env: Env, jobId: JobId): Promise<Job | null> {
  const record = await env.DB.prepare("SELECT * FROM jobs WHERE job_id = ?").bind(jobId).first<JobRecord>();
  return record ? recordToJob(record) : null;
}

async function transitionJob(env: Env, job: Job, newState: JobState, actor: string, reason?: string): Promise<Job> {
  const oldState = job.state;
  job.state = newState;
  job.updatedAt = nowISO();
  job.transitionLog.push({
    from: oldState,
    to: newState,
    actor,
    timestamp: nowISO(),
    reason
  });
  await saveJob(env, job);
  return job;
}

// ============================================================================
// Hono app setup
// ============================================================================

const app = new Hono<{ Bindings: Env }>();

app.use("*", cors());

// ============================================================================
// Routes
// ============================================================================

// POST /v1/jobs - Create job
app.post("/v1/jobs", zValidator("json", CreateJobInput), async (c) => {
  const input = c.req.valid("json");
  const idempotencyKey = c.req.header("Idempotency-Key");
  
  if (!idempotencyKey) {
    return c.json({ error: "Idempotency-Key header required" }, 400);
  }

  // Check for existing job with same idempotency key
  const existing = await c.env.DB.prepare("SELECT job_id FROM jobs WHERE job_id = ?").bind(idempotencyKey).first();
  if (existing) {
    const job = await getJob(c.env, existing.job_id as JobId);
    if (job) return c.json({ jobId: job.jobId, state: job.state, uploadInstructions: getUploadInstructions(job) });
  }

  // For MVP, we'll use a placeholder upload - real implementation would return signed URLs
  const job = createInitialJob(input, { originalZip: "", extras: [] }, "pending" as SHA256Hash);
  await saveJob(c.env, job);

  return c.json({
    jobId: job.jobId,
    state: job.state,
    uploadInstructions: getUploadInstructions(job)
  });
});

// GET /v1/jobs/:id - Get job summary
app.get("/v1/jobs/:id", async (c) => {
  const jobId = c.req.param("id") as JobId;
  const job = await getJob(c.env, jobId);
  
  if (!job) {
    return c.json({ error: "Job not found" }, 404);
  }

  const summary: JobSummary = {
    jobId: job.jobId,
    state: job.state,
    template: { id: job.template.id, version: job.template.version },
    approvedSpecRevision: job.approvedSpecRevision,
    currentAttempt: job.currentAttempt,
    blockingIssues: 0, // Would be computed from latest QA
    usage: job.usage,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt
  };

  return c.json(summary);
});

// POST /v1/jobs/:id/uploads - Handle upload (simplified for MVP)
app.post("/v1/jobs/:id/uploads", async (c) => {
  const jobId = c.req.param("id") as JobId;
  const job = await getJob(c.env, jobId);
  
  if (!job) return c.json({ error: "Job not found" }, 404);
  if (job.state !== "RECEIVED") return c.json({ error: "Job not in upload state" }, 400);

  // In real implementation, handle multipart upload to R2
  // For MVP, we'll simulate with a body containing the ZIP as base64
  const body = await c.req.json();
  const zipBase64 = body.zipBase64;
  
  if (!zipBase64) {
    return c.json({ error: "zipBase64 required in body" }, 400);
  }

  const zipBuffer = Buffer.from(zipBase64, "base64");
  const inputHash = await hashBuffer(zipBuffer);

  // Store original ZIP in R2
  const originalKey = `jobs/${jobId}/input/original.zip`;
  await c.env.R2.put(originalKey, zipBuffer, {
    httpMetadata: { contentType: "application/zip" },
    customMetadata: { jobId, uploadedBy: job.createdBy }
  });

  // Update job with upload keys and hash
  job.uploadKeys = { originalZip: originalKey, extras: [] };
  job.inputHash = inputHash;
  await transitionJob(c.env, job, "INGESTING", "system", "ZIP uploaded");

  // Start async analysis
  c.executionCtx.waitUntil(analyzeJob(c.env, jobId));

  return c.json({ jobId, state: "INGESTING", message: "Upload received, analysis started" });
});

// POST /v1/jobs/:id/analyze - Start analysis
app.post("/v1/jobs/:id/analyze", async (c) => {
  const jobId = c.req.param("id") as JobId;
  const job = await getJob(c.env, jobId);
  
  if (!job) return c.json({ error: "Job not found" }, 404);
  if (job.state !== "RECEIVED" && job.state !== "INGESTING") {
    return c.json({ error: "Job not in analyzable state" }, 400);
  }

  await transitionJob(c.env, job, "INGESTING", "system", "Analysis triggered");
  c.executionCtx.waitUntil(analyzeJob(c.env, jobId));

  return c.json({ jobId, state: "INGESTING", message: "Analysis started" });
});

// GET /v1/jobs/:id/spec - Get current spec
app.get("/v1/jobs/:id/spec", async (c) => {
  const jobId = c.req.param("id") as JobId;
  const job = await getJob(c.env, jobId);
  
  if (!job) return c.json({ error: "Job not found" }, 404);

  // Get latest spec revision
  const specRecord = await c.env.DB.prepare(
    "SELECT * FROM specs WHERE job_id = ? ORDER BY revision DESC LIMIT 1"
  ).bind(jobId).first<SpecRecord>();

  if (!specRecord) {
    return c.json({ error: "No spec found" }, 404);
  }

  return c.json({
    revision: specRecord.revision,
    spec: JSON.parse(specRecord.spec_json),
    editor: specRecord.editor,
    timestamp: specRecord.timestamp
  });
});

// PUT /v1/jobs/:id/spec - Update spec
app.put("/v1/jobs/:id/spec", zValidator("json", z.object({
  spec: z.any(), // InvitationSpec schema
  expectedRevision: z.number(),
  changeSummary: z.string()
})), async (c) => {
  const jobId = c.req.param("id") as JobId;
  const { spec, expectedRevision, changeSummary } = c.req.valid("json");
  const job = await getJob(c.env, jobId);
  
  if (!job) return c.json({ error: "Job not found" }, 404);
  if (job.approvedSpecRevision !== expectedRevision) {
    return c.json({ error: "Revision conflict" }, 409);
  }

  // Validate spec
  const validation = validateSpec(spec);
  if (!validation.valid) {
    return c.json({ error: "Invalid spec", details: validation.errors }, 400);
  }

  const newRevision = (job.approvedSpecRevision || 0) + 1;
  
  // Save new spec revision
  await c.env.DB.prepare(`
    INSERT INTO specs (job_id, revision, spec_json, editor, timestamp, change_summary)
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(jobId, newRevision, JSON.stringify(spec), "staff", nowISO(), changeSummary).run();

  job.approvedSpecRevision = newRevision;
  await transitionJob(c.env, job, "VALIDATING", "staff", `Spec updated to revision ${newRevision}`);

  // Re-validate
  const revalidation = validateSpec(spec);
  if (!revalidation.valid) {
    await transitionJob(c.env, job, "NEEDS_INPUT", "system", "Validation failed after edit");
    return c.json({ error: "Spec validation failed", details: revalidation.errors }, 400);
  }

  await transitionJob(c.env, job, "READY_TO_BUILD", "system", "Spec validated");

  return c.json({ revision: newRevision, state: job.state });
});

// POST /v1/jobs/:id/build - Build invitation
app.post("/v1/jobs/:id/build", zValidator("json", z.object({
  specRevision: z.number(),
  idempotencyKey: z.string()
})), async (c) => {
  const jobId = c.req.param("id") as JobId;
  const { specRevision, idempotencyKey } = c.req.valid("json");
  const job = await getJob(c.env, jobId);
  
  if (!job) return c.json({ error: "Job not found" }, 404);
  if (job.approvedSpecRevision !== specRevision) {
    return c.json({ error: "Spec revision mismatch" }, 400);
  }
  if (job.state !== "READY_TO_BUILD") {
    return c.json({ error: "Job not ready to build" }, 400);
  }

  // Check idempotency
  const existingAttempt = await c.env.DB.prepare(
    "SELECT * FROM attempts WHERE job_id = ? AND spec_revision = ? AND idempotency_key = ?"
  ).bind(jobId, specRevision, idempotencyKey).first();

  if (existingAttempt) {
    return c.json({ jobId, attempt: existingAttempt.attempt, message: "Build already in progress" });
  }

  await transitionJob(c.env, job, "BUILDING", "system", `Build started for revision ${specRevision}`);
  c.executionCtx.waitUntil(buildJob(c.env, jobId, specRevision, idempotencyKey));

  return c.json({ jobId, state: "BUILDING", message: "Build started" });
});

// GET /v1/jobs/:id/attempts/:attempt - Get attempt details
app.get("/v1/jobs/:id/attempts/:attempt", async (c) => {
  const jobId = c.req.param("id") as JobId;
  const attempt = parseInt(c.req.param("attempt")) as AttemptNumber;
  
  const record = await c.env.DB.prepare(
    "SELECT * FROM attempts WHERE job_id = ? AND attempt = ?"
  ).bind(jobId, attempt).first<AttemptRecord>();

  if (!record) return c.json({ error: "Attempt not found" }, 404);

  return c.json({
    jobId: record.job_id,
    attempt: record.attempt,
    specRevision: record.spec_revision,
    workspaceKey: record.workspace_key,
    qaReport: record.qa_report ? JSON.parse(record.qa_report) : null,
    changedFiles: JSON.parse(record.changed_files),
    diff: record.diff,
    logs: record.logs,
    status: record.status,
    startedAt: record.started_at,
    completedAt: record.completed_at
  });
});

// POST /v1/jobs/:id/actions - Review actions
app.post("/v1/jobs/:id/actions", zValidator("json", ReviewAction), async (c) => {
  const jobId = c.req.param("id") as JobId;
  const action = c.req.valid("json");
  const job = await getJob(c.env, jobId);
  
  if (!job) return c.json({ error: "Job not found" }, 404);

  switch (action.action) {
    case "approveDraft":
      if (job.state !== "READY_FOR_STAFF") {
        return c.json({ error: "Job not ready for approval" }, 400);
      }
      await transitionJob(c.env, job, "APPROVED", "staff", action.reason);
      break;
    case "requestRepair":
      if (job.state !== "READY_FOR_STAFF" && job.state !== "QA_FAILED") {
        return c.json({ error: "Job not in repairable state" }, 400);
      }
      await transitionJob(c.env, job, "REPAIRING", "staff", action.reason);
      c.executionCtx.waitUntil(repairJob(c.env, jobId));
      break;
    case "escalate":
      await transitionJob(c.env, job, "ESCALATED", "staff", action.reason);
      break;
    case "cancel":
      await transitionJob(c.env, job, "CANCELLED", "staff", action.reason);
      break;
  }

  return c.json({ jobId, state: job.state, message: `Action ${action.action} processed` });
});

// Helper functions

function getUploadInstructions(job: Job): UploadInstructions {
  return {
    uploadUrl: `/v1/jobs/${job.jobId}/uploads`,
    fields: { jobId: job.jobId },
    maxSize: 500 * 1024 * 1024,
    acceptedTypes: ["application/zip"]
  };
}

async function analyzeJob(env: Env, jobId: JobId): Promise<void> {
  const job = await getJob(env, jobId);
  if (!job) return;

  try {
    await transitionJob(env, job, "EXTRACTING", "system", "Starting extraction");

    // Get ZIP from R2
    const zipObject = await env.R2.get(job.uploadKeys.originalZip);
    if (!zipObject) throw new Error("ZIP not found in R2");
    const zipBuffer = await zipObject.arrayBuffer();

    // Extract ZIP
    const extractionResult = await extractZipSafely(Buffer.from(zipBuffer));
    
    // Store normalized chat and media manifest
    const chatText = extractionResult.chatFile?.content.toString("utf-8") || "";
    const chatMessages = await parseWhatsAppChat(chatText);
    
    const mediaAssets = extractionResult.mediaFiles.map(f => 
      createMediaAsset(f, jobId, chatMessages.filter(m => m.mediaAssetIds.includes(f.sha256 as any)).map(m => m.id))
    );

    // Save media manifest
    const manifest: MediaManifest = {
      jobId,
      chatMessages,
      assets: mediaAssets,
      extractedAt: nowISO(),
      extractorVersion: "1.0"
    };
    await env.R2.put(`jobs/${jobId}/normalized/media-manifest.json`, JSON.stringify(manifest), {
      httpMetadata: { contentType: "application/json" }
    });
    await env.R2.put(`jobs/${jobId}/normalized/chat.jsonl`, chatMessages.map(m => JSON.stringify(m)).join("\n"), {
      httpMetadata: { contentType: "application/json" }
    });

    // Process media: transcription, OCR, vision
    const transcriptionProvider = createTranscriptionProvider("mock");
    const ocrProvider = createOCRProvider("mock");
    const visionProvider = createVisionProvider("mock");

    const transcripts = new Map<string, TranscriptionResult>();
    const ocrResults = new Map<string, OCRResult>();
    const visionResults = new Map<string, VisionAnalysisResult>();

    for (const asset of mediaAssets) {
      const assetObject = await env.R2.get(asset.sourceKey);
      if (!assetObject) continue;
      const assetBuffer = Buffer.from(await assetObject.arrayBuffer());

      if (asset.kind === "audio") {
        const result = await transcriptionProvider.transcribe(asset, assetBuffer);
        transcripts.set(asset.id, result);
        await env.R2.put(`jobs/${jobId}/transcripts/${asset.id}.json`, JSON.stringify(result));
      } else if (asset.kind === "image" || asset.kind === "pdf") {
        const ocrResult = await ocrProvider.extractText(asset, assetBuffer);
        ocrResults.set(asset.id, ocrResult);
        await env.R2.put(`jobs/${jobId}/ocr/${asset.id}.json`, JSON.stringify(ocrResult));

        const visionResult = await visionProvider.analyzeImage(asset, assetBuffer);
        visionResults.set(asset.id, visionResult);
        await env.R2.put(`jobs/${jobId}/vision/${asset.id}.json`, JSON.stringify(visionResult));
      }
    }

    // Extract InvitationSpec
    const template = templateRegistry.getTemplate(job.template.id);
    const context: ExtractionContext = {
      jobId,
      templateId: job.template.id,
      templateVersion: job.template.version,
      capabilityVersion: job.template.capabilityVersion,
      chatMessages,
      mediaAssets,
      transcripts,
      ocrResults,
      visionResults
    };

    const { spec, uncertainties } = extractInvitationSpec(context);
    
    // Save initial spec revision
    await env.DB.prepare(`
      INSERT INTO specs (job_id, revision, spec_json, editor, timestamp, change_summary)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(jobId, 1, JSON.stringify(spec), "ai-extractor", nowISO(), "Initial extraction").run();

    job.approvedSpecRevision = 1;
    
    if (uncertainties.some(u => u.blocking)) {
      await transitionJob(env, job, "NEEDS_INPUT", "system", "Blocking uncertainties found");
    } else {
      await transitionJob(env, job, "VALIDATING", "system", "Extraction complete");
      const validation = validateSpec(spec);
      if (validation.valid) {
        await transitionJob(env, job, "READY_TO_BUILD", "system", "Spec validated");
      } else {
        await transitionJob(env, job, "NEEDS_INPUT", "system", `Validation failed: ${validation.errors.join(", ")}`);
      }
    }

  } catch (error) {
    if (error instanceof ZipExtractionError) {
      job.error = { code: error.code, message: error.message, retryable: error.retryable };
    } else {
      job.error = { code: "ANALYSIS_FAILED", message: String(error), retryable: false };
    }
    await transitionJob(env, job, "FAILED", "system", `Analysis failed: ${error}`);
  }
}

async function buildJob(env: Env, jobId: JobId, specRevision: number, idempotencyKey: string): Promise<void> {
  const job = await getJob(env, jobId);
  if (!job) return;

  try {
    // Get approved spec
    const specRecord = await env.DB.prepare(
      "SELECT * FROM specs WHERE job_id = ? AND revision = ?"
    ).bind(jobId, specRevision).first<SpecRecord>();

    if (!specRecord) throw new Error("Spec not found");
    const spec: InvitationSpec = JSON.parse(specRecord.spec_json);

    // Create attempt record
    const attemptNumber = job.currentAttempt;
    const workspaceKey = `jobs/${jobId}/attempts/${attemptNumber}/workspace`;
    
    await env.DB.prepare(`
      INSERT INTO attempts (job_id, attempt, spec_revision, workspace_key, qa_report, changed_files, diff, logs, status, started_at, idempotency_key)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(jobId, attemptNumber, specRevision, workspaceKey, null, "[]", null, "", "building", nowISO(), idempotencyKey).run();

    // Create sandbox
    const sandboxProvider = createSandboxProvider({ provider: "local" });
    const handle = await sandboxProvider.create(jobId, { cpu: 2, memoryMb: 4096, timeoutSec: 600 });

    try {
      // Copy template
      await sandboxProvider.copyTemplate(handle, job.template.version);
      
      // Put input manifest
      await sandboxProvider.putInput(handle, `jobs/${jobId}/normalized/media-manifest.json`);

      // Compile invitation
      const compilerContext: CompilerContext = {
        jobId,
        attempt: attemptNumber,
        spec,
        templateId: job.template.id,
        templateVersion: job.template.version,
        workspacePath: "/workspace"
      };

      const compileResult = await compileInvitation(compilerContext);

      // Save changed files and diff
      await env.DB.prepare(`
        UPDATE attempts SET changed_files = ?, diff = ?, status = ? WHERE job_id = ? AND attempt = ?
      `).bind(JSON.stringify(compileResult.changedFiles), compileResult.diff, "qa", jobId, attemptNumber).run();

      // Build and start preview
      await sandboxProvider.exec(handle, ["npm", "ci"]);
      await sandboxProvider.exec(handle, ["npm", "run", "build"]);
      const preview = await sandboxProvider.startPreview(handle, ["npm", "run", "preview"], 3000);

      // Run browser QA
      const qaResult = await runBrowserQA(
        jobId,
        attemptNumber,
        specRevision,
        preview.url,
        { components: spec.components, exactFacts: spec.exactFacts }
      );

      // Run visual QA
      // Load baseline screenshots (would come from template)
      const baselineMobile = Buffer.alloc(0); // Placeholder
      const baselineDesktop = Buffer.alloc(0); // Placeholder
      
      const visualResult = await compareWithBaseline(
        jobId,
        attemptNumber,
        qaResult.screenshots,
        { mobile: baselineMobile, desktop: baselineDesktop },
        { components: spec.components, designRequests: spec.designRequests }
      );

      // Run AI visual review
      const aiReview = await runAIVisualReview(
        jobId,
        attemptNumber,
        qaResult.screenshots,
        { mobile: baselineMobile, desktop: baselineDesktop },
        { components: spec.components, designRequests: spec.designRequests, customRequirements: spec.customRequirements },
        []
      );

      // Combine QA results
      const combinedQA = qaResult.qaReport;
      combinedQA.visual.issues.push(...visualResult.issues, ...aiReview.issues);
      combinedQA.visual.status = visualResult.issues.some(i => i.severity === "critical") ? "fail" : 
                                 visualResult.issues.some(i => i.severity === "major") ? "review" : "pass";

      // Determine overall status
      const criticalIssues = [...combinedQA.browser.failedRequests.filter(r => r.status >= 500), 
        ...combinedQA.facts.issues.filter(i => i.severity === "critical"),
        ...combinedQA.visual.issues.filter(i => i.severity === "critical")].length;

      if (criticalIssues > 0) {
        combinedQA.overallStatus = "fail";
        await transitionJob(env, job, "QA_FAILED", "system", "Critical QA issues found");
      } else if (combinedQA.visual.status === "review" || combinedQA.browser.status === "fail") {
        combinedQA.overallStatus = "review";
        await transitionJob(env, job, "READY_FOR_STAFF", "system", "QA completed with issues for review");
      } else {
        combinedQA.overallStatus = "pass";
        await transitionJob(env, job, "QA_PASSED", "system", "QA passed");
        await transitionJob(env, job, "READY_FOR_STAFF", "system", "Ready for staff review");
      }

      // Save QA report
      await env.R2.put(`jobs/${jobId}/attempts/${attemptNumber}/qa.json`, JSON.stringify(combinedQA));
      await env.DB.prepare(`
        UPDATE attempts SET qa_report = ?, status = ?, completed_at = ? WHERE job_id = ? AND attempt = ?
      `).bind(JSON.stringify(combinedQA), "completed", nowISO(), jobId, attemptNumber).run();

      // Capture artifacts
      await sandboxProvider.captureArtifacts(handle, ["dist", "screenshots"]);

    } finally {
      await sandboxProvider.destroy(handle);
    }

  } catch (error) {
    job.error = { code: "BUILD_FAILED", message: String(error), retryable: false };
    await transitionJob(env, job, "BUILD_FAILED", "system", `Build failed: ${error}`);
  }
}

async function repairJob(env: Env, jobId: JobId): Promise<void> {
  const job = await getJob(env, jobId);
  if (!job) return;

  // Increment attempt and rebuild
  job.currentAttempt += 1;
  await buildJob(env, jobId, job.approvedSpecRevision!, `repair-${job.currentAttempt}-${Date.now()}`);
}

export default app;