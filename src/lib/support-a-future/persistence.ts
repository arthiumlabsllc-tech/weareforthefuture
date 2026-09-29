import "server-only";
import { Prisma, type Donation } from "@prisma/client";
import { encryptOutbox, signChoiceToken } from "./security";
import { SupportError } from "./domain";

export async function lockDonation(tx: Prisma.TransactionClient, id: string) {
  await tx.$queryRaw`SELECT "id" FROM "Donation" WHERE "id" = ${id} FOR UPDATE`;
  const donation = await tx.donation.findUnique({ where: { id } });
  if (!donation?.beneficiaryCaseId) throw new SupportError("unavailable", "This gift is unavailable.", 404);
  return donation;
}

export function financialSnapshot(donation: Donation) {
  return {
    amount: donation.amount, credited: donation.amountCreditedToCase, excess: donation.amountExcess,
    refundStatus: donation.refundStatus, paymentStatus: donation.paymentStatus,
    refundReference: donation.refundReference,
    financialHoldAt: donation.financialHoldAt?.toISOString() ?? null,
    financialHoldReason: donation.financialHoldReason,
  };
}

export async function financialAudit(tx: Prisma.TransactionClient, input: {
  action: string; entityId: string; actorType?: "system" | "donor" | "admin"; actorId?: string;
  before?: Prisma.InputJsonObject; after: Prisma.InputJsonObject;
}) {
  await tx.auditLog.create({ data: {
    action: input.action, entity: "SupportAFuture", entityId: input.entityId, userId: input.actorId,
    before: input.before, after: { ...input.after, actorType: input.actorType ?? "system" },
  } });
}

// The caller holds the donation lock. A hold never changes the accepted disposition or ledger.
// Clearing one requires a separately governed reconciliation, not a retry or an audit note.
export async function holdDonation(tx: Prisma.TransactionClient, donation: Donation, reason: string, providerEventId?: string) {
  const updated = await tx.donation.update({ where: { id: donation.id }, data: {
    financialHoldAt: donation.financialHoldAt ?? new Date(), financialHoldReason: donation.financialHoldReason ?? reason,
  } });
  await tx.excessResolution.updateMany({ where: { donationId: donation.id, state: { not: "completed" } }, data: {
    state: "needs_attention", lastError: "financial_hold", nextAttemptAt: null, leaseToken: null, leaseUntil: null,
  } });
  await tx.notificationOutbox.updateMany({ where: { donationId: donation.id, template: "excess_choices", state: { not: "sent" } },
    data: { state: "canceled", payloadEncrypted: null, leaseToken: null, leaseUntil: null } });
  await enqueueNotification(tx, donation.id, "financial_hold");
  if (!donation.financialHoldAt || providerEventId) await financialAudit(tx, {
    action: "CASE_FINANCIAL_HOLD", entityId: donation.id, before: financialSnapshot(donation),
    after: { ...financialSnapshot(updated), reason, providerEventId: providerEventId ?? null, alert: true },
  });
  return updated;
}

export async function enqueueNotification(tx: Prisma.TransactionClient, donationId: string, template: string, resolutionId?: string) {
  const eventKey = `${donationId}:${template}`;
  await tx.notificationOutbox.upsert({ where: { eventKey }, update: {}, create: {
    eventKey, donationId, resolutionId, template,
  } });
}

// Caller holds the donation lock. Reissuing never extends the original deadline.
export async function enqueueChoiceInvitation(tx: Prisma.TransactionClient, donation: Donation, now = new Date()) {
  if (!donation.refundDueAt || donation.amountExcess <= 0) return;
  await tx.excessChoiceToken.updateMany({
    where: { donationId: donation.id, consumedAt: null, revokedAt: null }, data: { revokedAt: now },
  });
  await tx.notificationOutbox.updateMany({
    where: { donationId: donation.id, template: "excess_choices", state: { not: "sent" } },
    data: { state: "canceled", payloadEncrypted: null },
  });
  if (donation.refundDueAt <= now) {
    await enqueueNotification(tx, donation.id, "excess_due");
    return;
  }
  const signed = await signChoiceToken(donation.id, donation.refundDueAt, now);
  const tokenRow = await tx.excessChoiceToken.create({ data: {
    donationId: donation.id, nonceHash: signed.nonceHash, issuedAt: now, expiresAt: donation.refundDueAt,
  } });
  const eventKey = `${donation.id}:excess_choices:${tokenRow.id}`;
  await tx.notificationOutbox.create({ data: {
    eventKey, donationId: donation.id, template: "excess_choices", expiresAt: donation.refundDueAt,
    payloadEncrypted: encryptOutbox(JSON.stringify({ token: signed.token, tokenId: tokenRow.id }), eventKey),
  } });
}
