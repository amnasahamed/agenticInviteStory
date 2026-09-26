import { z } from "zod";
export declare const ISODateTime: z.ZodString;
export type ISODateTimeType = z.infer<typeof ISODateTime>;
export declare const SHA256Hash: z.ZodString;
export declare const ULID: z.ZodString;
export declare const JobId: z.ZodBranded<z.ZodString, "JobId">;
export declare const SpecRevision: z.ZodNumber;
export declare const AttemptNumber: z.ZodNumber;
export declare const TemplateId: z.ZodBranded<z.ZodString, "TemplateId">;
export declare const AssetId: z.ZodBranded<z.ZodString, "AssetId">;
export declare const PersonId: z.ZodBranded<z.ZodString, "PersonId">;
export declare const ComponentId: z.ZodBranded<z.ZodString, "ComponentId">;
export declare const VenueId: z.ZodBranded<z.ZodString, "VenueId">;
export declare const MessageId: z.ZodBranded<z.ZodString, "MessageId">;
export declare const EvidenceRef: z.ZodBranded<z.ZodString, "EvidenceRef">;
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
export declare const JobState: z.ZodEnum<["RECEIVED", "INGESTING", "EXTRACTING", "VALIDATING", "NEEDS_INPUT", "READY_TO_BUILD", "BUILDING", "BUILD_FAILED", "BROWSER_QA", "QA_FAILED", "REPAIRING", "QA_PASSED", "READY_FOR_STAFF", "APPROVED", "PUSHING_GIT", "DEPLOYING", "COMPLETED", "CANCELLED", "ESCALATED", "FAILED"]>;
export type JobState = z.infer<typeof JobState>;
export declare const Job: z.ZodObject<{
    jobId: z.ZodBranded<z.ZodString, "JobId">;
    state: z.ZodEnum<["RECEIVED", "INGESTING", "EXTRACTING", "VALIDATING", "NEEDS_INPUT", "READY_TO_BUILD", "BUILDING", "BUILD_FAILED", "BROWSER_QA", "QA_FAILED", "REPAIRING", "QA_PASSED", "READY_FOR_STAFF", "APPROVED", "PUSHING_GIT", "DEPLOYING", "COMPLETED", "CANCELLED", "ESCALATED", "FAILED"]>;
    template: z.ZodObject<{
        id: z.ZodBranded<z.ZodString, "TemplateId">;
        version: z.ZodString;
        capabilityVersion: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string & z.BRAND<"TemplateId">;
        version: string;
        capabilityVersion: string;
    }, {
        id: string;
        version: string;
        capabilityVersion: string;
    }>;
    historicalOrderId: z.ZodOptional<z.ZodString>;
    createdBy: z.ZodString;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    approvedSpecRevision: z.ZodNullable<z.ZodNumber>;
    currentAttempt: z.ZodNumber;
    inputHash: z.ZodString;
    uploadKeys: z.ZodObject<{
        originalZip: z.ZodString;
        extras: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        originalZip: string;
        extras: string[];
    }, {
        originalZip: string;
        extras?: string[] | undefined;
    }>;
    usage: z.ZodDefault<z.ZodObject<{
        modelCostInr: z.ZodDefault<z.ZodNumber>;
        sandboxSeconds: z.ZodDefault<z.ZodNumber>;
        humanReviewSeconds: z.ZodNullable<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        modelCostInr: number;
        sandboxSeconds: number;
        humanReviewSeconds: number | null;
    }, {
        humanReviewSeconds: number | null;
        modelCostInr?: number | undefined;
        sandboxSeconds?: number | undefined;
    }>>;
    error: z.ZodNullable<z.ZodObject<{
        code: z.ZodString;
        message: z.ZodString;
        retryable: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        code: string;
        message: string;
        retryable: boolean;
    }, {
        code: string;
        message: string;
        retryable: boolean;
    }>>;
    transitionLog: z.ZodDefault<z.ZodArray<z.ZodObject<{
        from: z.ZodEnum<["RECEIVED", "INGESTING", "EXTRACTING", "VALIDATING", "NEEDS_INPUT", "READY_TO_BUILD", "BUILDING", "BUILD_FAILED", "BROWSER_QA", "QA_FAILED", "REPAIRING", "QA_PASSED", "READY_FOR_STAFF", "APPROVED", "PUSHING_GIT", "DEPLOYING", "COMPLETED", "CANCELLED", "ESCALATED", "FAILED"]>;
        to: z.ZodEnum<["RECEIVED", "INGESTING", "EXTRACTING", "VALIDATING", "NEEDS_INPUT", "READY_TO_BUILD", "BUILDING", "BUILD_FAILED", "BROWSER_QA", "QA_FAILED", "REPAIRING", "QA_PASSED", "READY_FOR_STAFF", "APPROVED", "PUSHING_GIT", "DEPLOYING", "COMPLETED", "CANCELLED", "ESCALATED", "FAILED"]>;
        actor: z.ZodString;
        timestamp: z.ZodString;
        reason: z.ZodOptional<z.ZodString>;
        specRevision: z.ZodOptional<z.ZodNumber>;
        attempt: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        from: "RECEIVED" | "INGESTING" | "EXTRACTING" | "VALIDATING" | "NEEDS_INPUT" | "READY_TO_BUILD" | "BUILDING" | "BUILD_FAILED" | "BROWSER_QA" | "QA_FAILED" | "REPAIRING" | "QA_PASSED" | "READY_FOR_STAFF" | "APPROVED" | "PUSHING_GIT" | "DEPLOYING" | "COMPLETED" | "CANCELLED" | "ESCALATED" | "FAILED";
        to: "RECEIVED" | "INGESTING" | "EXTRACTING" | "VALIDATING" | "NEEDS_INPUT" | "READY_TO_BUILD" | "BUILDING" | "BUILD_FAILED" | "BROWSER_QA" | "QA_FAILED" | "REPAIRING" | "QA_PASSED" | "READY_FOR_STAFF" | "APPROVED" | "PUSHING_GIT" | "DEPLOYING" | "COMPLETED" | "CANCELLED" | "ESCALATED" | "FAILED";
        actor: string;
        timestamp: string;
        reason?: string | undefined;
        specRevision?: number | undefined;
        attempt?: number | undefined;
    }, {
        from: "RECEIVED" | "INGESTING" | "EXTRACTING" | "VALIDATING" | "NEEDS_INPUT" | "READY_TO_BUILD" | "BUILDING" | "BUILD_FAILED" | "BROWSER_QA" | "QA_FAILED" | "REPAIRING" | "QA_PASSED" | "READY_FOR_STAFF" | "APPROVED" | "PUSHING_GIT" | "DEPLOYING" | "COMPLETED" | "CANCELLED" | "ESCALATED" | "FAILED";
        to: "RECEIVED" | "INGESTING" | "EXTRACTING" | "VALIDATING" | "NEEDS_INPUT" | "READY_TO_BUILD" | "BUILDING" | "BUILD_FAILED" | "BROWSER_QA" | "QA_FAILED" | "REPAIRING" | "QA_PASSED" | "READY_FOR_STAFF" | "APPROVED" | "PUSHING_GIT" | "DEPLOYING" | "COMPLETED" | "CANCELLED" | "ESCALATED" | "FAILED";
        actor: string;
        timestamp: string;
        reason?: string | undefined;
        specRevision?: number | undefined;
        attempt?: number | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    jobId: string & z.BRAND<"JobId">;
    state: "RECEIVED" | "INGESTING" | "EXTRACTING" | "VALIDATING" | "NEEDS_INPUT" | "READY_TO_BUILD" | "BUILDING" | "BUILD_FAILED" | "BROWSER_QA" | "QA_FAILED" | "REPAIRING" | "QA_PASSED" | "READY_FOR_STAFF" | "APPROVED" | "PUSHING_GIT" | "DEPLOYING" | "COMPLETED" | "CANCELLED" | "ESCALATED" | "FAILED";
    template: {
        id: string & z.BRAND<"TemplateId">;
        version: string;
        capabilityVersion: string;
    };
    createdBy: string;
    createdAt: string;
    updatedAt: string;
    approvedSpecRevision: number | null;
    currentAttempt: number;
    inputHash: string;
    uploadKeys: {
        originalZip: string;
        extras: string[];
    };
    usage: {
        modelCostInr: number;
        sandboxSeconds: number;
        humanReviewSeconds: number | null;
    };
    error: {
        code: string;
        message: string;
        retryable: boolean;
    } | null;
    transitionLog: {
        from: "RECEIVED" | "INGESTING" | "EXTRACTING" | "VALIDATING" | "NEEDS_INPUT" | "READY_TO_BUILD" | "BUILDING" | "BUILD_FAILED" | "BROWSER_QA" | "QA_FAILED" | "REPAIRING" | "QA_PASSED" | "READY_FOR_STAFF" | "APPROVED" | "PUSHING_GIT" | "DEPLOYING" | "COMPLETED" | "CANCELLED" | "ESCALATED" | "FAILED";
        to: "RECEIVED" | "INGESTING" | "EXTRACTING" | "VALIDATING" | "NEEDS_INPUT" | "READY_TO_BUILD" | "BUILDING" | "BUILD_FAILED" | "BROWSER_QA" | "QA_FAILED" | "REPAIRING" | "QA_PASSED" | "READY_FOR_STAFF" | "APPROVED" | "PUSHING_GIT" | "DEPLOYING" | "COMPLETED" | "CANCELLED" | "ESCALATED" | "FAILED";
        actor: string;
        timestamp: string;
        reason?: string | undefined;
        specRevision?: number | undefined;
        attempt?: number | undefined;
    }[];
    historicalOrderId?: string | undefined;
}, {
    jobId: string;
    state: "RECEIVED" | "INGESTING" | "EXTRACTING" | "VALIDATING" | "NEEDS_INPUT" | "READY_TO_BUILD" | "BUILDING" | "BUILD_FAILED" | "BROWSER_QA" | "QA_FAILED" | "REPAIRING" | "QA_PASSED" | "READY_FOR_STAFF" | "APPROVED" | "PUSHING_GIT" | "DEPLOYING" | "COMPLETED" | "CANCELLED" | "ESCALATED" | "FAILED";
    template: {
        id: string;
        version: string;
        capabilityVersion: string;
    };
    createdBy: string;
    createdAt: string;
    updatedAt: string;
    approvedSpecRevision: number | null;
    currentAttempt: number;
    inputHash: string;
    uploadKeys: {
        originalZip: string;
        extras?: string[] | undefined;
    };
    error: {
        code: string;
        message: string;
        retryable: boolean;
    } | null;
    historicalOrderId?: string | undefined;
    usage?: {
        humanReviewSeconds: number | null;
        modelCostInr?: number | undefined;
        sandboxSeconds?: number | undefined;
    } | undefined;
    transitionLog?: {
        from: "RECEIVED" | "INGESTING" | "EXTRACTING" | "VALIDATING" | "NEEDS_INPUT" | "READY_TO_BUILD" | "BUILDING" | "BUILD_FAILED" | "BROWSER_QA" | "QA_FAILED" | "REPAIRING" | "QA_PASSED" | "READY_FOR_STAFF" | "APPROVED" | "PUSHING_GIT" | "DEPLOYING" | "COMPLETED" | "CANCELLED" | "ESCALATED" | "FAILED";
        to: "RECEIVED" | "INGESTING" | "EXTRACTING" | "VALIDATING" | "NEEDS_INPUT" | "READY_TO_BUILD" | "BUILDING" | "BUILD_FAILED" | "BROWSER_QA" | "QA_FAILED" | "REPAIRING" | "QA_PASSED" | "READY_FOR_STAFF" | "APPROVED" | "PUSHING_GIT" | "DEPLOYING" | "COMPLETED" | "CANCELLED" | "ESCALATED" | "FAILED";
        actor: string;
        timestamp: string;
        reason?: string | undefined;
        specRevision?: number | undefined;
        attempt?: number | undefined;
    }[] | undefined;
}>;
export type Job = z.infer<typeof Job>;
export declare const CreateJobInput: z.ZodObject<{
    templateId: z.ZodBranded<z.ZodString, "TemplateId">;
    historicalOrderId: z.ZodOptional<z.ZodString>;
    idempotencyKey: z.ZodString;
}, "strip", z.ZodTypeAny, {
    templateId: string & z.BRAND<"TemplateId">;
    idempotencyKey: string;
    historicalOrderId?: string | undefined;
}, {
    templateId: string;
    idempotencyKey: string;
    historicalOrderId?: string | undefined;
}>;
export type CreateJobInput = z.infer<typeof CreateJobInput>;
export declare const MediaKind: z.ZodEnum<["image", "audio", "video", "pdf", "document", "other"]>;
export type MediaKind = z.infer<typeof MediaKind>;
export declare const MediaAsset: z.ZodObject<{
    id: z.ZodBranded<z.ZodString, "AssetId">;
    kind: z.ZodEnum<["image", "audio", "video", "pdf", "document", "other"]>;
    originalName: z.ZodString;
    mimeType: z.ZodString;
    size: z.ZodNumber;
    sha256: z.ZodString;
    sourceKey: z.ZodString;
    relatedMessageIds: z.ZodDefault<z.ZodArray<z.ZodBranded<z.ZodString, "MessageId">, "many">>;
    transcriptRef: z.ZodOptional<z.ZodString>;
    ocrRef: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string & z.BRAND<"AssetId">;
    kind: "image" | "audio" | "video" | "pdf" | "document" | "other";
    originalName: string;
    mimeType: string;
    size: number;
    sha256: string;
    sourceKey: string;
    relatedMessageIds: (string & z.BRAND<"MessageId">)[];
    transcriptRef?: string | undefined;
    ocrRef?: string | undefined;
}, {
    id: string;
    kind: "image" | "audio" | "video" | "pdf" | "document" | "other";
    originalName: string;
    mimeType: string;
    size: number;
    sha256: string;
    sourceKey: string;
    relatedMessageIds?: string[] | undefined;
    transcriptRef?: string | undefined;
    ocrRef?: string | undefined;
}>;
export type MediaAsset = z.infer<typeof MediaAsset>;
export declare const ChatMessage: z.ZodObject<{
    id: z.ZodBranded<z.ZodString, "MessageId">;
    timestamp: z.ZodString;
    sender: z.ZodString;
    rawText: z.ZodString;
    mediaAssetIds: z.ZodDefault<z.ZodArray<z.ZodBranded<z.ZodString, "AssetId">, "many">>;
    isVoice: z.ZodDefault<z.ZodBoolean>;
    voiceDurationSec: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    id: string & z.BRAND<"MessageId">;
    timestamp: string;
    sender: string;
    rawText: string;
    mediaAssetIds: (string & z.BRAND<"AssetId">)[];
    isVoice: boolean;
    voiceDurationSec?: number | undefined;
}, {
    id: string;
    timestamp: string;
    sender: string;
    rawText: string;
    mediaAssetIds?: string[] | undefined;
    isVoice?: boolean | undefined;
    voiceDurationSec?: number | undefined;
}>;
export type ChatMessage = z.infer<typeof ChatMessage>;
export declare const MediaManifest: z.ZodObject<{
    jobId: z.ZodBranded<z.ZodString, "JobId">;
    chatMessages: z.ZodArray<z.ZodObject<{
        id: z.ZodBranded<z.ZodString, "MessageId">;
        timestamp: z.ZodString;
        sender: z.ZodString;
        rawText: z.ZodString;
        mediaAssetIds: z.ZodDefault<z.ZodArray<z.ZodBranded<z.ZodString, "AssetId">, "many">>;
        isVoice: z.ZodDefault<z.ZodBoolean>;
        voiceDurationSec: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        id: string & z.BRAND<"MessageId">;
        timestamp: string;
        sender: string;
        rawText: string;
        mediaAssetIds: (string & z.BRAND<"AssetId">)[];
        isVoice: boolean;
        voiceDurationSec?: number | undefined;
    }, {
        id: string;
        timestamp: string;
        sender: string;
        rawText: string;
        mediaAssetIds?: string[] | undefined;
        isVoice?: boolean | undefined;
        voiceDurationSec?: number | undefined;
    }>, "many">;
    assets: z.ZodArray<z.ZodObject<{
        id: z.ZodBranded<z.ZodString, "AssetId">;
        kind: z.ZodEnum<["image", "audio", "video", "pdf", "document", "other"]>;
        originalName: z.ZodString;
        mimeType: z.ZodString;
        size: z.ZodNumber;
        sha256: z.ZodString;
        sourceKey: z.ZodString;
        relatedMessageIds: z.ZodDefault<z.ZodArray<z.ZodBranded<z.ZodString, "MessageId">, "many">>;
        transcriptRef: z.ZodOptional<z.ZodString>;
        ocrRef: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string & z.BRAND<"AssetId">;
        kind: "image" | "audio" | "video" | "pdf" | "document" | "other";
        originalName: string;
        mimeType: string;
        size: number;
        sha256: string;
        sourceKey: string;
        relatedMessageIds: (string & z.BRAND<"MessageId">)[];
        transcriptRef?: string | undefined;
        ocrRef?: string | undefined;
    }, {
        id: string;
        kind: "image" | "audio" | "video" | "pdf" | "document" | "other";
        originalName: string;
        mimeType: string;
        size: number;
        sha256: string;
        sourceKey: string;
        relatedMessageIds?: string[] | undefined;
        transcriptRef?: string | undefined;
        ocrRef?: string | undefined;
    }>, "many">;
    extractedAt: z.ZodString;
    extractorVersion: z.ZodString;
}, "strip", z.ZodTypeAny, {
    jobId: string & z.BRAND<"JobId">;
    chatMessages: {
        id: string & z.BRAND<"MessageId">;
        timestamp: string;
        sender: string;
        rawText: string;
        mediaAssetIds: (string & z.BRAND<"AssetId">)[];
        isVoice: boolean;
        voiceDurationSec?: number | undefined;
    }[];
    assets: {
        id: string & z.BRAND<"AssetId">;
        kind: "image" | "audio" | "video" | "pdf" | "document" | "other";
        originalName: string;
        mimeType: string;
        size: number;
        sha256: string;
        sourceKey: string;
        relatedMessageIds: (string & z.BRAND<"MessageId">)[];
        transcriptRef?: string | undefined;
        ocrRef?: string | undefined;
    }[];
    extractedAt: string;
    extractorVersion: string;
}, {
    jobId: string;
    chatMessages: {
        id: string;
        timestamp: string;
        sender: string;
        rawText: string;
        mediaAssetIds?: string[] | undefined;
        isVoice?: boolean | undefined;
        voiceDurationSec?: number | undefined;
    }[];
    assets: {
        id: string;
        kind: "image" | "audio" | "video" | "pdf" | "document" | "other";
        originalName: string;
        mimeType: string;
        size: number;
        sha256: string;
        sourceKey: string;
        relatedMessageIds?: string[] | undefined;
        transcriptRef?: string | undefined;
        ocrRef?: string | undefined;
    }[];
    extractedAt: string;
    extractorVersion: string;
}>;
export type MediaManifest = z.infer<typeof MediaManifest>;
export declare const Person: z.ZodObject<{
    id: z.ZodBranded<z.ZodString, "PersonId">;
    displayName: z.ZodString;
    role: z.ZodEnum<["partner", "parent", "sibling", "friend", "other"]>;
    evidence: z.ZodDefault<z.ZodArray<z.ZodBranded<z.ZodString, "EvidenceRef">, "many">>;
}, "strip", z.ZodTypeAny, {
    id: string & z.BRAND<"PersonId">;
    displayName: string;
    role: "other" | "partner" | "parent" | "sibling" | "friend";
    evidence: (string & z.BRAND<"EvidenceRef">)[];
}, {
    id: string;
    displayName: string;
    role: "other" | "partner" | "parent" | "sibling" | "friend";
    evidence?: string[] | undefined;
}>;
export type Person = z.infer<typeof Person>;
export declare const Venue: z.ZodObject<{
    id: z.ZodBranded<z.ZodString, "VenueId">;
    name: z.ZodString;
    address: z.ZodString;
    mapUrl: z.ZodOptional<z.ZodString>;
    evidence: z.ZodDefault<z.ZodArray<z.ZodBranded<z.ZodString, "EvidenceRef">, "many">>;
}, "strip", z.ZodTypeAny, {
    id: string & z.BRAND<"VenueId">;
    evidence: (string & z.BRAND<"EvidenceRef">)[];
    name: string;
    address: string;
    mapUrl?: string | undefined;
}, {
    id: string;
    name: string;
    address: string;
    evidence?: string[] | undefined;
    mapUrl?: string | undefined;
}>;
export type Venue = z.infer<typeof Venue>;
export declare const AssetRef: z.ZodObject<{
    id: z.ZodBranded<z.ZodString, "AssetId">;
    kind: z.ZodEnum<["image", "audio", "video", "pdf", "document", "other"]>;
    sourceKey: z.ZodString;
    sha256: z.ZodString;
    purpose: z.ZodEnum<["hero", "gallery", "profile", "background", "music", "other"]>;
    crop: z.ZodDefault<z.ZodEnum<["face-safe", "center", "custom", "none"]>>;
    cropParams: z.ZodOptional<z.ZodObject<{
        x: z.ZodNumber;
        y: z.ZodNumber;
        width: z.ZodNumber;
        height: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        x: number;
        y: number;
        width: number;
        height: number;
    }, {
        x: number;
        y: number;
        width: number;
        height: number;
    }>>;
    evidence: z.ZodDefault<z.ZodArray<z.ZodBranded<z.ZodString, "EvidenceRef">, "many">>;
}, "strip", z.ZodTypeAny, {
    id: string & z.BRAND<"AssetId">;
    kind: "image" | "audio" | "video" | "pdf" | "document" | "other";
    sha256: string;
    sourceKey: string;
    evidence: (string & z.BRAND<"EvidenceRef">)[];
    purpose: "other" | "hero" | "gallery" | "profile" | "background" | "music";
    crop: "custom" | "face-safe" | "center" | "none";
    cropParams?: {
        x: number;
        y: number;
        width: number;
        height: number;
    } | undefined;
}, {
    id: string;
    kind: "image" | "audio" | "video" | "pdf" | "document" | "other";
    sha256: string;
    sourceKey: string;
    purpose: "other" | "hero" | "gallery" | "profile" | "background" | "music";
    evidence?: string[] | undefined;
    crop?: "custom" | "face-safe" | "center" | "none" | undefined;
    cropParams?: {
        x: number;
        y: number;
        width: number;
        height: number;
    } | undefined;
}>;
export type AssetRef = z.infer<typeof AssetRef>;
export declare const ComponentVariant: z.ZodUnion<[z.ZodLiteral<"portrait">, z.ZodLiteral<"landscape">, z.ZodLiteral<"ceremony">, z.ZodLiteral<"reception">, z.ZodLiteral<"mehndi">, z.ZodLiteral<"sangeet">, z.ZodLiteral<"grid">, z.ZodLiteral<"carousel">, z.ZodLiteral<"masonry">, z.ZodLiteral<"whatsapp">, z.ZodLiteral<"form">, z.ZodLiteral<"toggle">, z.ZodLiteral<"player">, z.ZodLiteral<"embed">, z.ZodLiteral<"timer">, z.ZodLiteral<"side-by-side">]>;
export type ComponentVariant = z.infer<typeof ComponentVariant>;
export declare const Component: z.ZodObject<{
    id: z.ZodBranded<z.ZodString, "ComponentId">;
    type: z.ZodEnum<["hero", "event", "gallery", "rsvp", "music", "map", "countdown", "couple", "family", "story", "note", "custom"]>;
    variant: z.ZodUnion<[z.ZodLiteral<"portrait">, z.ZodLiteral<"landscape">, z.ZodLiteral<"ceremony">, z.ZodLiteral<"reception">, z.ZodLiteral<"mehndi">, z.ZodLiteral<"sangeet">, z.ZodLiteral<"grid">, z.ZodLiteral<"carousel">, z.ZodLiteral<"masonry">, z.ZodLiteral<"whatsapp">, z.ZodLiteral<"form">, z.ZodLiteral<"toggle">, z.ZodLiteral<"player">, z.ZodLiteral<"embed">, z.ZodLiteral<"timer">, z.ZodLiteral<"side-by-side">]>;
    data: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    evidence: z.ZodDefault<z.ZodArray<z.ZodBranded<z.ZodString, "EvidenceRef">, "many">>;
}, "strip", z.ZodTypeAny, {
    type: "map" | "custom" | "hero" | "gallery" | "music" | "event" | "rsvp" | "countdown" | "couple" | "family" | "story" | "note";
    id: string & z.BRAND<"ComponentId">;
    evidence: (string & z.BRAND<"EvidenceRef">)[];
    variant: "portrait" | "landscape" | "ceremony" | "reception" | "mehndi" | "sangeet" | "grid" | "carousel" | "masonry" | "whatsapp" | "form" | "toggle" | "player" | "embed" | "timer" | "side-by-side";
    data: Record<string, unknown>;
}, {
    type: "map" | "custom" | "hero" | "gallery" | "music" | "event" | "rsvp" | "countdown" | "couple" | "family" | "story" | "note";
    id: string;
    variant: "portrait" | "landscape" | "ceremony" | "reception" | "mehndi" | "sangeet" | "grid" | "carousel" | "masonry" | "whatsapp" | "form" | "toggle" | "player" | "embed" | "timer" | "side-by-side";
    data: Record<string, unknown>;
    evidence?: string[] | undefined;
}>;
export type Component = z.infer<typeof Component>;
export declare const DesignRequest: z.ZodObject<{
    id: z.ZodBranded<z.ZodString, "DesignRequestId">;
    kind: z.ZodEnum<["color", "font", "layout", "animation", "effect", "custom"]>;
    target: z.ZodString;
    value: z.ZodUnknown;
    referenceAssetId: z.ZodNullable<z.ZodBranded<z.ZodString, "AssetId">>;
    evidence: z.ZodDefault<z.ZodArray<z.ZodBranded<z.ZodString, "EvidenceRef">, "many">>;
}, "strip", z.ZodTypeAny, {
    id: string & z.BRAND<"DesignRequestId">;
    kind: "custom" | "color" | "font" | "layout" | "animation" | "effect";
    evidence: (string & z.BRAND<"EvidenceRef">)[];
    target: string;
    referenceAssetId: (string & z.BRAND<"AssetId">) | null;
    value?: unknown;
}, {
    id: string;
    kind: "custom" | "color" | "font" | "layout" | "animation" | "effect";
    target: string;
    referenceAssetId: string | null;
    value?: unknown;
    evidence?: string[] | undefined;
}>;
export type DesignRequest = z.infer<typeof DesignRequest>;
export declare const CustomRequirement: z.ZodObject<{
    id: z.ZodBranded<z.ZodString, "CustomRequirementId">;
    instruction: z.ZodString;
    target: z.ZodBranded<z.ZodString, "ComponentId">;
    status: z.ZodEnum<["pending", "requires-agent", "requires-image-tool", "in-progress", "done", "blocked"]>;
    evidence: z.ZodDefault<z.ZodArray<z.ZodBranded<z.ZodString, "EvidenceRef">, "many">>;
}, "strip", z.ZodTypeAny, {
    status: "pending" | "requires-agent" | "requires-image-tool" | "in-progress" | "done" | "blocked";
    id: string & z.BRAND<"CustomRequirementId">;
    evidence: (string & z.BRAND<"EvidenceRef">)[];
    target: string & z.BRAND<"ComponentId">;
    instruction: string;
}, {
    status: "pending" | "requires-agent" | "requires-image-tool" | "in-progress" | "done" | "blocked";
    id: string;
    target: string;
    instruction: string;
    evidence?: string[] | undefined;
}>;
export type CustomRequirement = z.infer<typeof CustomRequirement>;
export declare const Uncertainty: z.ZodObject<{
    id: z.ZodBranded<z.ZodString, "UncertaintyId">;
    field: z.ZodString;
    reason: z.ZodString;
    blocking: z.ZodBoolean;
    resolution: z.ZodOptional<z.ZodEnum<["omit", "ask", "infer", "use-default"]>>;
    resolvedValue: z.ZodOptional<z.ZodUnknown>;
}, "strip", z.ZodTypeAny, {
    id: string & z.BRAND<"UncertaintyId">;
    reason: string;
    field: string;
    blocking: boolean;
    resolution?: "omit" | "ask" | "infer" | "use-default" | undefined;
    resolvedValue?: unknown;
}, {
    id: string;
    reason: string;
    field: string;
    blocking: boolean;
    resolution?: "omit" | "ask" | "infer" | "use-default" | undefined;
    resolvedValue?: unknown;
}>;
export type Uncertainty = z.infer<typeof Uncertainty>;
export declare const ExactFact: z.ZodObject<{
    path: z.ZodString;
    expected: z.ZodUnknown;
    severity: z.ZodEnum<["critical", "major", "minor"]>;
}, "strip", z.ZodTypeAny, {
    path: string;
    severity: "critical" | "major" | "minor";
    expected?: unknown;
}, {
    path: string;
    severity: "critical" | "major" | "minor";
    expected?: unknown;
}>;
export type ExactFact = z.infer<typeof ExactFact>;
export declare const InvitationSpec: z.ZodObject<{
    schemaVersion: z.ZodDefault<z.ZodString>;
    jobId: z.ZodBranded<z.ZodString, "JobId">;
    revision: z.ZodNumber;
    template: z.ZodObject<{
        id: z.ZodBranded<z.ZodString, "TemplateId">;
        version: z.ZodString;
        capabilityVersion: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string & z.BRAND<"TemplateId">;
        version: string;
        capabilityVersion: string;
    }, {
        id: string;
        version: string;
        capabilityVersion: string;
    }>;
    locale: z.ZodDefault<z.ZodString>;
    timeZone: z.ZodDefault<z.ZodString>;
    people: z.ZodArray<z.ZodObject<{
        id: z.ZodBranded<z.ZodString, "PersonId">;
        displayName: z.ZodString;
        role: z.ZodEnum<["partner", "parent", "sibling", "friend", "other"]>;
        evidence: z.ZodDefault<z.ZodArray<z.ZodBranded<z.ZodString, "EvidenceRef">, "many">>;
    }, "strip", z.ZodTypeAny, {
        id: string & z.BRAND<"PersonId">;
        displayName: string;
        role: "other" | "partner" | "parent" | "sibling" | "friend";
        evidence: (string & z.BRAND<"EvidenceRef">)[];
    }, {
        id: string;
        displayName: string;
        role: "other" | "partner" | "parent" | "sibling" | "friend";
        evidence?: string[] | undefined;
    }>, "many">;
    assets: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodBranded<z.ZodString, "AssetId">;
        kind: z.ZodEnum<["image", "audio", "video", "pdf", "document", "other"]>;
        sourceKey: z.ZodString;
        sha256: z.ZodString;
        purpose: z.ZodEnum<["hero", "gallery", "profile", "background", "music", "other"]>;
        crop: z.ZodDefault<z.ZodEnum<["face-safe", "center", "custom", "none"]>>;
        cropParams: z.ZodOptional<z.ZodObject<{
            x: z.ZodNumber;
            y: z.ZodNumber;
            width: z.ZodNumber;
            height: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            x: number;
            y: number;
            width: number;
            height: number;
        }, {
            x: number;
            y: number;
            width: number;
            height: number;
        }>>;
        evidence: z.ZodDefault<z.ZodArray<z.ZodBranded<z.ZodString, "EvidenceRef">, "many">>;
    }, "strip", z.ZodTypeAny, {
        id: string & z.BRAND<"AssetId">;
        kind: "image" | "audio" | "video" | "pdf" | "document" | "other";
        sha256: string;
        sourceKey: string;
        evidence: (string & z.BRAND<"EvidenceRef">)[];
        purpose: "other" | "hero" | "gallery" | "profile" | "background" | "music";
        crop: "custom" | "face-safe" | "center" | "none";
        cropParams?: {
            x: number;
            y: number;
            width: number;
            height: number;
        } | undefined;
    }, {
        id: string;
        kind: "image" | "audio" | "video" | "pdf" | "document" | "other";
        sha256: string;
        sourceKey: string;
        purpose: "other" | "hero" | "gallery" | "profile" | "background" | "music";
        evidence?: string[] | undefined;
        crop?: "custom" | "face-safe" | "center" | "none" | undefined;
        cropParams?: {
            x: number;
            y: number;
            width: number;
            height: number;
        } | undefined;
    }>, "many">>;
    components: z.ZodArray<z.ZodObject<{
        id: z.ZodBranded<z.ZodString, "ComponentId">;
        type: z.ZodEnum<["hero", "event", "gallery", "rsvp", "music", "map", "countdown", "couple", "family", "story", "note", "custom"]>;
        variant: z.ZodUnion<[z.ZodLiteral<"portrait">, z.ZodLiteral<"landscape">, z.ZodLiteral<"ceremony">, z.ZodLiteral<"reception">, z.ZodLiteral<"mehndi">, z.ZodLiteral<"sangeet">, z.ZodLiteral<"grid">, z.ZodLiteral<"carousel">, z.ZodLiteral<"masonry">, z.ZodLiteral<"whatsapp">, z.ZodLiteral<"form">, z.ZodLiteral<"toggle">, z.ZodLiteral<"player">, z.ZodLiteral<"embed">, z.ZodLiteral<"timer">, z.ZodLiteral<"side-by-side">]>;
        data: z.ZodRecord<z.ZodString, z.ZodUnknown>;
        evidence: z.ZodDefault<z.ZodArray<z.ZodBranded<z.ZodString, "EvidenceRef">, "many">>;
    }, "strip", z.ZodTypeAny, {
        type: "map" | "custom" | "hero" | "gallery" | "music" | "event" | "rsvp" | "countdown" | "couple" | "family" | "story" | "note";
        id: string & z.BRAND<"ComponentId">;
        evidence: (string & z.BRAND<"EvidenceRef">)[];
        variant: "portrait" | "landscape" | "ceremony" | "reception" | "mehndi" | "sangeet" | "grid" | "carousel" | "masonry" | "whatsapp" | "form" | "toggle" | "player" | "embed" | "timer" | "side-by-side";
        data: Record<string, unknown>;
    }, {
        type: "map" | "custom" | "hero" | "gallery" | "music" | "event" | "rsvp" | "countdown" | "couple" | "family" | "story" | "note";
        id: string;
        variant: "portrait" | "landscape" | "ceremony" | "reception" | "mehndi" | "sangeet" | "grid" | "carousel" | "masonry" | "whatsapp" | "form" | "toggle" | "player" | "embed" | "timer" | "side-by-side";
        data: Record<string, unknown>;
        evidence?: string[] | undefined;
    }>, "many">;
    venues: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodBranded<z.ZodString, "VenueId">;
        name: z.ZodString;
        address: z.ZodString;
        mapUrl: z.ZodOptional<z.ZodString>;
        evidence: z.ZodDefault<z.ZodArray<z.ZodBranded<z.ZodString, "EvidenceRef">, "many">>;
    }, "strip", z.ZodTypeAny, {
        id: string & z.BRAND<"VenueId">;
        evidence: (string & z.BRAND<"EvidenceRef">)[];
        name: string;
        address: string;
        mapUrl?: string | undefined;
    }, {
        id: string;
        name: string;
        address: string;
        evidence?: string[] | undefined;
        mapUrl?: string | undefined;
    }>, "many">>;
    designRequests: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodBranded<z.ZodString, "DesignRequestId">;
        kind: z.ZodEnum<["color", "font", "layout", "animation", "effect", "custom"]>;
        target: z.ZodString;
        value: z.ZodUnknown;
        referenceAssetId: z.ZodNullable<z.ZodBranded<z.ZodString, "AssetId">>;
        evidence: z.ZodDefault<z.ZodArray<z.ZodBranded<z.ZodString, "EvidenceRef">, "many">>;
    }, "strip", z.ZodTypeAny, {
        id: string & z.BRAND<"DesignRequestId">;
        kind: "custom" | "color" | "font" | "layout" | "animation" | "effect";
        evidence: (string & z.BRAND<"EvidenceRef">)[];
        target: string;
        referenceAssetId: (string & z.BRAND<"AssetId">) | null;
        value?: unknown;
    }, {
        id: string;
        kind: "custom" | "color" | "font" | "layout" | "animation" | "effect";
        target: string;
        referenceAssetId: string | null;
        value?: unknown;
        evidence?: string[] | undefined;
    }>, "many">>;
    customRequirements: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodBranded<z.ZodString, "CustomRequirementId">;
        instruction: z.ZodString;
        target: z.ZodBranded<z.ZodString, "ComponentId">;
        status: z.ZodEnum<["pending", "requires-agent", "requires-image-tool", "in-progress", "done", "blocked"]>;
        evidence: z.ZodDefault<z.ZodArray<z.ZodBranded<z.ZodString, "EvidenceRef">, "many">>;
    }, "strip", z.ZodTypeAny, {
        status: "pending" | "requires-agent" | "requires-image-tool" | "in-progress" | "done" | "blocked";
        id: string & z.BRAND<"CustomRequirementId">;
        evidence: (string & z.BRAND<"EvidenceRef">)[];
        target: string & z.BRAND<"ComponentId">;
        instruction: string;
    }, {
        status: "pending" | "requires-agent" | "requires-image-tool" | "in-progress" | "done" | "blocked";
        id: string;
        target: string;
        instruction: string;
        evidence?: string[] | undefined;
    }>, "many">>;
    uncertainties: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodBranded<z.ZodString, "UncertaintyId">;
        field: z.ZodString;
        reason: z.ZodString;
        blocking: z.ZodBoolean;
        resolution: z.ZodOptional<z.ZodEnum<["omit", "ask", "infer", "use-default"]>>;
        resolvedValue: z.ZodOptional<z.ZodUnknown>;
    }, "strip", z.ZodTypeAny, {
        id: string & z.BRAND<"UncertaintyId">;
        reason: string;
        field: string;
        blocking: boolean;
        resolution?: "omit" | "ask" | "infer" | "use-default" | undefined;
        resolvedValue?: unknown;
    }, {
        id: string;
        reason: string;
        field: string;
        blocking: boolean;
        resolution?: "omit" | "ask" | "infer" | "use-default" | undefined;
        resolvedValue?: unknown;
    }>, "many">>;
    exactFacts: z.ZodDefault<z.ZodArray<z.ZodObject<{
        path: z.ZodString;
        expected: z.ZodUnknown;
        severity: z.ZodEnum<["critical", "major", "minor"]>;
    }, "strip", z.ZodTypeAny, {
        path: string;
        severity: "critical" | "major" | "minor";
        expected?: unknown;
    }, {
        path: string;
        severity: "critical" | "major" | "minor";
        expected?: unknown;
    }>, "many">>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    createdBy: z.ZodString;
}, "strip", z.ZodTypeAny, {
    jobId: string & z.BRAND<"JobId">;
    template: {
        id: string & z.BRAND<"TemplateId">;
        version: string;
        capabilityVersion: string;
    };
    createdBy: string;
    createdAt: string;
    updatedAt: string;
    assets: {
        id: string & z.BRAND<"AssetId">;
        kind: "image" | "audio" | "video" | "pdf" | "document" | "other";
        sha256: string;
        sourceKey: string;
        evidence: (string & z.BRAND<"EvidenceRef">)[];
        purpose: "other" | "hero" | "gallery" | "profile" | "background" | "music";
        crop: "custom" | "face-safe" | "center" | "none";
        cropParams?: {
            x: number;
            y: number;
            width: number;
            height: number;
        } | undefined;
    }[];
    schemaVersion: string;
    revision: number;
    locale: string;
    timeZone: string;
    people: {
        id: string & z.BRAND<"PersonId">;
        displayName: string;
        role: "other" | "partner" | "parent" | "sibling" | "friend";
        evidence: (string & z.BRAND<"EvidenceRef">)[];
    }[];
    components: {
        type: "map" | "custom" | "hero" | "gallery" | "music" | "event" | "rsvp" | "countdown" | "couple" | "family" | "story" | "note";
        id: string & z.BRAND<"ComponentId">;
        evidence: (string & z.BRAND<"EvidenceRef">)[];
        variant: "portrait" | "landscape" | "ceremony" | "reception" | "mehndi" | "sangeet" | "grid" | "carousel" | "masonry" | "whatsapp" | "form" | "toggle" | "player" | "embed" | "timer" | "side-by-side";
        data: Record<string, unknown>;
    }[];
    venues: {
        id: string & z.BRAND<"VenueId">;
        evidence: (string & z.BRAND<"EvidenceRef">)[];
        name: string;
        address: string;
        mapUrl?: string | undefined;
    }[];
    designRequests: {
        id: string & z.BRAND<"DesignRequestId">;
        kind: "custom" | "color" | "font" | "layout" | "animation" | "effect";
        evidence: (string & z.BRAND<"EvidenceRef">)[];
        target: string;
        referenceAssetId: (string & z.BRAND<"AssetId">) | null;
        value?: unknown;
    }[];
    customRequirements: {
        status: "pending" | "requires-agent" | "requires-image-tool" | "in-progress" | "done" | "blocked";
        id: string & z.BRAND<"CustomRequirementId">;
        evidence: (string & z.BRAND<"EvidenceRef">)[];
        target: string & z.BRAND<"ComponentId">;
        instruction: string;
    }[];
    uncertainties: {
        id: string & z.BRAND<"UncertaintyId">;
        reason: string;
        field: string;
        blocking: boolean;
        resolution?: "omit" | "ask" | "infer" | "use-default" | undefined;
        resolvedValue?: unknown;
    }[];
    exactFacts: {
        path: string;
        severity: "critical" | "major" | "minor";
        expected?: unknown;
    }[];
}, {
    jobId: string;
    template: {
        id: string;
        version: string;
        capabilityVersion: string;
    };
    createdBy: string;
    createdAt: string;
    updatedAt: string;
    revision: number;
    people: {
        id: string;
        displayName: string;
        role: "other" | "partner" | "parent" | "sibling" | "friend";
        evidence?: string[] | undefined;
    }[];
    components: {
        type: "map" | "custom" | "hero" | "gallery" | "music" | "event" | "rsvp" | "countdown" | "couple" | "family" | "story" | "note";
        id: string;
        variant: "portrait" | "landscape" | "ceremony" | "reception" | "mehndi" | "sangeet" | "grid" | "carousel" | "masonry" | "whatsapp" | "form" | "toggle" | "player" | "embed" | "timer" | "side-by-side";
        data: Record<string, unknown>;
        evidence?: string[] | undefined;
    }[];
    assets?: {
        id: string;
        kind: "image" | "audio" | "video" | "pdf" | "document" | "other";
        sha256: string;
        sourceKey: string;
        purpose: "other" | "hero" | "gallery" | "profile" | "background" | "music";
        evidence?: string[] | undefined;
        crop?: "custom" | "face-safe" | "center" | "none" | undefined;
        cropParams?: {
            x: number;
            y: number;
            width: number;
            height: number;
        } | undefined;
    }[] | undefined;
    schemaVersion?: string | undefined;
    locale?: string | undefined;
    timeZone?: string | undefined;
    venues?: {
        id: string;
        name: string;
        address: string;
        evidence?: string[] | undefined;
        mapUrl?: string | undefined;
    }[] | undefined;
    designRequests?: {
        id: string;
        kind: "custom" | "color" | "font" | "layout" | "animation" | "effect";
        target: string;
        referenceAssetId: string | null;
        value?: unknown;
        evidence?: string[] | undefined;
    }[] | undefined;
    customRequirements?: {
        status: "pending" | "requires-agent" | "requires-image-tool" | "in-progress" | "done" | "blocked";
        id: string;
        target: string;
        instruction: string;
        evidence?: string[] | undefined;
    }[] | undefined;
    uncertainties?: {
        id: string;
        reason: string;
        field: string;
        blocking: boolean;
        resolution?: "omit" | "ask" | "infer" | "use-default" | undefined;
        resolvedValue?: unknown;
    }[] | undefined;
    exactFacts?: {
        path: string;
        severity: "critical" | "major" | "minor";
        expected?: unknown;
    }[] | undefined;
}>;
export type InvitationSpec = z.infer<typeof InvitationSpec>;
export declare const SpecRevisionRecord: z.ZodObject<{
    revision: z.ZodNumber;
    spec: z.ZodObject<{
        schemaVersion: z.ZodDefault<z.ZodString>;
        jobId: z.ZodBranded<z.ZodString, "JobId">;
        revision: z.ZodNumber;
        template: z.ZodObject<{
            id: z.ZodBranded<z.ZodString, "TemplateId">;
            version: z.ZodString;
            capabilityVersion: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string & z.BRAND<"TemplateId">;
            version: string;
            capabilityVersion: string;
        }, {
            id: string;
            version: string;
            capabilityVersion: string;
        }>;
        locale: z.ZodDefault<z.ZodString>;
        timeZone: z.ZodDefault<z.ZodString>;
        people: z.ZodArray<z.ZodObject<{
            id: z.ZodBranded<z.ZodString, "PersonId">;
            displayName: z.ZodString;
            role: z.ZodEnum<["partner", "parent", "sibling", "friend", "other"]>;
            evidence: z.ZodDefault<z.ZodArray<z.ZodBranded<z.ZodString, "EvidenceRef">, "many">>;
        }, "strip", z.ZodTypeAny, {
            id: string & z.BRAND<"PersonId">;
            displayName: string;
            role: "other" | "partner" | "parent" | "sibling" | "friend";
            evidence: (string & z.BRAND<"EvidenceRef">)[];
        }, {
            id: string;
            displayName: string;
            role: "other" | "partner" | "parent" | "sibling" | "friend";
            evidence?: string[] | undefined;
        }>, "many">;
        assets: z.ZodDefault<z.ZodArray<z.ZodObject<{
            id: z.ZodBranded<z.ZodString, "AssetId">;
            kind: z.ZodEnum<["image", "audio", "video", "pdf", "document", "other"]>;
            sourceKey: z.ZodString;
            sha256: z.ZodString;
            purpose: z.ZodEnum<["hero", "gallery", "profile", "background", "music", "other"]>;
            crop: z.ZodDefault<z.ZodEnum<["face-safe", "center", "custom", "none"]>>;
            cropParams: z.ZodOptional<z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
                width: z.ZodNumber;
                height: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                x: number;
                y: number;
                width: number;
                height: number;
            }, {
                x: number;
                y: number;
                width: number;
                height: number;
            }>>;
            evidence: z.ZodDefault<z.ZodArray<z.ZodBranded<z.ZodString, "EvidenceRef">, "many">>;
        }, "strip", z.ZodTypeAny, {
            id: string & z.BRAND<"AssetId">;
            kind: "image" | "audio" | "video" | "pdf" | "document" | "other";
            sha256: string;
            sourceKey: string;
            evidence: (string & z.BRAND<"EvidenceRef">)[];
            purpose: "other" | "hero" | "gallery" | "profile" | "background" | "music";
            crop: "custom" | "face-safe" | "center" | "none";
            cropParams?: {
                x: number;
                y: number;
                width: number;
                height: number;
            } | undefined;
        }, {
            id: string;
            kind: "image" | "audio" | "video" | "pdf" | "document" | "other";
            sha256: string;
            sourceKey: string;
            purpose: "other" | "hero" | "gallery" | "profile" | "background" | "music";
            evidence?: string[] | undefined;
            crop?: "custom" | "face-safe" | "center" | "none" | undefined;
            cropParams?: {
                x: number;
                y: number;
                width: number;
                height: number;
            } | undefined;
        }>, "many">>;
        components: z.ZodArray<z.ZodObject<{
            id: z.ZodBranded<z.ZodString, "ComponentId">;
            type: z.ZodEnum<["hero", "event", "gallery", "rsvp", "music", "map", "countdown", "couple", "family", "story", "note", "custom"]>;
            variant: z.ZodUnion<[z.ZodLiteral<"portrait">, z.ZodLiteral<"landscape">, z.ZodLiteral<"ceremony">, z.ZodLiteral<"reception">, z.ZodLiteral<"mehndi">, z.ZodLiteral<"sangeet">, z.ZodLiteral<"grid">, z.ZodLiteral<"carousel">, z.ZodLiteral<"masonry">, z.ZodLiteral<"whatsapp">, z.ZodLiteral<"form">, z.ZodLiteral<"toggle">, z.ZodLiteral<"player">, z.ZodLiteral<"embed">, z.ZodLiteral<"timer">, z.ZodLiteral<"side-by-side">]>;
            data: z.ZodRecord<z.ZodString, z.ZodUnknown>;
            evidence: z.ZodDefault<z.ZodArray<z.ZodBranded<z.ZodString, "EvidenceRef">, "many">>;
        }, "strip", z.ZodTypeAny, {
            type: "map" | "custom" | "hero" | "gallery" | "music" | "event" | "rsvp" | "countdown" | "couple" | "family" | "story" | "note";
            id: string & z.BRAND<"ComponentId">;
            evidence: (string & z.BRAND<"EvidenceRef">)[];
            variant: "portrait" | "landscape" | "ceremony" | "reception" | "mehndi" | "sangeet" | "grid" | "carousel" | "masonry" | "whatsapp" | "form" | "toggle" | "player" | "embed" | "timer" | "side-by-side";
            data: Record<string, unknown>;
        }, {
            type: "map" | "custom" | "hero" | "gallery" | "music" | "event" | "rsvp" | "countdown" | "couple" | "family" | "story" | "note";
            id: string;
            variant: "portrait" | "landscape" | "ceremony" | "reception" | "mehndi" | "sangeet" | "grid" | "carousel" | "masonry" | "whatsapp" | "form" | "toggle" | "player" | "embed" | "timer" | "side-by-side";
            data: Record<string, unknown>;
            evidence?: string[] | undefined;
        }>, "many">;
        venues: z.ZodDefault<z.ZodArray<z.ZodObject<{
            id: z.ZodBranded<z.ZodString, "VenueId">;
            name: z.ZodString;
            address: z.ZodString;
            mapUrl: z.ZodOptional<z.ZodString>;
            evidence: z.ZodDefault<z.ZodArray<z.ZodBranded<z.ZodString, "EvidenceRef">, "many">>;
        }, "strip", z.ZodTypeAny, {
            id: string & z.BRAND<"VenueId">;
            evidence: (string & z.BRAND<"EvidenceRef">)[];
            name: string;
            address: string;
            mapUrl?: string | undefined;
        }, {
            id: string;
            name: string;
            address: string;
            evidence?: string[] | undefined;
            mapUrl?: string | undefined;
        }>, "many">>;
        designRequests: z.ZodDefault<z.ZodArray<z.ZodObject<{
            id: z.ZodBranded<z.ZodString, "DesignRequestId">;
            kind: z.ZodEnum<["color", "font", "layout", "animation", "effect", "custom"]>;
            target: z.ZodString;
            value: z.ZodUnknown;
            referenceAssetId: z.ZodNullable<z.ZodBranded<z.ZodString, "AssetId">>;
            evidence: z.ZodDefault<z.ZodArray<z.ZodBranded<z.ZodString, "EvidenceRef">, "many">>;
        }, "strip", z.ZodTypeAny, {
            id: string & z.BRAND<"DesignRequestId">;
            kind: "custom" | "color" | "font" | "layout" | "animation" | "effect";
            evidence: (string & z.BRAND<"EvidenceRef">)[];
            target: string;
            referenceAssetId: (string & z.BRAND<"AssetId">) | null;
            value?: unknown;
        }, {
            id: string;
            kind: "custom" | "color" | "font" | "layout" | "animation" | "effect";
            target: string;
            referenceAssetId: string | null;
            value?: unknown;
            evidence?: string[] | undefined;
        }>, "many">>;
        customRequirements: z.ZodDefault<z.ZodArray<z.ZodObject<{
            id: z.ZodBranded<z.ZodString, "CustomRequirementId">;
            instruction: z.ZodString;
            target: z.ZodBranded<z.ZodString, "ComponentId">;
            status: z.ZodEnum<["pending", "requires-agent", "requires-image-tool", "in-progress", "done", "blocked"]>;
            evidence: z.ZodDefault<z.ZodArray<z.ZodBranded<z.ZodString, "EvidenceRef">, "many">>;
        }, "strip", z.ZodTypeAny, {
            status: "pending" | "requires-agent" | "requires-image-tool" | "in-progress" | "done" | "blocked";
            id: string & z.BRAND<"CustomRequirementId">;
            evidence: (string & z.BRAND<"EvidenceRef">)[];
            target: string & z.BRAND<"ComponentId">;
            instruction: string;
        }, {
            status: "pending" | "requires-agent" | "requires-image-tool" | "in-progress" | "done" | "blocked";
            id: string;
            target: string;
            instruction: string;
            evidence?: string[] | undefined;
        }>, "many">>;
        uncertainties: z.ZodDefault<z.ZodArray<z.ZodObject<{
            id: z.ZodBranded<z.ZodString, "UncertaintyId">;
            field: z.ZodString;
            reason: z.ZodString;
            blocking: z.ZodBoolean;
            resolution: z.ZodOptional<z.ZodEnum<["omit", "ask", "infer", "use-default"]>>;
            resolvedValue: z.ZodOptional<z.ZodUnknown>;
        }, "strip", z.ZodTypeAny, {
            id: string & z.BRAND<"UncertaintyId">;
            reason: string;
            field: string;
            blocking: boolean;
            resolution?: "omit" | "ask" | "infer" | "use-default" | undefined;
            resolvedValue?: unknown;
        }, {
            id: string;
            reason: string;
            field: string;
            blocking: boolean;
            resolution?: "omit" | "ask" | "infer" | "use-default" | undefined;
            resolvedValue?: unknown;
        }>, "many">>;
        exactFacts: z.ZodDefault<z.ZodArray<z.ZodObject<{
            path: z.ZodString;
            expected: z.ZodUnknown;
            severity: z.ZodEnum<["critical", "major", "minor"]>;
        }, "strip", z.ZodTypeAny, {
            path: string;
            severity: "critical" | "major" | "minor";
            expected?: unknown;
        }, {
            path: string;
            severity: "critical" | "major" | "minor";
            expected?: unknown;
        }>, "many">>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
        createdBy: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        jobId: string & z.BRAND<"JobId">;
        template: {
            id: string & z.BRAND<"TemplateId">;
            version: string;
            capabilityVersion: string;
        };
        createdBy: string;
        createdAt: string;
        updatedAt: string;
        assets: {
            id: string & z.BRAND<"AssetId">;
            kind: "image" | "audio" | "video" | "pdf" | "document" | "other";
            sha256: string;
            sourceKey: string;
            evidence: (string & z.BRAND<"EvidenceRef">)[];
            purpose: "other" | "hero" | "gallery" | "profile" | "background" | "music";
            crop: "custom" | "face-safe" | "center" | "none";
            cropParams?: {
                x: number;
                y: number;
                width: number;
                height: number;
            } | undefined;
        }[];
        schemaVersion: string;
        revision: number;
        locale: string;
        timeZone: string;
        people: {
            id: string & z.BRAND<"PersonId">;
            displayName: string;
            role: "other" | "partner" | "parent" | "sibling" | "friend";
            evidence: (string & z.BRAND<"EvidenceRef">)[];
        }[];
        components: {
            type: "map" | "custom" | "hero" | "gallery" | "music" | "event" | "rsvp" | "countdown" | "couple" | "family" | "story" | "note";
            id: string & z.BRAND<"ComponentId">;
            evidence: (string & z.BRAND<"EvidenceRef">)[];
            variant: "portrait" | "landscape" | "ceremony" | "reception" | "mehndi" | "sangeet" | "grid" | "carousel" | "masonry" | "whatsapp" | "form" | "toggle" | "player" | "embed" | "timer" | "side-by-side";
            data: Record<string, unknown>;
        }[];
        venues: {
            id: string & z.BRAND<"VenueId">;
            evidence: (string & z.BRAND<"EvidenceRef">)[];
            name: string;
            address: string;
            mapUrl?: string | undefined;
        }[];
        designRequests: {
            id: string & z.BRAND<"DesignRequestId">;
            kind: "custom" | "color" | "font" | "layout" | "animation" | "effect";
            evidence: (string & z.BRAND<"EvidenceRef">)[];
            target: string;
            referenceAssetId: (string & z.BRAND<"AssetId">) | null;
            value?: unknown;
        }[];
        customRequirements: {
            status: "pending" | "requires-agent" | "requires-image-tool" | "in-progress" | "done" | "blocked";
            id: string & z.BRAND<"CustomRequirementId">;
            evidence: (string & z.BRAND<"EvidenceRef">)[];
            target: string & z.BRAND<"ComponentId">;
            instruction: string;
        }[];
        uncertainties: {
            id: string & z.BRAND<"UncertaintyId">;
            reason: string;
            field: string;
            blocking: boolean;
            resolution?: "omit" | "ask" | "infer" | "use-default" | undefined;
            resolvedValue?: unknown;
        }[];
        exactFacts: {
            path: string;
            severity: "critical" | "major" | "minor";
            expected?: unknown;
        }[];
    }, {
        jobId: string;
        template: {
            id: string;
            version: string;
            capabilityVersion: string;
        };
        createdBy: string;
        createdAt: string;
        updatedAt: string;
        revision: number;
        people: {
            id: string;
            displayName: string;
            role: "other" | "partner" | "parent" | "sibling" | "friend";
            evidence?: string[] | undefined;
        }[];
        components: {
            type: "map" | "custom" | "hero" | "gallery" | "music" | "event" | "rsvp" | "countdown" | "couple" | "family" | "story" | "note";
            id: string;
            variant: "portrait" | "landscape" | "ceremony" | "reception" | "mehndi" | "sangeet" | "grid" | "carousel" | "masonry" | "whatsapp" | "form" | "toggle" | "player" | "embed" | "timer" | "side-by-side";
            data: Record<string, unknown>;
            evidence?: string[] | undefined;
        }[];
        assets?: {
            id: string;
            kind: "image" | "audio" | "video" | "pdf" | "document" | "other";
            sha256: string;
            sourceKey: string;
            purpose: "other" | "hero" | "gallery" | "profile" | "background" | "music";
            evidence?: string[] | undefined;
            crop?: "custom" | "face-safe" | "center" | "none" | undefined;
            cropParams?: {
                x: number;
                y: number;
                width: number;
                height: number;
            } | undefined;
        }[] | undefined;
        schemaVersion?: string | undefined;
        locale?: string | undefined;
        timeZone?: string | undefined;
        venues?: {
            id: string;
            name: string;
            address: string;
            evidence?: string[] | undefined;
            mapUrl?: string | undefined;
        }[] | undefined;
        designRequests?: {
            id: string;
            kind: "custom" | "color" | "font" | "layout" | "animation" | "effect";
            target: string;
            referenceAssetId: string | null;
            value?: unknown;
            evidence?: string[] | undefined;
        }[] | undefined;
        customRequirements?: {
            status: "pending" | "requires-agent" | "requires-image-tool" | "in-progress" | "done" | "blocked";
            id: string;
            target: string;
            instruction: string;
            evidence?: string[] | undefined;
        }[] | undefined;
        uncertainties?: {
            id: string;
            reason: string;
            field: string;
            blocking: boolean;
            resolution?: "omit" | "ask" | "infer" | "use-default" | undefined;
            resolvedValue?: unknown;
        }[] | undefined;
        exactFacts?: {
            path: string;
            severity: "critical" | "major" | "minor";
            expected?: unknown;
        }[] | undefined;
    }>;
    editor: z.ZodString;
    timestamp: z.ZodString;
    changeSummary: z.ZodString;
}, "strip", z.ZodTypeAny, {
    timestamp: string;
    revision: number;
    spec: {
        jobId: string & z.BRAND<"JobId">;
        template: {
            id: string & z.BRAND<"TemplateId">;
            version: string;
            capabilityVersion: string;
        };
        createdBy: string;
        createdAt: string;
        updatedAt: string;
        assets: {
            id: string & z.BRAND<"AssetId">;
            kind: "image" | "audio" | "video" | "pdf" | "document" | "other";
            sha256: string;
            sourceKey: string;
            evidence: (string & z.BRAND<"EvidenceRef">)[];
            purpose: "other" | "hero" | "gallery" | "profile" | "background" | "music";
            crop: "custom" | "face-safe" | "center" | "none";
            cropParams?: {
                x: number;
                y: number;
                width: number;
                height: number;
            } | undefined;
        }[];
        schemaVersion: string;
        revision: number;
        locale: string;
        timeZone: string;
        people: {
            id: string & z.BRAND<"PersonId">;
            displayName: string;
            role: "other" | "partner" | "parent" | "sibling" | "friend";
            evidence: (string & z.BRAND<"EvidenceRef">)[];
        }[];
        components: {
            type: "map" | "custom" | "hero" | "gallery" | "music" | "event" | "rsvp" | "countdown" | "couple" | "family" | "story" | "note";
            id: string & z.BRAND<"ComponentId">;
            evidence: (string & z.BRAND<"EvidenceRef">)[];
            variant: "portrait" | "landscape" | "ceremony" | "reception" | "mehndi" | "sangeet" | "grid" | "carousel" | "masonry" | "whatsapp" | "form" | "toggle" | "player" | "embed" | "timer" | "side-by-side";
            data: Record<string, unknown>;
        }[];
        venues: {
            id: string & z.BRAND<"VenueId">;
            evidence: (string & z.BRAND<"EvidenceRef">)[];
            name: string;
            address: string;
            mapUrl?: string | undefined;
        }[];
        designRequests: {
            id: string & z.BRAND<"DesignRequestId">;
            kind: "custom" | "color" | "font" | "layout" | "animation" | "effect";
            evidence: (string & z.BRAND<"EvidenceRef">)[];
            target: string;
            referenceAssetId: (string & z.BRAND<"AssetId">) | null;
            value?: unknown;
        }[];
        customRequirements: {
            status: "pending" | "requires-agent" | "requires-image-tool" | "in-progress" | "done" | "blocked";
            id: string & z.BRAND<"CustomRequirementId">;
            evidence: (string & z.BRAND<"EvidenceRef">)[];
            target: string & z.BRAND<"ComponentId">;
            instruction: string;
        }[];
        uncertainties: {
            id: string & z.BRAND<"UncertaintyId">;
            reason: string;
            field: string;
            blocking: boolean;
            resolution?: "omit" | "ask" | "infer" | "use-default" | undefined;
            resolvedValue?: unknown;
        }[];
        exactFacts: {
            path: string;
            severity: "critical" | "major" | "minor";
            expected?: unknown;
        }[];
    };
    editor: string;
    changeSummary: string;
}, {
    timestamp: string;
    revision: number;
    spec: {
        jobId: string;
        template: {
            id: string;
            version: string;
            capabilityVersion: string;
        };
        createdBy: string;
        createdAt: string;
        updatedAt: string;
        revision: number;
        people: {
            id: string;
            displayName: string;
            role: "other" | "partner" | "parent" | "sibling" | "friend";
            evidence?: string[] | undefined;
        }[];
        components: {
            type: "map" | "custom" | "hero" | "gallery" | "music" | "event" | "rsvp" | "countdown" | "couple" | "family" | "story" | "note";
            id: string;
            variant: "portrait" | "landscape" | "ceremony" | "reception" | "mehndi" | "sangeet" | "grid" | "carousel" | "masonry" | "whatsapp" | "form" | "toggle" | "player" | "embed" | "timer" | "side-by-side";
            data: Record<string, unknown>;
            evidence?: string[] | undefined;
        }[];
        assets?: {
            id: string;
            kind: "image" | "audio" | "video" | "pdf" | "document" | "other";
            sha256: string;
            sourceKey: string;
            purpose: "other" | "hero" | "gallery" | "profile" | "background" | "music";
            evidence?: string[] | undefined;
            crop?: "custom" | "face-safe" | "center" | "none" | undefined;
            cropParams?: {
                x: number;
                y: number;
                width: number;
                height: number;
            } | undefined;
        }[] | undefined;
        schemaVersion?: string | undefined;
        locale?: string | undefined;
        timeZone?: string | undefined;
        venues?: {
            id: string;
            name: string;
            address: string;
            evidence?: string[] | undefined;
            mapUrl?: string | undefined;
        }[] | undefined;
        designRequests?: {
            id: string;
            kind: "custom" | "color" | "font" | "layout" | "animation" | "effect";
            target: string;
            referenceAssetId: string | null;
            value?: unknown;
            evidence?: string[] | undefined;
        }[] | undefined;
        customRequirements?: {
            status: "pending" | "requires-agent" | "requires-image-tool" | "in-progress" | "done" | "blocked";
            id: string;
            target: string;
            instruction: string;
            evidence?: string[] | undefined;
        }[] | undefined;
        uncertainties?: {
            id: string;
            reason: string;
            field: string;
            blocking: boolean;
            resolution?: "omit" | "ask" | "infer" | "use-default" | undefined;
            resolvedValue?: unknown;
        }[] | undefined;
        exactFacts?: {
            path: string;
            severity: "critical" | "major" | "minor";
            expected?: unknown;
        }[] | undefined;
    };
    editor: string;
    changeSummary: string;
}>;
export type SpecRevisionRecord = z.infer<typeof SpecRevisionRecord>;
export declare const TemplateCapability: z.ZodObject<{
    componentType: z.ZodString;
    variant: z.ZodUnion<[z.ZodLiteral<"portrait">, z.ZodLiteral<"landscape">, z.ZodLiteral<"ceremony">, z.ZodLiteral<"reception">, z.ZodLiteral<"mehndi">, z.ZodLiteral<"sangeet">, z.ZodLiteral<"grid">, z.ZodLiteral<"carousel">, z.ZodLiteral<"masonry">, z.ZodLiteral<"whatsapp">, z.ZodLiteral<"form">, z.ZodLiteral<"toggle">, z.ZodLiteral<"player">, z.ZodLiteral<"embed">, z.ZodLiteral<"timer">, z.ZodLiteral<"side-by-side">]>;
    requiredData: z.ZodArray<z.ZodString, "many">;
    optionalData: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    assetSlots: z.ZodDefault<z.ZodArray<z.ZodObject<{
        purpose: z.ZodString;
        aspectRatio: z.ZodOptional<z.ZodString>;
        required: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        purpose: string;
        required: boolean;
        aspectRatio?: string | undefined;
    }, {
        purpose: string;
        aspectRatio?: string | undefined;
        required?: boolean | undefined;
    }>, "many">>;
    editableTokens: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    variant: "portrait" | "landscape" | "ceremony" | "reception" | "mehndi" | "sangeet" | "grid" | "carousel" | "masonry" | "whatsapp" | "form" | "toggle" | "player" | "embed" | "timer" | "side-by-side";
    componentType: string;
    requiredData: string[];
    optionalData: string[];
    assetSlots: {
        purpose: string;
        required: boolean;
        aspectRatio?: string | undefined;
    }[];
    editableTokens: string[];
}, {
    variant: "portrait" | "landscape" | "ceremony" | "reception" | "mehndi" | "sangeet" | "grid" | "carousel" | "masonry" | "whatsapp" | "form" | "toggle" | "player" | "embed" | "timer" | "side-by-side";
    componentType: string;
    requiredData: string[];
    optionalData?: string[] | undefined;
    assetSlots?: {
        purpose: string;
        aspectRatio?: string | undefined;
        required?: boolean | undefined;
    }[] | undefined;
    editableTokens?: string[] | undefined;
}>;
export type TemplateCapability = z.infer<typeof TemplateCapability>;
export declare const TemplateManifest: z.ZodObject<{
    id: z.ZodBranded<z.ZodString, "TemplateId">;
    name: z.ZodString;
    version: z.ZodString;
    capabilityVersion: z.ZodString;
    capabilities: z.ZodArray<z.ZodObject<{
        componentType: z.ZodString;
        variant: z.ZodUnion<[z.ZodLiteral<"portrait">, z.ZodLiteral<"landscape">, z.ZodLiteral<"ceremony">, z.ZodLiteral<"reception">, z.ZodLiteral<"mehndi">, z.ZodLiteral<"sangeet">, z.ZodLiteral<"grid">, z.ZodLiteral<"carousel">, z.ZodLiteral<"masonry">, z.ZodLiteral<"whatsapp">, z.ZodLiteral<"form">, z.ZodLiteral<"toggle">, z.ZodLiteral<"player">, z.ZodLiteral<"embed">, z.ZodLiteral<"timer">, z.ZodLiteral<"side-by-side">]>;
        requiredData: z.ZodArray<z.ZodString, "many">;
        optionalData: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        assetSlots: z.ZodDefault<z.ZodArray<z.ZodObject<{
            purpose: z.ZodString;
            aspectRatio: z.ZodOptional<z.ZodString>;
            required: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            purpose: string;
            required: boolean;
            aspectRatio?: string | undefined;
        }, {
            purpose: string;
            aspectRatio?: string | undefined;
            required?: boolean | undefined;
        }>, "many">>;
        editableTokens: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        variant: "portrait" | "landscape" | "ceremony" | "reception" | "mehndi" | "sangeet" | "grid" | "carousel" | "masonry" | "whatsapp" | "form" | "toggle" | "player" | "embed" | "timer" | "side-by-side";
        componentType: string;
        requiredData: string[];
        optionalData: string[];
        assetSlots: {
            purpose: string;
            required: boolean;
            aspectRatio?: string | undefined;
        }[];
        editableTokens: string[];
    }, {
        variant: "portrait" | "landscape" | "ceremony" | "reception" | "mehndi" | "sangeet" | "grid" | "carousel" | "masonry" | "whatsapp" | "form" | "toggle" | "player" | "embed" | "timer" | "side-by-side";
        componentType: string;
        requiredData: string[];
        optionalData?: string[] | undefined;
        assetSlots?: {
            purpose: string;
            aspectRatio?: string | undefined;
            required?: boolean | undefined;
        }[] | undefined;
        editableTokens?: string[] | undefined;
    }>, "many">;
    buildCommand: z.ZodString;
    previewCommand: z.ZodString;
    installCommand: z.ZodString;
    baselineScreenshots: z.ZodObject<{
        mobile: z.ZodString;
        desktop: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        mobile: string;
        desktop: string;
    }, {
        mobile: string;
        desktop: string;
    }>;
    knownDifferences: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    unsupportedInteractions: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    adapterEntryPoint: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string & z.BRAND<"TemplateId">;
    version: string;
    capabilityVersion: string;
    name: string;
    capabilities: {
        variant: "portrait" | "landscape" | "ceremony" | "reception" | "mehndi" | "sangeet" | "grid" | "carousel" | "masonry" | "whatsapp" | "form" | "toggle" | "player" | "embed" | "timer" | "side-by-side";
        componentType: string;
        requiredData: string[];
        optionalData: string[];
        assetSlots: {
            purpose: string;
            required: boolean;
            aspectRatio?: string | undefined;
        }[];
        editableTokens: string[];
    }[];
    buildCommand: string;
    previewCommand: string;
    installCommand: string;
    baselineScreenshots: {
        mobile: string;
        desktop: string;
    };
    knownDifferences: string[];
    unsupportedInteractions: string[];
    adapterEntryPoint: string;
}, {
    id: string;
    version: string;
    capabilityVersion: string;
    name: string;
    capabilities: {
        variant: "portrait" | "landscape" | "ceremony" | "reception" | "mehndi" | "sangeet" | "grid" | "carousel" | "masonry" | "whatsapp" | "form" | "toggle" | "player" | "embed" | "timer" | "side-by-side";
        componentType: string;
        requiredData: string[];
        optionalData?: string[] | undefined;
        assetSlots?: {
            purpose: string;
            aspectRatio?: string | undefined;
            required?: boolean | undefined;
        }[] | undefined;
        editableTokens?: string[] | undefined;
    }[];
    buildCommand: string;
    previewCommand: string;
    installCommand: string;
    baselineScreenshots: {
        mobile: string;
        desktop: string;
    };
    adapterEntryPoint: string;
    knownDifferences?: string[] | undefined;
    unsupportedInteractions?: string[] | undefined;
}>;
export type TemplateManifest = z.infer<typeof TemplateManifest>;
export declare const QASeverity: z.ZodEnum<["critical", "major", "minor", "info"]>;
export type QASeverity = z.infer<typeof QASeverity>;
export declare const QAIssue: z.ZodObject<{
    id: z.ZodBranded<z.ZodString, "QAIssueId">;
    severity: z.ZodEnum<["critical", "major", "minor", "info"]>;
    category: z.ZodEnum<["build", "browser", "fact", "visual", "accessibility"]>;
    message: z.ZodString;
    specPath: z.ZodOptional<z.ZodString>;
    domSelector: z.ZodOptional<z.ZodString>;
    screenshotRegion: z.ZodOptional<z.ZodObject<{
        x: z.ZodNumber;
        y: z.ZodNumber;
        width: z.ZodNumber;
        height: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        x: number;
        y: number;
        width: number;
        height: number;
    }, {
        x: number;
        y: number;
        width: number;
        height: number;
    }>>;
    expected: z.ZodOptional<z.ZodUnknown>;
    actual: z.ZodOptional<z.ZodUnknown>;
    suggestedFix: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    message: string;
    id: string & z.BRAND<"QAIssueId">;
    severity: "critical" | "major" | "minor" | "info";
    category: "build" | "browser" | "fact" | "visual" | "accessibility";
    expected?: unknown;
    specPath?: string | undefined;
    domSelector?: string | undefined;
    screenshotRegion?: {
        x: number;
        y: number;
        width: number;
        height: number;
    } | undefined;
    actual?: unknown;
    suggestedFix?: string | undefined;
}, {
    message: string;
    id: string;
    severity: "critical" | "major" | "minor" | "info";
    category: "build" | "browser" | "fact" | "visual" | "accessibility";
    expected?: unknown;
    specPath?: string | undefined;
    domSelector?: string | undefined;
    screenshotRegion?: {
        x: number;
        y: number;
        width: number;
        height: number;
    } | undefined;
    actual?: unknown;
    suggestedFix?: string | undefined;
}>;
export type QAIssue = z.infer<typeof QAIssue>;
export declare const QAReport: z.ZodObject<{
    jobId: z.ZodBranded<z.ZodString, "JobId">;
    attempt: z.ZodNumber;
    specRevision: z.ZodNumber;
    build: z.ZodObject<{
        status: z.ZodEnum<["pass", "fail"]>;
        logs: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        durationMs: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        status: "pass" | "fail";
        logs: string[];
        durationMs: number;
    }, {
        status: "pass" | "fail";
        durationMs: number;
        logs?: string[] | undefined;
    }>;
    browser: z.ZodObject<{
        status: z.ZodEnum<["pass", "fail"]>;
        consoleErrors: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        pageErrors: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        failedRequests: z.ZodDefault<z.ZodArray<z.ZodObject<{
            url: z.ZodString;
            status: z.ZodNumber;
            error: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            status: number;
            error: string;
            url: string;
        }, {
            status: number;
            error: string;
            url: string;
        }>, "many">>;
        screenshots: z.ZodObject<{
            mobile: z.ZodString;
            desktop: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            mobile: string;
            desktop: string;
        }, {
            mobile: string;
            desktop: string;
        }>;
        viewportSizes: z.ZodObject<{
            mobile: z.ZodObject<{
                width: z.ZodNumber;
                height: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                width: number;
                height: number;
            }, {
                width: number;
                height: number;
            }>;
            desktop: z.ZodObject<{
                width: z.ZodNumber;
                height: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                width: number;
                height: number;
            }, {
                width: number;
                height: number;
            }>;
        }, "strip", z.ZodTypeAny, {
            mobile: {
                width: number;
                height: number;
            };
            desktop: {
                width: number;
                height: number;
            };
        }, {
            mobile: {
                width: number;
                height: number;
            };
            desktop: {
                width: number;
                height: number;
            };
        }>;
        durationMs: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        status: "pass" | "fail";
        durationMs: number;
        consoleErrors: string[];
        pageErrors: string[];
        failedRequests: {
            status: number;
            error: string;
            url: string;
        }[];
        screenshots: {
            mobile: string;
            desktop: string;
        };
        viewportSizes: {
            mobile: {
                width: number;
                height: number;
            };
            desktop: {
                width: number;
                height: number;
            };
        };
    }, {
        status: "pass" | "fail";
        durationMs: number;
        screenshots: {
            mobile: string;
            desktop: string;
        };
        viewportSizes: {
            mobile: {
                width: number;
                height: number;
            };
            desktop: {
                width: number;
                height: number;
            };
        };
        consoleErrors?: string[] | undefined;
        pageErrors?: string[] | undefined;
        failedRequests?: {
            status: number;
            error: string;
            url: string;
        }[] | undefined;
    }>;
    facts: z.ZodObject<{
        status: z.ZodEnum<["pass", "fail"]>;
        issues: z.ZodDefault<z.ZodArray<z.ZodObject<{
            id: z.ZodBranded<z.ZodString, "QAIssueId">;
            severity: z.ZodEnum<["critical", "major", "minor", "info"]>;
            category: z.ZodEnum<["build", "browser", "fact", "visual", "accessibility"]>;
            message: z.ZodString;
            specPath: z.ZodOptional<z.ZodString>;
            domSelector: z.ZodOptional<z.ZodString>;
            screenshotRegion: z.ZodOptional<z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
                width: z.ZodNumber;
                height: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                x: number;
                y: number;
                width: number;
                height: number;
            }, {
                x: number;
                y: number;
                width: number;
                height: number;
            }>>;
            expected: z.ZodOptional<z.ZodUnknown>;
            actual: z.ZodOptional<z.ZodUnknown>;
            suggestedFix: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            message: string;
            id: string & z.BRAND<"QAIssueId">;
            severity: "critical" | "major" | "minor" | "info";
            category: "build" | "browser" | "fact" | "visual" | "accessibility";
            expected?: unknown;
            specPath?: string | undefined;
            domSelector?: string | undefined;
            screenshotRegion?: {
                x: number;
                y: number;
                width: number;
                height: number;
            } | undefined;
            actual?: unknown;
            suggestedFix?: string | undefined;
        }, {
            message: string;
            id: string;
            severity: "critical" | "major" | "minor" | "info";
            category: "build" | "browser" | "fact" | "visual" | "accessibility";
            expected?: unknown;
            specPath?: string | undefined;
            domSelector?: string | undefined;
            screenshotRegion?: {
                x: number;
                y: number;
                width: number;
                height: number;
            } | undefined;
            actual?: unknown;
            suggestedFix?: string | undefined;
        }>, "many">>;
        checkedCount: z.ZodNumber;
        passedCount: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        issues: {
            message: string;
            id: string & z.BRAND<"QAIssueId">;
            severity: "critical" | "major" | "minor" | "info";
            category: "build" | "browser" | "fact" | "visual" | "accessibility";
            expected?: unknown;
            specPath?: string | undefined;
            domSelector?: string | undefined;
            screenshotRegion?: {
                x: number;
                y: number;
                width: number;
                height: number;
            } | undefined;
            actual?: unknown;
            suggestedFix?: string | undefined;
        }[];
        status: "pass" | "fail";
        checkedCount: number;
        passedCount: number;
    }, {
        status: "pass" | "fail";
        checkedCount: number;
        passedCount: number;
        issues?: {
            message: string;
            id: string;
            severity: "critical" | "major" | "minor" | "info";
            category: "build" | "browser" | "fact" | "visual" | "accessibility";
            expected?: unknown;
            specPath?: string | undefined;
            domSelector?: string | undefined;
            screenshotRegion?: {
                x: number;
                y: number;
                width: number;
                height: number;
            } | undefined;
            actual?: unknown;
            suggestedFix?: string | undefined;
        }[] | undefined;
    }>;
    visual: z.ZodObject<{
        status: z.ZodEnum<["pass", "review", "fail"]>;
        issues: z.ZodDefault<z.ZodArray<z.ZodObject<{
            id: z.ZodBranded<z.ZodString, "QAIssueId">;
            severity: z.ZodEnum<["critical", "major", "minor", "info"]>;
            category: z.ZodEnum<["build", "browser", "fact", "visual", "accessibility"]>;
            message: z.ZodString;
            specPath: z.ZodOptional<z.ZodString>;
            domSelector: z.ZodOptional<z.ZodString>;
            screenshotRegion: z.ZodOptional<z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
                width: z.ZodNumber;
                height: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                x: number;
                y: number;
                width: number;
                height: number;
            }, {
                x: number;
                y: number;
                width: number;
                height: number;
            }>>;
            expected: z.ZodOptional<z.ZodUnknown>;
            actual: z.ZodOptional<z.ZodUnknown>;
            suggestedFix: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            message: string;
            id: string & z.BRAND<"QAIssueId">;
            severity: "critical" | "major" | "minor" | "info";
            category: "build" | "browser" | "fact" | "visual" | "accessibility";
            expected?: unknown;
            specPath?: string | undefined;
            domSelector?: string | undefined;
            screenshotRegion?: {
                x: number;
                y: number;
                width: number;
                height: number;
            } | undefined;
            actual?: unknown;
            suggestedFix?: string | undefined;
        }, {
            message: string;
            id: string;
            severity: "critical" | "major" | "minor" | "info";
            category: "build" | "browser" | "fact" | "visual" | "accessibility";
            expected?: unknown;
            specPath?: string | undefined;
            domSelector?: string | undefined;
            screenshotRegion?: {
                x: number;
                y: number;
                width: number;
                height: number;
            } | undefined;
            actual?: unknown;
            suggestedFix?: string | undefined;
        }>, "many">>;
        baselineComparison: z.ZodOptional<z.ZodObject<{
            mobileDiff: z.ZodOptional<z.ZodNumber>;
            desktopDiff: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            mobileDiff?: number | undefined;
            desktopDiff?: number | undefined;
        }, {
            mobileDiff?: number | undefined;
            desktopDiff?: number | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        issues: {
            message: string;
            id: string & z.BRAND<"QAIssueId">;
            severity: "critical" | "major" | "minor" | "info";
            category: "build" | "browser" | "fact" | "visual" | "accessibility";
            expected?: unknown;
            specPath?: string | undefined;
            domSelector?: string | undefined;
            screenshotRegion?: {
                x: number;
                y: number;
                width: number;
                height: number;
            } | undefined;
            actual?: unknown;
            suggestedFix?: string | undefined;
        }[];
        status: "pass" | "fail" | "review";
        baselineComparison?: {
            mobileDiff?: number | undefined;
            desktopDiff?: number | undefined;
        } | undefined;
    }, {
        status: "pass" | "fail" | "review";
        issues?: {
            message: string;
            id: string;
            severity: "critical" | "major" | "minor" | "info";
            category: "build" | "browser" | "fact" | "visual" | "accessibility";
            expected?: unknown;
            specPath?: string | undefined;
            domSelector?: string | undefined;
            screenshotRegion?: {
                x: number;
                y: number;
                width: number;
                height: number;
            } | undefined;
            actual?: unknown;
            suggestedFix?: string | undefined;
        }[] | undefined;
        baselineComparison?: {
            mobileDiff?: number | undefined;
            desktopDiff?: number | undefined;
        } | undefined;
    }>;
    overallStatus: z.ZodEnum<["pass", "fail", "review"]>;
    blockingIssues: z.ZodNumber;
    createdAt: z.ZodString;
    modelUsage: z.ZodDefault<z.ZodObject<{
        transcription: z.ZodDefault<z.ZodNumber>;
        ocr: z.ZodDefault<z.ZodNumber>;
        extraction: z.ZodDefault<z.ZodNumber>;
        coding: z.ZodDefault<z.ZodNumber>;
        visualQA: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        transcription: number;
        ocr: number;
        extraction: number;
        coding: number;
        visualQA: number;
    }, {
        transcription?: number | undefined;
        ocr?: number | undefined;
        extraction?: number | undefined;
        coding?: number | undefined;
        visualQA?: number | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    jobId: string & z.BRAND<"JobId">;
    createdAt: string;
    specRevision: number;
    attempt: number;
    build: {
        status: "pass" | "fail";
        logs: string[];
        durationMs: number;
    };
    browser: {
        status: "pass" | "fail";
        durationMs: number;
        consoleErrors: string[];
        pageErrors: string[];
        failedRequests: {
            status: number;
            error: string;
            url: string;
        }[];
        screenshots: {
            mobile: string;
            desktop: string;
        };
        viewportSizes: {
            mobile: {
                width: number;
                height: number;
            };
            desktop: {
                width: number;
                height: number;
            };
        };
    };
    visual: {
        issues: {
            message: string;
            id: string & z.BRAND<"QAIssueId">;
            severity: "critical" | "major" | "minor" | "info";
            category: "build" | "browser" | "fact" | "visual" | "accessibility";
            expected?: unknown;
            specPath?: string | undefined;
            domSelector?: string | undefined;
            screenshotRegion?: {
                x: number;
                y: number;
                width: number;
                height: number;
            } | undefined;
            actual?: unknown;
            suggestedFix?: string | undefined;
        }[];
        status: "pass" | "fail" | "review";
        baselineComparison?: {
            mobileDiff?: number | undefined;
            desktopDiff?: number | undefined;
        } | undefined;
    };
    facts: {
        issues: {
            message: string;
            id: string & z.BRAND<"QAIssueId">;
            severity: "critical" | "major" | "minor" | "info";
            category: "build" | "browser" | "fact" | "visual" | "accessibility";
            expected?: unknown;
            specPath?: string | undefined;
            domSelector?: string | undefined;
            screenshotRegion?: {
                x: number;
                y: number;
                width: number;
                height: number;
            } | undefined;
            actual?: unknown;
            suggestedFix?: string | undefined;
        }[];
        status: "pass" | "fail";
        checkedCount: number;
        passedCount: number;
    };
    overallStatus: "pass" | "fail" | "review";
    blockingIssues: number;
    modelUsage: {
        transcription: number;
        ocr: number;
        extraction: number;
        coding: number;
        visualQA: number;
    };
}, {
    jobId: string;
    createdAt: string;
    specRevision: number;
    attempt: number;
    build: {
        status: "pass" | "fail";
        durationMs: number;
        logs?: string[] | undefined;
    };
    browser: {
        status: "pass" | "fail";
        durationMs: number;
        screenshots: {
            mobile: string;
            desktop: string;
        };
        viewportSizes: {
            mobile: {
                width: number;
                height: number;
            };
            desktop: {
                width: number;
                height: number;
            };
        };
        consoleErrors?: string[] | undefined;
        pageErrors?: string[] | undefined;
        failedRequests?: {
            status: number;
            error: string;
            url: string;
        }[] | undefined;
    };
    visual: {
        status: "pass" | "fail" | "review";
        issues?: {
            message: string;
            id: string;
            severity: "critical" | "major" | "minor" | "info";
            category: "build" | "browser" | "fact" | "visual" | "accessibility";
            expected?: unknown;
            specPath?: string | undefined;
            domSelector?: string | undefined;
            screenshotRegion?: {
                x: number;
                y: number;
                width: number;
                height: number;
            } | undefined;
            actual?: unknown;
            suggestedFix?: string | undefined;
        }[] | undefined;
        baselineComparison?: {
            mobileDiff?: number | undefined;
            desktopDiff?: number | undefined;
        } | undefined;
    };
    facts: {
        status: "pass" | "fail";
        checkedCount: number;
        passedCount: number;
        issues?: {
            message: string;
            id: string;
            severity: "critical" | "major" | "minor" | "info";
            category: "build" | "browser" | "fact" | "visual" | "accessibility";
            expected?: unknown;
            specPath?: string | undefined;
            domSelector?: string | undefined;
            screenshotRegion?: {
                x: number;
                y: number;
                width: number;
                height: number;
            } | undefined;
            actual?: unknown;
            suggestedFix?: string | undefined;
        }[] | undefined;
    };
    overallStatus: "pass" | "fail" | "review";
    blockingIssues: number;
    modelUsage?: {
        transcription?: number | undefined;
        ocr?: number | undefined;
        extraction?: number | undefined;
        coding?: number | undefined;
        visualQA?: number | undefined;
    } | undefined;
}>;
export type QAReport = z.infer<typeof QAReport>;
export declare const Attempt: z.ZodObject<{
    jobId: z.ZodBranded<z.ZodString, "JobId">;
    attempt: z.ZodNumber;
    specRevision: z.ZodNumber;
    workspaceKey: z.ZodString;
    qaReport: z.ZodNullable<z.ZodObject<{
        jobId: z.ZodBranded<z.ZodString, "JobId">;
        attempt: z.ZodNumber;
        specRevision: z.ZodNumber;
        build: z.ZodObject<{
            status: z.ZodEnum<["pass", "fail"]>;
            logs: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            durationMs: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            status: "pass" | "fail";
            logs: string[];
            durationMs: number;
        }, {
            status: "pass" | "fail";
            durationMs: number;
            logs?: string[] | undefined;
        }>;
        browser: z.ZodObject<{
            status: z.ZodEnum<["pass", "fail"]>;
            consoleErrors: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            pageErrors: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            failedRequests: z.ZodDefault<z.ZodArray<z.ZodObject<{
                url: z.ZodString;
                status: z.ZodNumber;
                error: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                status: number;
                error: string;
                url: string;
            }, {
                status: number;
                error: string;
                url: string;
            }>, "many">>;
            screenshots: z.ZodObject<{
                mobile: z.ZodString;
                desktop: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                mobile: string;
                desktop: string;
            }, {
                mobile: string;
                desktop: string;
            }>;
            viewportSizes: z.ZodObject<{
                mobile: z.ZodObject<{
                    width: z.ZodNumber;
                    height: z.ZodNumber;
                }, "strip", z.ZodTypeAny, {
                    width: number;
                    height: number;
                }, {
                    width: number;
                    height: number;
                }>;
                desktop: z.ZodObject<{
                    width: z.ZodNumber;
                    height: z.ZodNumber;
                }, "strip", z.ZodTypeAny, {
                    width: number;
                    height: number;
                }, {
                    width: number;
                    height: number;
                }>;
            }, "strip", z.ZodTypeAny, {
                mobile: {
                    width: number;
                    height: number;
                };
                desktop: {
                    width: number;
                    height: number;
                };
            }, {
                mobile: {
                    width: number;
                    height: number;
                };
                desktop: {
                    width: number;
                    height: number;
                };
            }>;
            durationMs: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            status: "pass" | "fail";
            durationMs: number;
            consoleErrors: string[];
            pageErrors: string[];
            failedRequests: {
                status: number;
                error: string;
                url: string;
            }[];
            screenshots: {
                mobile: string;
                desktop: string;
            };
            viewportSizes: {
                mobile: {
                    width: number;
                    height: number;
                };
                desktop: {
                    width: number;
                    height: number;
                };
            };
        }, {
            status: "pass" | "fail";
            durationMs: number;
            screenshots: {
                mobile: string;
                desktop: string;
            };
            viewportSizes: {
                mobile: {
                    width: number;
                    height: number;
                };
                desktop: {
                    width: number;
                    height: number;
                };
            };
            consoleErrors?: string[] | undefined;
            pageErrors?: string[] | undefined;
            failedRequests?: {
                status: number;
                error: string;
                url: string;
            }[] | undefined;
        }>;
        facts: z.ZodObject<{
            status: z.ZodEnum<["pass", "fail"]>;
            issues: z.ZodDefault<z.ZodArray<z.ZodObject<{
                id: z.ZodBranded<z.ZodString, "QAIssueId">;
                severity: z.ZodEnum<["critical", "major", "minor", "info"]>;
                category: z.ZodEnum<["build", "browser", "fact", "visual", "accessibility"]>;
                message: z.ZodString;
                specPath: z.ZodOptional<z.ZodString>;
                domSelector: z.ZodOptional<z.ZodString>;
                screenshotRegion: z.ZodOptional<z.ZodObject<{
                    x: z.ZodNumber;
                    y: z.ZodNumber;
                    width: z.ZodNumber;
                    height: z.ZodNumber;
                }, "strip", z.ZodTypeAny, {
                    x: number;
                    y: number;
                    width: number;
                    height: number;
                }, {
                    x: number;
                    y: number;
                    width: number;
                    height: number;
                }>>;
                expected: z.ZodOptional<z.ZodUnknown>;
                actual: z.ZodOptional<z.ZodUnknown>;
                suggestedFix: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                message: string;
                id: string & z.BRAND<"QAIssueId">;
                severity: "critical" | "major" | "minor" | "info";
                category: "build" | "browser" | "fact" | "visual" | "accessibility";
                expected?: unknown;
                specPath?: string | undefined;
                domSelector?: string | undefined;
                screenshotRegion?: {
                    x: number;
                    y: number;
                    width: number;
                    height: number;
                } | undefined;
                actual?: unknown;
                suggestedFix?: string | undefined;
            }, {
                message: string;
                id: string;
                severity: "critical" | "major" | "minor" | "info";
                category: "build" | "browser" | "fact" | "visual" | "accessibility";
                expected?: unknown;
                specPath?: string | undefined;
                domSelector?: string | undefined;
                screenshotRegion?: {
                    x: number;
                    y: number;
                    width: number;
                    height: number;
                } | undefined;
                actual?: unknown;
                suggestedFix?: string | undefined;
            }>, "many">>;
            checkedCount: z.ZodNumber;
            passedCount: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            issues: {
                message: string;
                id: string & z.BRAND<"QAIssueId">;
                severity: "critical" | "major" | "minor" | "info";
                category: "build" | "browser" | "fact" | "visual" | "accessibility";
                expected?: unknown;
                specPath?: string | undefined;
                domSelector?: string | undefined;
                screenshotRegion?: {
                    x: number;
                    y: number;
                    width: number;
                    height: number;
                } | undefined;
                actual?: unknown;
                suggestedFix?: string | undefined;
            }[];
            status: "pass" | "fail";
            checkedCount: number;
            passedCount: number;
        }, {
            status: "pass" | "fail";
            checkedCount: number;
            passedCount: number;
            issues?: {
                message: string;
                id: string;
                severity: "critical" | "major" | "minor" | "info";
                category: "build" | "browser" | "fact" | "visual" | "accessibility";
                expected?: unknown;
                specPath?: string | undefined;
                domSelector?: string | undefined;
                screenshotRegion?: {
                    x: number;
                    y: number;
                    width: number;
                    height: number;
                } | undefined;
                actual?: unknown;
                suggestedFix?: string | undefined;
            }[] | undefined;
        }>;
        visual: z.ZodObject<{
            status: z.ZodEnum<["pass", "review", "fail"]>;
            issues: z.ZodDefault<z.ZodArray<z.ZodObject<{
                id: z.ZodBranded<z.ZodString, "QAIssueId">;
                severity: z.ZodEnum<["critical", "major", "minor", "info"]>;
                category: z.ZodEnum<["build", "browser", "fact", "visual", "accessibility"]>;
                message: z.ZodString;
                specPath: z.ZodOptional<z.ZodString>;
                domSelector: z.ZodOptional<z.ZodString>;
                screenshotRegion: z.ZodOptional<z.ZodObject<{
                    x: z.ZodNumber;
                    y: z.ZodNumber;
                    width: z.ZodNumber;
                    height: z.ZodNumber;
                }, "strip", z.ZodTypeAny, {
                    x: number;
                    y: number;
                    width: number;
                    height: number;
                }, {
                    x: number;
                    y: number;
                    width: number;
                    height: number;
                }>>;
                expected: z.ZodOptional<z.ZodUnknown>;
                actual: z.ZodOptional<z.ZodUnknown>;
                suggestedFix: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                message: string;
                id: string & z.BRAND<"QAIssueId">;
                severity: "critical" | "major" | "minor" | "info";
                category: "build" | "browser" | "fact" | "visual" | "accessibility";
                expected?: unknown;
                specPath?: string | undefined;
                domSelector?: string | undefined;
                screenshotRegion?: {
                    x: number;
                    y: number;
                    width: number;
                    height: number;
                } | undefined;
                actual?: unknown;
                suggestedFix?: string | undefined;
            }, {
                message: string;
                id: string;
                severity: "critical" | "major" | "minor" | "info";
                category: "build" | "browser" | "fact" | "visual" | "accessibility";
                expected?: unknown;
                specPath?: string | undefined;
                domSelector?: string | undefined;
                screenshotRegion?: {
                    x: number;
                    y: number;
                    width: number;
                    height: number;
                } | undefined;
                actual?: unknown;
                suggestedFix?: string | undefined;
            }>, "many">>;
            baselineComparison: z.ZodOptional<z.ZodObject<{
                mobileDiff: z.ZodOptional<z.ZodNumber>;
                desktopDiff: z.ZodOptional<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                mobileDiff?: number | undefined;
                desktopDiff?: number | undefined;
            }, {
                mobileDiff?: number | undefined;
                desktopDiff?: number | undefined;
            }>>;
        }, "strip", z.ZodTypeAny, {
            issues: {
                message: string;
                id: string & z.BRAND<"QAIssueId">;
                severity: "critical" | "major" | "minor" | "info";
                category: "build" | "browser" | "fact" | "visual" | "accessibility";
                expected?: unknown;
                specPath?: string | undefined;
                domSelector?: string | undefined;
                screenshotRegion?: {
                    x: number;
                    y: number;
                    width: number;
                    height: number;
                } | undefined;
                actual?: unknown;
                suggestedFix?: string | undefined;
            }[];
            status: "pass" | "fail" | "review";
            baselineComparison?: {
                mobileDiff?: number | undefined;
                desktopDiff?: number | undefined;
            } | undefined;
        }, {
            status: "pass" | "fail" | "review";
            issues?: {
                message: string;
                id: string;
                severity: "critical" | "major" | "minor" | "info";
                category: "build" | "browser" | "fact" | "visual" | "accessibility";
                expected?: unknown;
                specPath?: string | undefined;
                domSelector?: string | undefined;
                screenshotRegion?: {
                    x: number;
                    y: number;
                    width: number;
                    height: number;
                } | undefined;
                actual?: unknown;
                suggestedFix?: string | undefined;
            }[] | undefined;
            baselineComparison?: {
                mobileDiff?: number | undefined;
                desktopDiff?: number | undefined;
            } | undefined;
        }>;
        overallStatus: z.ZodEnum<["pass", "fail", "review"]>;
        blockingIssues: z.ZodNumber;
        createdAt: z.ZodString;
        modelUsage: z.ZodDefault<z.ZodObject<{
            transcription: z.ZodDefault<z.ZodNumber>;
            ocr: z.ZodDefault<z.ZodNumber>;
            extraction: z.ZodDefault<z.ZodNumber>;
            coding: z.ZodDefault<z.ZodNumber>;
            visualQA: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            transcription: number;
            ocr: number;
            extraction: number;
            coding: number;
            visualQA: number;
        }, {
            transcription?: number | undefined;
            ocr?: number | undefined;
            extraction?: number | undefined;
            coding?: number | undefined;
            visualQA?: number | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        jobId: string & z.BRAND<"JobId">;
        createdAt: string;
        specRevision: number;
        attempt: number;
        build: {
            status: "pass" | "fail";
            logs: string[];
            durationMs: number;
        };
        browser: {
            status: "pass" | "fail";
            durationMs: number;
            consoleErrors: string[];
            pageErrors: string[];
            failedRequests: {
                status: number;
                error: string;
                url: string;
            }[];
            screenshots: {
                mobile: string;
                desktop: string;
            };
            viewportSizes: {
                mobile: {
                    width: number;
                    height: number;
                };
                desktop: {
                    width: number;
                    height: number;
                };
            };
        };
        visual: {
            issues: {
                message: string;
                id: string & z.BRAND<"QAIssueId">;
                severity: "critical" | "major" | "minor" | "info";
                category: "build" | "browser" | "fact" | "visual" | "accessibility";
                expected?: unknown;
                specPath?: string | undefined;
                domSelector?: string | undefined;
                screenshotRegion?: {
                    x: number;
                    y: number;
                    width: number;
                    height: number;
                } | undefined;
                actual?: unknown;
                suggestedFix?: string | undefined;
            }[];
            status: "pass" | "fail" | "review";
            baselineComparison?: {
                mobileDiff?: number | undefined;
                desktopDiff?: number | undefined;
            } | undefined;
        };
        facts: {
            issues: {
                message: string;
                id: string & z.BRAND<"QAIssueId">;
                severity: "critical" | "major" | "minor" | "info";
                category: "build" | "browser" | "fact" | "visual" | "accessibility";
                expected?: unknown;
                specPath?: string | undefined;
                domSelector?: string | undefined;
                screenshotRegion?: {
                    x: number;
                    y: number;
                    width: number;
                    height: number;
                } | undefined;
                actual?: unknown;
                suggestedFix?: string | undefined;
            }[];
            status: "pass" | "fail";
            checkedCount: number;
            passedCount: number;
        };
        overallStatus: "pass" | "fail" | "review";
        blockingIssues: number;
        modelUsage: {
            transcription: number;
            ocr: number;
            extraction: number;
            coding: number;
            visualQA: number;
        };
    }, {
        jobId: string;
        createdAt: string;
        specRevision: number;
        attempt: number;
        build: {
            status: "pass" | "fail";
            durationMs: number;
            logs?: string[] | undefined;
        };
        browser: {
            status: "pass" | "fail";
            durationMs: number;
            screenshots: {
                mobile: string;
                desktop: string;
            };
            viewportSizes: {
                mobile: {
                    width: number;
                    height: number;
                };
                desktop: {
                    width: number;
                    height: number;
                };
            };
            consoleErrors?: string[] | undefined;
            pageErrors?: string[] | undefined;
            failedRequests?: {
                status: number;
                error: string;
                url: string;
            }[] | undefined;
        };
        visual: {
            status: "pass" | "fail" | "review";
            issues?: {
                message: string;
                id: string;
                severity: "critical" | "major" | "minor" | "info";
                category: "build" | "browser" | "fact" | "visual" | "accessibility";
                expected?: unknown;
                specPath?: string | undefined;
                domSelector?: string | undefined;
                screenshotRegion?: {
                    x: number;
                    y: number;
                    width: number;
                    height: number;
                } | undefined;
                actual?: unknown;
                suggestedFix?: string | undefined;
            }[] | undefined;
            baselineComparison?: {
                mobileDiff?: number | undefined;
                desktopDiff?: number | undefined;
            } | undefined;
        };
        facts: {
            status: "pass" | "fail";
            checkedCount: number;
            passedCount: number;
            issues?: {
                message: string;
                id: string;
                severity: "critical" | "major" | "minor" | "info";
                category: "build" | "browser" | "fact" | "visual" | "accessibility";
                expected?: unknown;
                specPath?: string | undefined;
                domSelector?: string | undefined;
                screenshotRegion?: {
                    x: number;
                    y: number;
                    width: number;
                    height: number;
                } | undefined;
                actual?: unknown;
                suggestedFix?: string | undefined;
            }[] | undefined;
        };
        overallStatus: "pass" | "fail" | "review";
        blockingIssues: number;
        modelUsage?: {
            transcription?: number | undefined;
            ocr?: number | undefined;
            extraction?: number | undefined;
            coding?: number | undefined;
            visualQA?: number | undefined;
        } | undefined;
    }>>;
    changedFiles: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    diff: z.ZodOptional<z.ZodString>;
    logs: z.ZodString;
    status: z.ZodEnum<["pending", "building", "qa", "completed", "failed"]>;
    startedAt: z.ZodString;
    completedAt: z.ZodNullable<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "pending" | "building" | "qa" | "completed" | "failed";
    jobId: string & z.BRAND<"JobId">;
    specRevision: number;
    attempt: number;
    logs: string;
    workspaceKey: string;
    qaReport: {
        jobId: string & z.BRAND<"JobId">;
        createdAt: string;
        specRevision: number;
        attempt: number;
        build: {
            status: "pass" | "fail";
            logs: string[];
            durationMs: number;
        };
        browser: {
            status: "pass" | "fail";
            durationMs: number;
            consoleErrors: string[];
            pageErrors: string[];
            failedRequests: {
                status: number;
                error: string;
                url: string;
            }[];
            screenshots: {
                mobile: string;
                desktop: string;
            };
            viewportSizes: {
                mobile: {
                    width: number;
                    height: number;
                };
                desktop: {
                    width: number;
                    height: number;
                };
            };
        };
        visual: {
            issues: {
                message: string;
                id: string & z.BRAND<"QAIssueId">;
                severity: "critical" | "major" | "minor" | "info";
                category: "build" | "browser" | "fact" | "visual" | "accessibility";
                expected?: unknown;
                specPath?: string | undefined;
                domSelector?: string | undefined;
                screenshotRegion?: {
                    x: number;
                    y: number;
                    width: number;
                    height: number;
                } | undefined;
                actual?: unknown;
                suggestedFix?: string | undefined;
            }[];
            status: "pass" | "fail" | "review";
            baselineComparison?: {
                mobileDiff?: number | undefined;
                desktopDiff?: number | undefined;
            } | undefined;
        };
        facts: {
            issues: {
                message: string;
                id: string & z.BRAND<"QAIssueId">;
                severity: "critical" | "major" | "minor" | "info";
                category: "build" | "browser" | "fact" | "visual" | "accessibility";
                expected?: unknown;
                specPath?: string | undefined;
                domSelector?: string | undefined;
                screenshotRegion?: {
                    x: number;
                    y: number;
                    width: number;
                    height: number;
                } | undefined;
                actual?: unknown;
                suggestedFix?: string | undefined;
            }[];
            status: "pass" | "fail";
            checkedCount: number;
            passedCount: number;
        };
        overallStatus: "pass" | "fail" | "review";
        blockingIssues: number;
        modelUsage: {
            transcription: number;
            ocr: number;
            extraction: number;
            coding: number;
            visualQA: number;
        };
    } | null;
    changedFiles: string[];
    startedAt: string;
    completedAt: string | null;
    diff?: string | undefined;
}, {
    status: "pending" | "building" | "qa" | "completed" | "failed";
    jobId: string;
    specRevision: number;
    attempt: number;
    logs: string;
    workspaceKey: string;
    qaReport: {
        jobId: string;
        createdAt: string;
        specRevision: number;
        attempt: number;
        build: {
            status: "pass" | "fail";
            durationMs: number;
            logs?: string[] | undefined;
        };
        browser: {
            status: "pass" | "fail";
            durationMs: number;
            screenshots: {
                mobile: string;
                desktop: string;
            };
            viewportSizes: {
                mobile: {
                    width: number;
                    height: number;
                };
                desktop: {
                    width: number;
                    height: number;
                };
            };
            consoleErrors?: string[] | undefined;
            pageErrors?: string[] | undefined;
            failedRequests?: {
                status: number;
                error: string;
                url: string;
            }[] | undefined;
        };
        visual: {
            status: "pass" | "fail" | "review";
            issues?: {
                message: string;
                id: string;
                severity: "critical" | "major" | "minor" | "info";
                category: "build" | "browser" | "fact" | "visual" | "accessibility";
                expected?: unknown;
                specPath?: string | undefined;
                domSelector?: string | undefined;
                screenshotRegion?: {
                    x: number;
                    y: number;
                    width: number;
                    height: number;
                } | undefined;
                actual?: unknown;
                suggestedFix?: string | undefined;
            }[] | undefined;
            baselineComparison?: {
                mobileDiff?: number | undefined;
                desktopDiff?: number | undefined;
            } | undefined;
        };
        facts: {
            status: "pass" | "fail";
            checkedCount: number;
            passedCount: number;
            issues?: {
                message: string;
                id: string;
                severity: "critical" | "major" | "minor" | "info";
                category: "build" | "browser" | "fact" | "visual" | "accessibility";
                expected?: unknown;
                specPath?: string | undefined;
                domSelector?: string | undefined;
                screenshotRegion?: {
                    x: number;
                    y: number;
                    width: number;
                    height: number;
                } | undefined;
                actual?: unknown;
                suggestedFix?: string | undefined;
            }[] | undefined;
        };
        overallStatus: "pass" | "fail" | "review";
        blockingIssues: number;
        modelUsage?: {
            transcription?: number | undefined;
            ocr?: number | undefined;
            extraction?: number | undefined;
            coding?: number | undefined;
            visualQA?: number | undefined;
        } | undefined;
    } | null;
    startedAt: string;
    completedAt: string | null;
    changedFiles?: string[] | undefined;
    diff?: string | undefined;
}>;
export type Attempt = z.infer<typeof Attempt>;
export declare const UploadInstructions: z.ZodObject<{
    uploadUrl: z.ZodString;
    fields: z.ZodRecord<z.ZodString, z.ZodString>;
    maxSize: z.ZodNumber;
    acceptedTypes: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    uploadUrl: string;
    fields: Record<string, string>;
    maxSize: number;
    acceptedTypes: string[];
}, {
    uploadUrl: string;
    fields: Record<string, string>;
    maxSize: number;
    acceptedTypes: string[];
}>;
export type UploadInstructions = z.infer<typeof UploadInstructions>;
export declare const AnalyzeResponse: z.ZodObject<{
    jobId: z.ZodBranded<z.ZodString, "JobId">;
    state: z.ZodEnum<["RECEIVED", "INGESTING", "EXTRACTING", "VALIDATING", "NEEDS_INPUT", "READY_TO_BUILD", "BUILDING", "BUILD_FAILED", "BROWSER_QA", "QA_FAILED", "REPAIRING", "QA_PASSED", "READY_FOR_STAFF", "APPROVED", "PUSHING_GIT", "DEPLOYING", "COMPLETED", "CANCELLED", "ESCALATED", "FAILED"]>;
    message: z.ZodString;
}, "strip", z.ZodTypeAny, {
    message: string;
    jobId: string & z.BRAND<"JobId">;
    state: "RECEIVED" | "INGESTING" | "EXTRACTING" | "VALIDATING" | "NEEDS_INPUT" | "READY_TO_BUILD" | "BUILDING" | "BUILD_FAILED" | "BROWSER_QA" | "QA_FAILED" | "REPAIRING" | "QA_PASSED" | "READY_FOR_STAFF" | "APPROVED" | "PUSHING_GIT" | "DEPLOYING" | "COMPLETED" | "CANCELLED" | "ESCALATED" | "FAILED";
}, {
    message: string;
    jobId: string;
    state: "RECEIVED" | "INGESTING" | "EXTRACTING" | "VALIDATING" | "NEEDS_INPUT" | "READY_TO_BUILD" | "BUILDING" | "BUILD_FAILED" | "BROWSER_QA" | "QA_FAILED" | "REPAIRING" | "QA_PASSED" | "READY_FOR_STAFF" | "APPROVED" | "PUSHING_GIT" | "DEPLOYING" | "COMPLETED" | "CANCELLED" | "ESCALATED" | "FAILED";
}>;
export type AnalyzeResponse = z.infer<typeof AnalyzeResponse>;
export declare const JobSummary: z.ZodObject<{
    jobId: z.ZodBranded<z.ZodString, "JobId">;
    state: z.ZodEnum<["RECEIVED", "INGESTING", "EXTRACTING", "VALIDATING", "NEEDS_INPUT", "READY_TO_BUILD", "BUILDING", "BUILD_FAILED", "BROWSER_QA", "QA_FAILED", "REPAIRING", "QA_PASSED", "READY_FOR_STAFF", "APPROVED", "PUSHING_GIT", "DEPLOYING", "COMPLETED", "CANCELLED", "ESCALATED", "FAILED"]>;
    template: z.ZodObject<{
        id: z.ZodBranded<z.ZodString, "TemplateId">;
        version: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string & z.BRAND<"TemplateId">;
        version: string;
    }, {
        id: string;
        version: string;
    }>;
    approvedSpecRevision: z.ZodNullable<z.ZodNumber>;
    currentAttempt: z.ZodNumber;
    blockingIssues: z.ZodNumber;
    usage: z.ZodObject<{
        modelCostInr: z.ZodNumber;
        sandboxSeconds: z.ZodNumber;
        humanReviewSeconds: z.ZodNullable<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        modelCostInr: number;
        sandboxSeconds: number;
        humanReviewSeconds: number | null;
    }, {
        modelCostInr: number;
        sandboxSeconds: number;
        humanReviewSeconds: number | null;
    }>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    jobId: string & z.BRAND<"JobId">;
    state: "RECEIVED" | "INGESTING" | "EXTRACTING" | "VALIDATING" | "NEEDS_INPUT" | "READY_TO_BUILD" | "BUILDING" | "BUILD_FAILED" | "BROWSER_QA" | "QA_FAILED" | "REPAIRING" | "QA_PASSED" | "READY_FOR_STAFF" | "APPROVED" | "PUSHING_GIT" | "DEPLOYING" | "COMPLETED" | "CANCELLED" | "ESCALATED" | "FAILED";
    template: {
        id: string & z.BRAND<"TemplateId">;
        version: string;
    };
    createdAt: string;
    updatedAt: string;
    approvedSpecRevision: number | null;
    currentAttempt: number;
    usage: {
        modelCostInr: number;
        sandboxSeconds: number;
        humanReviewSeconds: number | null;
    };
    blockingIssues: number;
}, {
    jobId: string;
    state: "RECEIVED" | "INGESTING" | "EXTRACTING" | "VALIDATING" | "NEEDS_INPUT" | "READY_TO_BUILD" | "BUILDING" | "BUILD_FAILED" | "BROWSER_QA" | "QA_FAILED" | "REPAIRING" | "QA_PASSED" | "READY_FOR_STAFF" | "APPROVED" | "PUSHING_GIT" | "DEPLOYING" | "COMPLETED" | "CANCELLED" | "ESCALATED" | "FAILED";
    template: {
        id: string;
        version: string;
    };
    createdAt: string;
    updatedAt: string;
    approvedSpecRevision: number | null;
    currentAttempt: number;
    usage: {
        modelCostInr: number;
        sandboxSeconds: number;
        humanReviewSeconds: number | null;
    };
    blockingIssues: number;
}>;
export type JobSummary = z.infer<typeof JobSummary>;
export declare const ReviewAction: z.ZodObject<{
    action: z.ZodEnum<["approveDraft", "requestRepair", "escalate", "cancel"]>;
    reason: z.ZodString;
    specRevision: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    reason: string;
    action: "approveDraft" | "requestRepair" | "escalate" | "cancel";
    specRevision?: number | undefined;
}, {
    reason: string;
    action: "approveDraft" | "requestRepair" | "escalate" | "cancel";
    specRevision?: number | undefined;
}>;
export type ReviewAction = z.infer<typeof ReviewAction>;
export declare const SandboxLimits: z.ZodObject<{
    cpu: z.ZodDefault<z.ZodNumber>;
    memoryMb: z.ZodDefault<z.ZodNumber>;
    timeoutSec: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    cpu: number;
    memoryMb: number;
    timeoutSec: number;
}, {
    cpu?: number | undefined;
    memoryMb?: number | undefined;
    timeoutSec?: number | undefined;
}>;
export type SandboxLimits = z.infer<typeof SandboxLimits>;
export declare const ExecOptions: z.ZodObject<{
    workdir: z.ZodOptional<z.ZodString>;
    env: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    timeoutSec: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    timeoutSec?: number | undefined;
    workdir?: string | undefined;
    env?: Record<string, string> | undefined;
}, {
    timeoutSec?: number | undefined;
    workdir?: string | undefined;
    env?: Record<string, string> | undefined;
}>;
export type ExecOptions = z.infer<typeof ExecOptions>;
export declare const ExecResult: z.ZodObject<{
    exitCode: z.ZodNumber;
    stdout: z.ZodString;
    stderr: z.ZodString;
    durationMs: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    durationMs: number;
    exitCode: number;
    stdout: string;
    stderr: string;
}, {
    durationMs: number;
    exitCode: number;
    stdout: string;
    stderr: string;
}>;
export type ExecResult = z.infer<typeof ExecResult>;
export declare const PreviewHandle: z.ZodObject<{
    url: z.ZodString;
    port: z.ZodNumber;
    processId: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    url: string;
    port: number;
    processId: number;
}, {
    url: string;
    port: number;
    processId: number;
}>;
export type PreviewHandle = z.infer<typeof PreviewHandle>;
export declare const ModelRole: z.ZodEnum<["transcribe", "ocrVision", "requirements", "normalCode", "complexCode", "visualQA", "imageEdit", "verification"]>;
export type ModelRole = z.infer<typeof ModelRole>;
export declare const ModelConfig: z.ZodObject<{
    role: z.ZodEnum<["transcribe", "ocrVision", "requirements", "normalCode", "complexCode", "visualQA", "imageEdit", "verification"]>;
    primaryModel: z.ZodString;
    fallbackModels: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    contextLimit: z.ZodNumber;
    structuredOutput: z.ZodDefault<z.ZodBoolean>;
    timeoutSec: z.ZodDefault<z.ZodNumber>;
    privacyPolicy: z.ZodDefault<z.ZodEnum<["strict", "standard", "flexible"]>>;
    perCallBudgetInr: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    role: "visualQA" | "transcribe" | "ocrVision" | "requirements" | "normalCode" | "complexCode" | "imageEdit" | "verification";
    timeoutSec: number;
    primaryModel: string;
    fallbackModels: string[];
    contextLimit: number;
    structuredOutput: boolean;
    privacyPolicy: "strict" | "standard" | "flexible";
    perCallBudgetInr: number;
}, {
    role: "visualQA" | "transcribe" | "ocrVision" | "requirements" | "normalCode" | "complexCode" | "imageEdit" | "verification";
    primaryModel: string;
    contextLimit: number;
    timeoutSec?: number | undefined;
    fallbackModels?: string[] | undefined;
    structuredOutput?: boolean | undefined;
    privacyPolicy?: "strict" | "standard" | "flexible" | undefined;
    perCallBudgetInr?: number | undefined;
}>;
export type ModelConfig = z.infer<typeof ModelConfig>;
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
export declare function createJobId(): JobId;
export declare function createSpecRevision(n: number): SpecRevision;
export declare function createAttemptNumber(n: number): AttemptNumber;
export declare function createTemplateId(id: string): TemplateId;
export declare function createAssetId(id: string): AssetId;
export declare function createPersonId(id: string): PersonId;
export declare function createComponentId(id: string): ComponentId;
export declare function createVenueId(id: string): VenueId;
export declare function createMessageId(id: string): MessageId;
export declare function createEvidenceRef(ref: string): EvidenceRef;
export declare function createDesignRequestId(id: string): DesignRequestId;
export declare function createCustomRequirementId(id: string): CustomRequirementId;
export declare function createUncertaintyId(id: string): UncertaintyId;
export declare function createQAIssueId(id: string): QAIssueId;
export type DesignRequestId = z.infer<typeof DesignRequest>["id"];
export type CustomRequirementId = z.infer<typeof CustomRequirement>["id"];
export type UncertaintyId = z.infer<typeof Uncertainty>["id"];
export type QAIssueId = z.infer<typeof QAIssue>["id"];
//# sourceMappingURL=index.d.ts.map