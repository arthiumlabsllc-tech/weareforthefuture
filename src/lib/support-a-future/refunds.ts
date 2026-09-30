import "server-only";
import { randomUUID } from "node:crypto";
import type { Donation } from "@prisma/client";
import { SupportError } from "./domain";
import { prisma } from "../db";
import { verifyTransaction } from "../paystack";
import { assertFinancialEnvironment, financialTransaction } from "./security";
import { enqueueNotification, financialAudit, financialSnapshot, holdDonation, lockDonation } from "./persistence";
import { createExcessRefund, fetchRefund, listTransactionRefunds, refundOperationNote, refundTransactionId,
  transactionHasDisputes, fetchDispute, fetchPaymentPointer, type ProviderRefund } from "./refund-provider";

const LEASE_MS = 120_000;
const RETRY_MS = 15 * 60_000;

async function recordAttention(donationId: string, operationId: string, leaseToken: string, reason: string, retryable = false, detail?: string) {
  await financialTransaction(async (tx) => {
    const donation = await lockDonation(tx, donationId);
    const operation = await tx.excessResolution.findUnique({ where: { id: operationId } });
    if (!operation || operation.state === "completed" || operation.leaseToken !== leaseToken || donation.financialHoldAt) return;
    await tx.excessResolution.update({ where: { id: operationId }, data: {
      state: retryable && !operation.submittedAt ? "requested" : "needs_attention", lastError: reason,
      leaseToken: null, leaseUntil: null, nextAttemptAt: new Date(Date.now() + RETRY_MS),
    } });
    await tx.donation.update({ where: { id: donationId }, data: { refundStatus: "pending" } });
    await financialAudit(tx, { action: "REFUND_ATTENTION_REQUIRED", entityId: donationId,
      before: financialSnapshot(donation), after: { reason, operationId, alert: true, ...(detail ? { providerError: detail } : {}) } });
  });
}

// Provider payloads reach this function only through authenticated server-to-provider requests.
async function applyProviderRefund(donationId: string, operationId: string, refund: ProviderRefund) {
  return financialTransaction(async (tx) => {
    const donation = await lockDonation(tx, donationId);
    const operation = await tx.excessResolution.findUniqueOrThrow({ where: { id: operationId } });
    if (operation.state === "completed" || donation.financialHoldAt) return operation;
    const intent = await tx.supportPaymentIntent.findUnique({ where: { reference: donation.paymentReference! } });
    if (operation.choice !== "refund" || refundTransactionId(refund) !== intent?.providerTransactionId || refund.amount !== operation.amount ||
        refund.amount !== donation.amountExcess || refund.currency !== "GHS" ||
        (typeof refund.transaction !== "string" && refund.transaction.reference !== donation.paymentReference) ||
        (operation.providerId ? refund.id !== operation.providerId : refund.merchant_note !== refundOperationNote(operation.id))) {
      throw new Error("Refund binding mismatch");
    }
    if (refund.dispute) {
      await holdDonation(tx, donation, "provider_dispute", `refund:${refund.id}`);
      return tx.excessResolution.findUniqueOrThrow({ where: { id: operationId } });
    }
    const done = refund.status === "processed";
    const failed = ["failed", "needs-attention"].includes(refund.status);
    const completedAt = done ? (refund.refunded_at ? new Date(refund.refunded_at) : new Date()) : null;
    const updated = await tx.excessResolution.update({ where: { id: operationId }, data: {
      providerId: refund.id, state: done ? "completed" : failed ? "failed" : "processing", completedAt,
      leaseToken: null, leaseUntil: null, nextAttemptAt: done ? null : new Date(Date.now() + RETRY_MS),
      lastError: failed ? "provider_needs_attention" : null,
    } });
    const updatedDonation = await tx.donation.update({ where: { id: donationId }, data: {
      refundReference: refund.id, refundStatus: done ? "refunded" : "pending", refundedAt: completedAt,
      ...(done && donation.amountCreditedToCase === 0 ? { paymentStatus: "refunded" } : {}),
    } });
    if (done) {
      await tx.donationLedgerEntry.create({ data: {
        donationId, resolutionId: operationId, kind: "refund_excess", amount: operation.amount, operationKey: `${operationId}:settled`,
      } });
      await enqueueNotification(tx, donationId, "refund_completed", operationId);
    }
    await financialAudit(tx, { action: done ? "EXCESS_REFUND_COMPLETED" : "EXCESS_REFUND_PROGRESS", entityId: donationId,
      before: financialSnapshot(donation), after: { ...financialSnapshot(updatedDonation), operationId, state: updated.state, alert: failed } });
    return updated;
  });
}

export async function processRefund(operationId: string) {
  assertFinancialEnvironment();
  const pointer = await prisma.excessResolution.findUnique({ where: { id: operationId }, select: { donationId: true } });
  if (!pointer) return;
  const leaseToken = randomUUID();
  const claimed = await financialTransaction(async (tx) => {
    const donation = await lockDonation(tx, pointer.donationId);
    const operation = await tx.excessResolution.findUniqueOrThrow({ where: { id: operationId } });
    if (donation.financialHoldAt || operation.choice !== "refund" || operation.state === "completed" || (operation.leaseUntil && operation.leaseUntil > new Date())) return null;
    const intent = await tx.supportPaymentIntent.findUnique({ where: { reference: donation.paymentReference! } });
    if (!intent?.providerTransactionId) throw new Error("Payment provider binding missing");
    await tx.excessResolution.update({ where: { id: operation.id }, data: {
      leaseToken, leaseUntil: new Date(Date.now() + LEASE_MS), attempts: { increment: 1 },
    } });
    return { donation, operation, providerTransactionId: intent.providerTransactionId };
  });
  if (!claimed) return;
  const { donation, operation, providerTransactionId } = claimed;
  let submitted = !!operation.submittedAt;
  try {
    // Reconcile first, including manual refunds. Never blindly repeat an uncertain POST.
    const history = await listTransactionRefunds(providerTransactionId);
    if (history.some((refund) => refundTransactionId(refund) !== providerTransactionId)) throw new Error("Refund query mismatch");
    const ours = history.filter((refund) => operation.providerId ? refund.id === operation.providerId : refund.merchant_note === refundOperationNote(operationId));
    if (history.some((refund) => !!refund.dispute) || history.length !== ours.length || ours.length > 1 || await transactionHasDisputes(providerTransactionId)) {
      await freezeDonation(donation.id, "external_refund_or_dispute");
      return;
    }
    if (operation.providerId || ours.length === 1) {
      const refund = await fetchRefund(operation.providerId ?? ours[0].id);
      return await applyProviderRefund(donation.id, operationId, refund);
    }
    if (submitted || operation.state !== "requested") {
      await recordAttention(donation.id, operationId, leaseToken, "submission_unknown");
      return;
    }
    const payment = await verifyTransaction(donation.paymentReference!);
    if (payment.status !== "success" || payment.amount !== donation.amount || payment.currency !== "GHS" ||
        payment.reference !== donation.paymentReference || String(payment.providerTransactionId) !== providerTransactionId) {
      await freezeDonation(donation.id, "payment_changed");
      return;
    }
    // A stale worker cannot submit after another worker has acquired its lease.
    const ready = await financialTransaction(async (tx) => {
      const current = await lockDonation(tx, donation.id);
      if (current.financialHoldAt) return false;
      const result = await tx.excessResolution.updateMany({ where: {
        id: operationId, leaseToken, leaseUntil: { gt: new Date() }, state: "requested", submittedAt: null,
      }, data: { state: "submitting", submittedAt: new Date() } });
      return result.count > 0;
    });
    if (!ready) return;
    submitted = true;
    const refund = await createExcessRefund(donation.paymentReference!, donation.amountExcess, operationId);
    return await applyProviderRefund(donation.id, operationId, refund);
  } catch (error) {
    const detail = error instanceof Error
      ? `${error.name}: ${error.message.slice(0, 200)}`
      : "unknown";
    await recordAttention(donation.id, operationId, leaseToken, submitted ?
      "submission_or_confirmation_unknown" : "provider_preflight_failed", !submitted, detail);
  }
}

async function freezeDonation(donationId: string, reason: string, providerEventId?: string) {
  await financialTransaction(async (tx) => holdDonation(tx, await lockDonation(tx, donationId), reason, providerEventId));
}

// Called only after authority and unresolved status are checked under the donation lock.
// Provider calls never run while holding financial locks. Acceptance rechecks the hold and deadline.
export async function checkRedirectProvider(donation: Donation) {
  assertFinancialEnvironment();
  if (donation.financialHoldAt) throw new SupportError("financial_hold", "This gift needs finance reconciliation. No redirect was recorded.", 409);
  const intent = await prisma.supportPaymentIntent.findUnique({ where: { reference: donation.paymentReference! }, include: { beneficiaryCase: { select: { publicId: true } } } });
  if (!intent?.providerTransactionId || intent.status !== "finalized") throw new SupportError("reconciliation_required", "This gift needs finance reconciliation.", 409);
  let reason: string | null = null;
  // Retain known exception evidence even when a different provider endpoint is unavailable.
  const [verified, history, disputes] = await Promise.allSettled([
    verifyTransaction(intent.reference), listTransactionRefunds(intent.providerTransactionId), transactionHasDisputes(intent.providerTransactionId),
  ]);
  const refunds = history.status === "fulfilled" ? history.value : [];
  const accepted = refunds.length ? await prisma.excessResolution.findUnique({ where: { donationId: donation.id } }) : null;
  const concurrentRefund = accepted?.choice === "refund" && refunds.length === 1 &&
    refundTransactionId(refunds[0]) === intent.providerTransactionId && refunds[0].amount === donation.amountExcess &&
    refunds[0].currency === donation.currency && (typeof refunds[0].transaction === "string" || refunds[0].transaction.reference === donation.paymentReference) &&
    (accepted.providerId ? refunds[0].id === accepted.providerId : refunds[0].merchant_note === refundOperationNote(accepted.id));
  if ((disputes.status === "fulfilled" && disputes.value) || refunds.some((refund) => !!refund.dispute) || (refunds.length && !concurrentRefund)) reason = "external_refund_or_dispute";
  if (!reason && verified.status === "fulfilled") {
    const payment = verified.value;
    if ((!concurrentRefund && payment.status !== "success") || payment.amount !== donation.amount || payment.currency !== donation.currency ||
        payment.reference !== intent.reference || String(payment.providerTransactionId) !== intent.providerTransactionId ||
        payment.customer?.email?.toLowerCase() !== intent.email || payment.metadata?.type !== "support-a-future" ||
        payment.metadata?.beneficiaryCaseId !== intent.beneficiaryCase.publicId ||
        new Date(payment.paidAt).getTime() !== donation.paidAt?.getTime()) reason = "payment_changed";
  }
  if (reason) {
    await freezeDonation(donation.id, reason);
    throw new SupportError("financial_hold", "This gift needs finance reconciliation. No redirect was recorded. Please contact FTF.", 409);
  }
  if ([verified, history, disputes].some((result) => result.status === "rejected")) {
    throw new SupportError("provider_unavailable", "We could not confirm the payment status. No redirect was recorded. Please try again.", 502);
  }
  return new Date();
}

// Events can precede charge.success. Quarantine an unallocated intent instead of losing the signal.
async function freezeProviderPayment(transactionId: string, reason: string, providerEventId: string) {
  const pointer = await fetchPaymentPointer(transactionId);
  await financialTransaction(async (tx) => {
    await tx.$queryRaw`SELECT "id" FROM "SupportPaymentIntent" WHERE "reference" = ${pointer.reference} FOR UPDATE`;
    const intent = await tx.supportPaymentIntent.findUnique({ where: { reference: pointer.reference } });
    if (!intent) return;
    if (intent.providerTransactionId && intent.providerTransactionId !== transactionId) throw new Error("Event payment binding mismatch");
    const donation = await tx.donation.findUnique({ where: { paymentReference: intent.reference }, select: { id: true } });
    if (donation) await holdDonation(tx, await lockDonation(tx, donation.id), reason, providerEventId);
    else {
      await tx.supportPaymentIntent.update({ where: { id: intent.id }, data: { status: "quarantined" } });
      await financialAudit(tx, { action: "PAYMENT_RECONCILIATION_REQUIRED", entityId: intent.id,
        after: { reason, providerEventId, providerTransactionId: transactionId, alert: true } });
    }
  });
}

const eventId = (value: unknown) => {
  const id = typeof value === "string" || (typeof value === "number" && Number.isSafeInteger(value)) ? String(value) : "";
  if (!/^\d+$/.test(id)) throw new SupportError("invalid_event", "Invalid provider event.");
  return id;
};

// Webhook events are hints, not settlement evidence: fetch the provider's current state.
export async function handleRefundEvent(data: Record<string, unknown>) {
  const providerId = eventId(data.id);
  const refund = await fetchRefund(providerId);
  if (refund.id !== providerId) throw new Error("Refund event binding mismatch");
  const intent = await prisma.supportPaymentIntent.findUnique({ where: { providerTransactionId: refundTransactionId(refund) } });
  const donation = intent ? await prisma.donation.findUnique({ where: { paymentReference: intent.reference }, include: { excessResolution: true } }) : null;
  const operation = donation?.excessResolution;
  const ours = operation?.choice === "refund" && (operation.providerId ? operation.providerId === refund.id : refund.merchant_note === refundOperationNote(operation.id));
  if (!ours || refund.dispute) return freezeProviderPayment(refundTransactionId(refund), "external_refund_or_dispute", `refund:${providerId}`);
  return processRefund(operation.id);
}

export async function handleDisputeEvent(data: Record<string, unknown>) {
  const id = eventId(data.id);
  const dispute = await fetchDispute(id);
  if (dispute.id !== id) throw new Error("Dispute event binding mismatch");
  const transactionId = typeof dispute.transaction === "string" ? dispute.transaction : dispute.transaction.id;
  // Even a resolved dispute stays held until finance has reconciled its effect on the retained balance.
  return freezeProviderPayment(transactionId, "provider_dispute", `dispute:${id}`);
}
