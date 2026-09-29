import "server-only";
import { createHash } from "node:crypto";
import { Prisma, type BeneficiaryCase } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../db";
import { caseDraftSchema, SupportError, type CaseDraft } from "./domain";
import { lockCase, publicCase } from "./cases";
import { hasBannedPublicCopy } from "./content-policy";
import { financialTransaction, requireSupportAdmin } from "./security";
import type { Permission } from "../admin-rbac";

const idSchema = z.string().cuid();
const workflowSchema = z.object({
  action: z.enum(["submit", "approve", "reject", "publish", "close", "withdraw", "archive"]),
  revision: z.number().int().positive(),
  reason: z.string().trim().min(10).max(1000),
  reviewedContent: z.literal(true).optional(),
  reviewedConsent: z.literal(true).optional(),
  reviewedMedia: z.literal(true).optional(),
}).strict();
const permission: Record<z.infer<typeof workflowSchema>["action"], Permission> = {
  submit: "cases.edit", approve: "cases.review", reject: "cases.review", publish: "cases.publish",
  close: "cases.publish", withdraw: "cases.view", archive: "cases.publish",
};

// Automated screening is only a first gate. Independent human review is required.
export function validateCaseContent(draft: CaseDraft) {
  const content = [draft.needDescription, draft.storyShort, draft.storyFull, draft.photoAlt ?? ""].join("\n");
  if (/(?:https?:\/\/|www\.|[\w.+-]+@[\w.-]+\.[a-z]{2,}|\+?\d[\d ()-]{7,}\d)/i.test(content)
      || hasBannedPublicCopy(content)
      || /\b(?:date of birth|diagnosed with|home address|passport number|national id)\b/i.test(content)
      || /\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/.test(content)) {
    throw new SupportError("unsafe_content", "Remove contact details, exact dates, sensitive personal information, links, and dignity-harming language from public content.");
  }
  const now = new Date();
  if (draft.consentRecordedAt && new Date(draft.consentRecordedAt) > now) throw new SupportError("consent_date", "Consent cannot be recorded in the future.");
  if (draft.photoAssetId) throw new SupportError("media_unavailable", "Use the non-photo fallback until restricted case-media verification is configured.");
}

async function validateLinks(tx: Prisma.TransactionClient, draft: { pillarId: string | null; programId: string | null }, publishing = false) {
  if (draft.pillarId && !await tx.pillar.findFirst({ where: { id: draft.pillarId, deletedAt: null, ...(publishing ? { published: true } : {}) } })) {
    throw new SupportError("invalid_pillar", "Choose an available pillar.");
  }
  if (draft.programId && !await tx.program.findFirst({ where: { id: draft.programId, deletedAt: null, ...(publishing ? { published: true } : {}) } })) {
    throw new SupportError("invalid_program", "Choose an available programme.");
  }
  if (draft.pillarId && draft.programId && !await tx.programPillar.findUnique({ where: { programId_pillarId: { programId: draft.programId, pillarId: draft.pillarId } } })) {
    throw new SupportError("invalid_designation", "The programme must belong to the selected pillar.");
  }
}

export function caseDraftFromRecord(record: BeneficiaryCase): CaseDraft {
  return caseDraftSchema.parse({
    firstName: record.firstName, age: record.age, region: record.region, needType: record.needType,
    needDescription: record.needDescription, storyShort: record.storyShort, storyFull: record.storyFull,
    amountNeeded: record.amountNeeded, pillarId: record.pillarId, programId: record.programId,
    consentGiven: record.consentGiven, consentEvidenceRef: record.consentEvidenceRef,
    consentRecordedAt: record.consentRecordedAt?.toISOString() ?? null,
    consentExpiresAt: record.consentExpiresAt?.toISOString() ?? null, closesAt: record.closesAt?.toISOString() ?? null,
    photoAssetId: record.photoAssetId, photoAlt: record.photoAlt,
  });
}

function draftData(draft: CaseDraft) {
  return { ...draft, consentRecordedAt: draft.consentRecordedAt ? new Date(draft.consentRecordedAt) : null,
    consentExpiresAt: draft.consentExpiresAt ? new Date(draft.consentExpiresAt) : null,
    closesAt: draft.closesAt ? new Date(draft.closesAt) : null };
}
function snapshot(record: BeneficiaryCase) {
  return { revision: record.revision, status: record.status, reviewStatus: record.reviewStatus,
    approvedRevision: record.approvedRevision, consentGiven: record.consentGiven,
    consentRevoked: !!record.consentRevokedAt, amountNeeded: record.amountNeeded,
    contentDigest: createHash("sha256").update(JSON.stringify(publicCase(record, true))).digest("hex") };
}
async function audit(tx: Prisma.TransactionClient, actorId: string, action: string, before: BeneficiaryCase | null, after: BeneficiaryCase, reason: string) {
  await tx.contentAudit.create({ data: { entity: "BeneficiaryCase", entityId: after.id, action,
    createdById: actorId, updatedById: actorId, before: before ? snapshot(before) : Prisma.JsonNull,
    after: { ...snapshot(after), reason } } });
}
function requireCurrentRevision(record: BeneficiaryCase, revision: number) {
  if (record.deletedAt) throw new SupportError("unavailable", "This case is unavailable.", 404);
  if (record.revision !== revision) throw new SupportError("revision_changed", "The case changed. Reload and review the current revision before continuing.", 409);
}
function requireConsent(record: BeneficiaryCase) {
  const now = new Date();
  if (!record.consentGiven || record.consentRevokedAt || !record.consentEvidenceRef || !record.consentRecordedAt || record.consentRecordedAt > now
      || (record.consentExpiresAt && record.consentExpiresAt <= now)) throw new SupportError("consent_required", "Current, documented, unrevoked consent is required.", 409);
}

export async function createCaseDraft(input: unknown) {
  const actor = await requireSupportAdmin("cases.edit");
  const draft = caseDraftSchema.parse(input);
  validateCaseContent(draft);
  return financialTransaction(async (tx) => {
    await validateLinks(tx, draft);
    const year = new Date().getUTCFullYear();
    const counter = await tx.casePublicIdCounter.upsert({ where: { year }, create: { year, nextNumber: 2 }, update: { nextNumber: { increment: 1 } } });
    const record = await tx.beneficiaryCase.create({ data: { ...draftData(draft),
      publicId: `FTF-${year}-${String(counter.nextNumber - 1).padStart(3, "0")}`, createdBy: actor.userId, updatedBy: actor.userId } });
    await audit(tx, actor.userId, "CREATE", null, record, "Private draft created.");
    return record;
  });
}

export async function saveCaseDraft(id: string, input: unknown) {
  const actor = await requireSupportAdmin("cases.edit");
  idSchema.parse(id);
  const parsed = z.object({ revision: z.number().int().positive(), draft: caseDraftSchema }).strict().parse(input);
  validateCaseContent(parsed.draft);
  return financialTransaction(async (tx) => {
    const before = await lockCase(tx, id);
    requireCurrentRevision(before, parsed.revision);
    if (before.amountRaised > 0 && before.amountNeeded !== parsed.draft.amountNeeded) throw new SupportError("target_locked", "The target is locked after the first credited contribution. Create a separately reviewed case for a changed need.", 409);
    if (before.consentRevokedAt && parsed.draft.consentGiven && (!parsed.draft.consentRecordedAt || new Date(parsed.draft.consentRecordedAt) <= before.consentRevokedAt)) {
      throw new SupportError("renewed_consent_required", "Record new consent obtained after withdrawal before submitting again.", 409);
    }
    await validateLinks(tx, parsed.draft);
    const record = await tx.beneficiaryCase.update({ where: { id }, data: { ...draftData(parsed.draft), updatedBy: actor.userId,
      consentRevokedAt: parsed.draft.consentGiven ? null : before.consentRevokedAt,
      safeguardingApproved: false, safeguardingApprovedBy: null, safeguardingApprovedAt: null, approvedRevision: null, reviewStatus: "draft",
      revision: { increment: 1 } } });
    await audit(tx, actor.userId, "UPDATE", before, record, "Content saved; independent approval is required again.");
    return record;
  });
}

export async function transitionCase(id: string, input: unknown) {
  idSchema.parse(id);
  const request = workflowSchema.parse(input);
  const actor = await requireSupportAdmin(permission[request.action]);
  if (request.action === "withdraw" && !["SUPER_ADMIN", "ADMIN", "SAFEGUARDING_OFFICER"].includes(actor.role)) {
    throw new SupportError("forbidden", "A safeguarding officer or publisher must withdraw consent.", 403);
  }
  return financialTransaction(async (tx) => {
    const before = await lockCase(tx, id);
    requireCurrentRevision(before, request.revision);
    const now = new Date();
    const data: Prisma.BeneficiaryCaseUncheckedUpdateInput = {};
    if (["submit", "approve", "publish"].includes(request.action)) {
      validateCaseContent(caseDraftFromRecord(before));
      requireConsent(before);
      await validateLinks(tx, before, true);
    }
    switch (request.action) {
      case "submit":
        if (!["draft", "rejected"].includes(before.reviewStatus)) throw new SupportError("workflow", "Only a draft or rejected revision can be submitted.", 409);
        data.reviewStatus = "submitted";
        break;
      case "approve":
      case "reject":
        if (before.reviewStatus !== "submitted") throw new SupportError("workflow", "Only a submitted revision can be reviewed.", 409);
        if (before.createdBy === actor.userId || before.updatedBy === actor.userId) throw new SupportError("independent_review", "A different safeguarding reviewer must review this revision.", 403);
        if (request.action === "approve") {
          if (!request.reviewedContent || !request.reviewedConsent || !request.reviewedMedia) throw new SupportError("review_incomplete", "Confirm public-content safety, consent scope, and media safety before approval.");
          Object.assign(data, { safeguardingApproved: true, safeguardingApprovedBy: actor.userId, safeguardingApprovedAt: now, approvedRevision: before.revision, reviewStatus: "approved" });
        } else Object.assign(data, { safeguardingApproved: false, safeguardingApprovedBy: null, safeguardingApprovedAt: null, approvedRevision: null, reviewStatus: "rejected" });
        break;
      case "publish":
        if (!before.safeguardingApproved || before.approvedRevision !== before.revision || before.reviewStatus !== "approved" || !before.safeguardingApprovedBy
            || before.safeguardingApprovedBy === before.updatedBy || before.safeguardingApprovedBy === before.createdBy) {
          throw new SupportError("approval_required", "Independent safeguarding approval of the current revision is required.", 409);
        }
        if (before.closesAt && before.closesAt <= now && before.amountRaised < before.amountNeeded) throw new SupportError("closed", "Update the closing date and obtain new approval before publication.", 409);
        Object.assign(data, { publishedAt: before.publishedAt ?? now, status: before.amountRaised === before.amountNeeded ? "funded" : "active" });
        break;
      case "close":
        data.status = "closed";
        break;
      case "withdraw":
        Object.assign(data, { consentGiven: false, consentRevokedAt: now, publishedAt: null, status: "closed",
          safeguardingApproved: false, safeguardingApprovedBy: null, safeguardingApprovedAt: null, approvedRevision: null, reviewStatus: "draft" });
        break;
      case "archive":
        if (before.amountRaised !== before.amountNeeded || !before.fundedAt) throw new SupportError("not_funded", "Only a fully funded case may enter the funded archive.", 409);
        data.status = "archived";
        break;
    }
    const record = await tx.beneficiaryCase.update({ where: { id }, data });
    await audit(tx, actor.userId, request.action.toUpperCase(), before, record, request.reason);
    return record;
  });
}

export async function getAdminCase(id: string) {
  await requireSupportAdmin("cases.view");
  idSchema.parse(id);
  const record = await prisma.beneficiaryCase.findFirst({ where: { id, deletedAt: null } });
  if (!record) throw new SupportError("unavailable", "This case is unavailable.", 404);
  const history = await prisma.contentAudit.findMany({ where: { entity: "BeneficiaryCase", entityId: id }, orderBy: [{ createdAt: "desc" }, { id: "desc" }], take: 100,
      include: { createdBy: { select: { name: true } } } });
  return { record, history, preview: publicCase(record, true) };
}

export async function getAdminCaseOptions() {
  await requireSupportAdmin("cases.view");
  const [pillars, programs] = await Promise.all([
    prisma.pillar.findMany({ where: { deletedAt: null }, orderBy: { order: "asc" }, select: { id: true, title: true, published: true } }),
    prisma.program.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" }, select: { id: true, name: true, published: true,
      pillars: { select: { pillarId: true } } } }),
  ]);
  return { pillars, programs };
}

export async function getAdminCasePage(input: unknown) {
  await requireSupportAdmin("cases.view");
  const query = z.object({ status: z.enum(["draft", "submitted", "active", "funded", "closed", "archived"]).optional(),
    consent: z.enum(["valid", "missing", "expired", "expiring"]).optional(), pillarId: idSchema.optional(), programId: idSchema.optional(),
    page: z.coerce.number().int().min(1).max(10000).default(1) }).strict().parse(input);
  const now = new Date();
  const validConsent: Prisma.BeneficiaryCaseWhereInput = { consentGiven: true, consentRevokedAt: null,
    consentRecordedAt: { lte: now }, consentEvidenceRef: { not: null }, OR: [{ consentExpiresAt: null }, { consentExpiresAt: { gt: now } }] };
  const where: Prisma.BeneficiaryCaseWhereInput = { deletedAt: null, pillarId: query.pillarId, programId: query.programId,
    ...(query.status === "submitted" ? { reviewStatus: "submitted" } : query.status === "draft" ? { reviewStatus: { in: ["draft", "rejected"] } } : { status: query.status }),
    ...(query.consent === "valid" ? validConsent : query.consent === "missing" ? { NOT: validConsent }
      : query.consent === "expired" ? { consentExpiresAt: { lte: now } } : query.consent === "expiring"
        ? { consentExpiresAt: { gt: now, lte: new Date(Date.now() + 14 * 86400000) } } : {}) };
  const records = await prisma.beneficiaryCase.findMany({ where, orderBy: [{ createdAt: "desc" }, { id: "desc" }], skip: (query.page - 1) * 20, take: 21,
    select: { id: true, publicId: true, firstName: true, status: true, reviewStatus: true, revision: true, approvedRevision: true,
      consentGiven: true, consentRevokedAt: true, consentExpiresAt: true, amountNeeded: true, amountRaised: true } });
  return { records: records.slice(0, 20), hasMore: records.length > 20, page: query.page };
}
