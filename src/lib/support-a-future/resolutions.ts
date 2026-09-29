import "server-only";
import { z } from "zod";
import { Prisma, type Donation, type ExcessResolution } from "@prisma/client";
import { prisma } from "../db";
import { caseLinks, getCasePage, isCaseFundable, isCasePublic, lockCase } from "./cases";
import { CONSENT_VERSION, PUBLIC_CASE_ID, resolutionChoiceSchema, resolutionConsent, SupportError } from "./domain";
import { financialTransaction, rateLimit, requireSupportAdmin, verifyChoiceToken } from "./security";
import { enqueueChoiceInvitation, enqueueNotification, financialAudit, financialSnapshot, lockDonation } from "./persistence";
import { checkRedirectProvider } from "./refunds";

export const choiceInputSchema = z.object({
  choice: resolutionChoiceSchema, targetPublicId: z.string().regex(PUBLIC_CASE_ID).optional(), confirmed: z.literal(true),
}).strict().refine((data) => data.choice === "case" ? !!data.targetPublicId : !data.targetPublicId, "Select one valid destination.");
type ChoiceInput = z.infer<typeof choiceInputSchema>;
type TokenClaims = Awaited<ReturnType<typeof verifyChoiceToken>>;
type Actor = { type: "donor"; claims: TokenClaims } | { type: "system" } |
  { type: "admin"; id: string; reason: string; evidenceRef?: string; consentAt?: Date; consentAmount?: number };
const unavailable = () => new SupportError("invalid_link", "This link is unavailable or has expired. Please contact FTF for help.", 403);

export function resolutionSummary(resolution: ExcessResolution) {
  return { choice: resolution.choice, amount: resolution.amount, state: resolution.state, completedAt: resolution.completedAt?.toISOString() ?? null };
}

async function authorizedChoiceRecord(token: string) {
  const claims = await verifyChoiceToken(token);
  const row = await prisma.excessChoiceToken.findUnique({ where: { nonceHash: claims.nonceHash }, include: {
    donation: { include: { beneficiaryCase: { include: caseLinks }, excessResolution: true } },
  } });
  const now = new Date();
  if (!row || row.donationId !== claims.donationId || row.revokedAt || row.expiresAt <= now ||
      row.expiresAt.getTime() !== claims.expiresAt.getTime() || row.donation.refundDueAt?.getTime() !== row.expiresAt.getTime()) throw unavailable();
  return row;
}

export async function getChoiceTargets(token: string, cursor?: string | null) {
  const row = await authorizedChoiceRecord(token);
  const donation = row.donation;
  if (donation.financialHoldAt) throw new SupportError("financial_hold", "This gift needs finance reconciliation. Redirects are paused.", 409);
  if (donation.excessResolution || row.consumedAt) throw new SupportError("resolved", "Your instruction has already been recorded.", 409);
  await rateLimit("choice-targets", row.nonceHash, 30);
  const page = await getCasePage({ cursor, minimumCapacity: donation.amountExcess, excludePublicId: donation.beneficiaryCase?.publicId });
  return { cases: page.cases.map(({ publicId, displayName, region, needType, amountNeeded, amountRaised }) =>
    ({ publicId, displayName, region, needType, remaining: amountNeeded - amountRaised })), nextCursor: page.nextCursor };
}

export async function getChoiceContext(token: string) {
  const row = await authorizedChoiceRecord(token);
  const donation = row.donation;
  return {
    label: donation.beneficiaryCase && isCasePublic(donation.beneficiaryCase) ? donation.beneficiaryCase.firstName || "an anonymous learner" : "an FTF-administered need",
    amount: donation.amount, credited: donation.amountCreditedToCase, excess: donation.amountExcess,
    financialHold: !!donation.financialHoldAt,
    deadline: row.expiresAt.toISOString(), resolution: donation.excessResolution ? resolutionSummary(donation.excessResolution) : null,
  };
}

// Repeated before provider I/O and at acceptance; neither an expired token nor stale consent can authorize a write.
async function inspectResolution(tx: Prisma.TransactionClient, donation: Donation, input: ChoiceInput, actor: Actor) {
  const now = new Date();
  const token = actor.type === "donor" ? await tx.excessChoiceToken.findUnique({ where: { nonceHash: actor.claims.nonceHash } }) : null;
  if (actor.type === "donor" && (!token || token.donationId !== donation.id || token.revokedAt || token.expiresAt <= now ||
      token.expiresAt.getTime() !== actor.claims.expiresAt.getTime() || donation.refundDueAt?.getTime() !== token.expiresAt.getTime())) throw unavailable();
  const existing = await tx.excessResolution.findUnique({ where: { donationId: donation.id }, include: { targetCase: { select: { publicId: true } } } });
  if (existing) {
    if (actor.type === "admin" && (existing.choice !== input.choice || (existing.targetCase?.publicId ?? undefined) !== input.targetPublicId)) {
      throw new SupportError("resolution_conflict", "A different resolution is already accepted. It cannot be changed.", 409);
    }
    return { token, existing };
  }
  if (token?.consumedAt) throw unavailable();
  if (!donation.amountExcess || !["pending", "audited"].includes(donation.refundStatus ?? "")) {
    throw new SupportError("already_resolved", "This excess no longer needs a decision.", 409);
  }
  if (actor.type === "system" && (input.choice !== "refund" || !donation.refundDueAt || donation.refundDueAt > now)) {
    throw new SupportError("not_due", "The choice period is still open.", 409);
  }
  if (actor.type !== "system" && input.choice !== "refund" && (!donation.refundDueAt || donation.refundDueAt <= now)) {
    throw new SupportError("window_closed", "The choice period has ended. The excess is due for refund.", 409);
  }
  if (actor.type === "admin" && input.choice !== "refund" && (actor.consentAmount !== donation.amountExcess || !donation.paidAt ||
      !actor.consentAt || actor.consentAt < donation.paidAt || actor.consentAt > now)) {
    throw new SupportError("consent_mismatch", "Written consent must identify this payment, its entire excess and chosen destination after the payment date.", 409);
  }
  if (input.choice !== "refund" && donation.financialHoldAt) throw new SupportError("financial_hold", "This gift needs finance reconciliation. No redirect was recorded.", 409);
  return { token, existing: null };
}

// Private shared operation. All public entry points below establish their own authority.
async function acceptResolution(tx: Prisma.TransactionClient, donation: Donation, input: ChoiceInput, actor: Actor, checkedAt?: Date) {
  const { token, existing } = await inspectResolution(tx, donation, input, actor);
  if (existing) return existing;
  const now = new Date();
  if (input.choice !== "refund" && (!checkedAt || now.getTime() - checkedAt.getTime() > 30_000)) {
    throw new SupportError("preflight_expired", "Payment confirmation expired. No redirect was recorded. Please try again.", 409);
  }
  let target = null;
  if (input.choice === "case") {
    const found = await tx.beneficiaryCase.findUnique({ where: { publicId: input.targetPublicId! }, select: { id: true } });
    if (!found || found.id === donation.beneficiaryCaseId) throw new SupportError("invalid_target", "Choose another eligible case.", 409);
    target = await lockCase(tx, found.id);
    if (!isCaseFundable(target, now) || target.amountNeeded - target.amountRaised < donation.amountExcess) {
      throw new SupportError("capacity_changed", "This case can no longer accept the entire excess. Please choose again.", 409);
    }
  }
  const completed = input.choice !== "refund";
  const operation = await tx.excessResolution.create({ data: {
    donationId: donation.id, choice: input.choice, amount: donation.amountExcess, targetCaseId: target?.id,
    actorType: actor.type, actorId: actor.type === "admin" ? actor.id : undefined, actorTokenId: token?.id,
    consentText: actor.type === "system" ? "Automatic excess refund after the disclosed 14-day choice period." : resolutionConsent(input.choice, donation.amountExcess, target?.publicId),
    consentVersion: CONSENT_VERSION, consentAt: actor.type === "admin" ? actor.consentAt ?? now : now,
    consentEvidenceRef: actor.type === "admin" ? actor.evidenceRef : undefined,
    state: completed ? "completed" : donation.financialHoldAt ? "needs_attention" : "requested", completedAt: completed ? now : null,
    nextAttemptAt: completed || donation.financialHoldAt ? null : now, lastError: donation.financialHoldAt ? "financial_hold" : null,
  } });
  if (token) await tx.excessChoiceToken.update({ where: { id: token.id }, data: { consumedAt: now, resolutionId: operation.id } });
  await tx.excessChoiceToken.updateMany({
    where: { donationId: donation.id, consumedAt: null, revokedAt: null }, data: { revokedAt: now },
  });
  await tx.notificationOutbox.updateMany({ where: { donationId: donation.id, template: "excess_choices", state: { not: "sent" } },
    data: { state: "canceled", payloadEncrypted: null } });
  if (target) await tx.beneficiaryCase.update({ where: { id: target.id }, data: {
    amountRaised: { increment: donation.amountExcess },
    ...(target.amountRaised + donation.amountExcess === target.amountNeeded ? { status: "funded", fundedAt: now } : {}),
  } });
  if (completed) await tx.donationLedgerEntry.create({ data: {
    donationId: donation.id, resolutionId: operation.id, beneficiaryCaseId: target?.id,
    operationKey: `${operation.id}:settled`, kind: input.choice === "general" ? "redirect_general" : "redirect_case", amount: donation.amountExcess,
  } });
  const updated = await tx.donation.update({ where: { id: donation.id }, data: { refundStatus: completed ? "donor_redirected" : "pending" } });
  await financialAudit(tx, { action: "EXCESS_DECISION_ACCEPTED", entityId: donation.id, actorType: actor.type,
    actorId: actor.type === "admin" ? actor.id : undefined, before: financialSnapshot(donation),
    after: { ...financialSnapshot(updated), operationId: operation.id, choice: input.choice, targetCaseId: target?.id ?? null,
      consentEvidenceRef: actor.type === "admin" ? actor.evidenceRef ?? null : null,
      reason: actor.type === "admin" ? actor.reason : null } });
  await enqueueNotification(tx, donation.id, completed ? "redirect_completed" : "refund_requested", operation.id);
  return operation;
}

async function acceptWithProviderCheck(donationId: string, input: ChoiceInput, actor: Actor) {
  let checkedAt: Date | undefined;
  if (input.choice !== "refund") {
    const context = await financialTransaction(async (tx) => {
      const donation = await lockDonation(tx, donationId);
      return { donation, ...await inspectResolution(tx, donation, input, actor) };
    });
    if (context.existing) return context.existing;
    checkedAt = await checkRedirectProvider(context.donation);
  }
  return financialTransaction(async (tx) => acceptResolution(tx, await lockDonation(tx, donationId), input, actor, checkedAt));
}

export async function acceptDonorChoice(token: string, input: unknown) {
  const claims = await verifyChoiceToken(token);
  const data = choiceInputSchema.parse(input);
  await rateLimit("choice", claims.nonceHash, 10);
  return acceptWithProviderCheck(claims.donationId, data, { type: "donor", claims });
}

export async function acceptAutomaticRefund(donationId: string) {
  return financialTransaction(async (tx) => acceptResolution(tx, await lockDonation(tx, donationId),
    { choice: "refund", confirmed: true }, { type: "system" }));
}

export async function acceptAdminResolution(donationId: string, input: unknown) {
  const admin = await requireSupportAdmin("refunds.manage");
  z.string().cuid().parse(donationId);
  const schema = z.object({ decision: choiceInputSchema, reason: z.string().trim().min(10).max(1000),
    evidenceRef: z.string().trim().min(5).max(200).regex(/^[\p{L}\p{N}_/.: -]+$/u).optional(),
    consentAt: z.iso.datetime().optional(), consentAmount: z.number().int().positive().optional(),
    verifiedWrittenConsent: z.literal(true).optional() }).strict();
  const data = schema.parse(input);
  if (data.decision.choice !== "refund" && (!data.evidenceRef || /https?:|www\./i.test(data.evidenceRef) || !data.consentAt || !data.verifiedWrittenConsent || !data.consentAmount || new Date(data.consentAt) > new Date())) {
    throw new SupportError("consent_required", "Link written donor authorization for this gift, exact amount and destination, with its date.");
  }
  return acceptWithProviderCheck(donationId, data.decision,
    { type: "admin", id: admin.userId, reason: data.reason, evidenceRef: data.evidenceRef, consentAmount: data.consentAmount,
      consentAt: data.consentAt ? new Date(data.consentAt) : undefined });
}

export async function resendChoiceInvitation(donationId: string, reason: string) {
  const admin = await requireSupportAdmin("refunds.manage");
  z.string().cuid().parse(donationId);
  z.string().trim().min(10).max(1000).parse(reason);
  await rateLimit("resend-choice", donationId, 3, 3_600_000);
  return financialTransaction(async (tx) => {
    const donation = await lockDonation(tx, donationId);
    if (donation.financialHoldAt || !donation.refundDueAt || donation.refundDueAt <= new Date() || await tx.excessResolution.findUnique({ where: { donationId } })) {
      throw new SupportError("unavailable", "An invitation cannot be resent after expiry or an accepted decision.", 409);
    }
    await enqueueChoiceInvitation(tx, donation);
    await financialAudit(tx, { action: "CHOICE_INVITATION_REISSUED", entityId: donationId, actorType: "admin", actorId: admin.userId,
      before: financialSnapshot(donation), after: { ...financialSnapshot(donation), reason } });
  });
}

export async function markExcessAudited(donationId: string, reason: string) {
  const admin = await requireSupportAdmin("refunds.manage");
  z.string().cuid().parse(donationId);
  z.string().trim().min(10).max(1000).parse(reason);
  return financialTransaction(async (tx) => {
    const donation = await lockDonation(tx, donationId);
    const unresolved = ["pending", "audited"].includes(donation.refundStatus ?? "");
    if (!donation.beneficiaryCaseId || (!unresolved && !donation.financialHoldAt)) throw new SupportError("settled", "This excess is already settled.", 409);
    const updated = await tx.donation.update({ where: { id: donationId }, data: {
      ...(unresolved ? { refundStatus: "audited" } : {}), refundAuditedAt: new Date(), refundNotes: reason,
    } });
    await financialAudit(tx, { action: unresolved ? "EXCESS_AUDITED" : "FINANCIAL_HOLD_ESCALATED", entityId: donationId, actorType: "admin", actorId: admin.userId,
      before: financialSnapshot(donation), after: { ...financialSnapshot(updated), reason } });
    return updated;
  });
}
