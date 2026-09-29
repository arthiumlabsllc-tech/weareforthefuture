import "server-only";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "../db";
import { initializeTransaction, verifyTransaction } from "../paystack";
import { assertCheckoutReady, assertFinancialEnvironment, financialTransaction } from "./security";
import { assertPesewas, initializeCaseSchema, pesewasSchema, projectCaseAllocation, retainedGivingAmount, refundDeadline, splitAllocation, SupportError, type CaseReceipt } from "./domain";
import { isCaseFundable, lockCase } from "./cases";
import { enqueueChoiceInvitation, financialAudit, financialSnapshot } from "./persistence";

export const CASE_REFERENCE_PREFIX = "FTF-SAF-";
const referenceSchema = z.string().regex(/^[A-Za-z0-9._=-]{8,100}$/);
const providerIdSchema = z.union([z.string().regex(/^\d+$/), z.number().int().positive().max(Number.MAX_SAFE_INTEGER)]).transform(String);
const verifiedSchema = z.object({
  status: z.literal("success"), reference: referenceSchema, providerTransactionId: providerIdSchema,
  amount: pesewasSchema, currency: z.literal("GHS"), paidAt: z.iso.datetime({ offset: true }),
  channel: z.string().max(40), customer: z.object({ email: z.email().transform((value) => value.toLowerCase()) }),
  metadata: z.object({ type: z.literal("support-a-future"), beneficiaryCaseId: z.string() }),
});

export function hasCaseMetadata(metadata: unknown): boolean {
  if (!metadata || typeof metadata !== "object") return false;
  const value = metadata as Record<string, unknown>;
  if ("beneficiaryCaseId" in value || value.type === "support-a-future") return true;
  return Array.isArray(value.custom_fields) && value.custom_fields.some((field) => hasCaseMetadata(field) ||
    (field && typeof field === "object" && [field.variable_name, field.display_name].includes("beneficiaryCaseId")));
}

export async function isCasePayment(reference: string, metadata?: unknown) {
  return reference.startsWith(CASE_REFERENCE_PREFIX) || hasCaseMetadata(metadata) ||
    !!await prisma.supportPaymentIntent.findUnique({ where: { reference }, select: { id: true } });
}

export async function initializeCasePayment(input: unknown) {
  assertCheckoutReady();
  const data = initializeCaseSchema.parse(input);
  const reference = `${CASE_REFERENCE_PREFIX}${randomUUID()}`;
  const intent = await financialTransaction(async (tx) => {
    const found = await tx.beneficiaryCase.findUnique({ where: { publicId: data.publicId }, select: { id: true } });
    if (!found) throw new SupportError("case_unavailable", "This need is no longer accepting support.", 409);
    const record = await lockCase(tx, found.id);
    if (!isCaseFundable(record)) throw new SupportError("case_unavailable", "This need is no longer accepting support.", 409);
    if (data.amountInPesewas > record.amountNeeded - record.amountRaised) {
      throw new SupportError("capacity_changed", "The remaining need has changed. Please refresh the amount.", 409);
    }
    const supporter = await tx.supporter.findFirst({ where: { email: data.email, deletedAt: null }, select: { id: true } });
    return tx.supportPaymentIntent.create({ data: {
      reference, beneficiaryCaseId: record.id, amount: data.amountInPesewas, email: data.email,
      donorName: data.anonymous ? null : data.donorName, anonymous: data.anonymous, supporterId: supporter?.id,
    } });
  });
  try {
    const result = await initializeTransaction(data.email, intent.amount,
      { type: "support-a-future", beneficiaryCaseId: data.publicId }, [data.channel], data.phone, reference);
    if (result.reference !== reference || !result.accessCode) throw new Error("Initialization binding mismatch");
    await prisma.supportPaymentIntent.updateMany({ where: { id: intent.id, status: "created" }, data: { status: "initialized" } });
    return result;
  } catch {
    await prisma.supportPaymentIntent.updateMany({ where: { id: intent.id, status: "created" }, data: { status: "initialization_failed" } });
    throw new SupportError("initialization_failed", "Checkout could not open. Please try again.", 502);
  }
}

// Only this server verification path can turn a reference into an allocation.
// Browser callbacks and webhook payloads never supply authoritative amounts.
export async function finalizeCasePayment(reference: string) {
  referenceSchema.parse(reference);
  assertFinancialEnvironment();
  const verified = verifiedSchema.safeParse(await verifyTransaction(reference));
  const result = await financialTransaction(async (tx) => {
    await tx.$queryRaw`SELECT "id" FROM "SupportPaymentIntent" WHERE "reference" = ${reference} FOR UPDATE`;
    const intent = await tx.supportPaymentIntent.findUnique({ where: { reference } });
    const quarantine = async (reason: string) => {
      if (intent && intent.status !== "finalized") await tx.supportPaymentIntent.update({ where: { id: intent.id }, data: { status: "quarantined" } });
      await financialAudit(tx, { action: "PAYMENT_RECONCILIATION_REQUIRED", entityId: intent?.id ?? reference,
        after: { reason, reference, alert: true } });
      return null;
    };
    if (!intent) return quarantine("unknown_case_reference");
    if (!verified.success) return quarantine("invalid_verified_payment");
    if (intent.status === "quarantined") return quarantine("quarantined_intent");
    const payment = verified.data;
    const paidAt = new Date(payment.paidAt);
    const record = await lockCase(tx, intent.beneficiaryCaseId);
    if (payment.reference !== reference || payment.amount !== intent.amount || payment.currency !== intent.currency ||
        payment.customer.email !== intent.email || payment.metadata.beneficiaryCaseId !== record.publicId ||
        paidAt.getTime() < intent.createdAt.getTime() - 60_000 || paidAt.getTime() > Date.now() + 60_000) {
      return quarantine("payment_binding_mismatch");
    }
    const providerOwner = await tx.supportPaymentIntent.findUnique({ where: { providerTransactionId: payment.providerTransactionId } });
    if (providerOwner && providerOwner.id !== intent.id) return quarantine("provider_id_reused");
    const existing = await tx.donation.findUnique({ where: { paymentReference: reference } });
    if (existing) {
      if (existing.beneficiaryCaseId !== record.id || existing.amount !== intent.amount || intent.status !== "finalized" ||
          intent.providerTransactionId !== payment.providerTransactionId) return quarantine("existing_donation_mismatch");
      return existing;
    }
    const allocation = splitAllocation(payment.amount, record.amountNeeded, record.amountRaised, isCaseFundable(record));
    assertPesewas(record.amountOversubscribed + allocation.excess, true);
    const donation = await tx.donation.create({ data: {
      amount: payment.amount, currency: payment.currency, donorEmail: intent.email, donorName: intent.donorName,
      anonymous: intent.anonymous, supporterId: intent.supporterId, beneficiaryCaseId: record.id,
      paymentReference: reference, paymentStatus: "paid", channel: payment.channel, paidAt,
      amountCreditedToCase: allocation.credited, amountExcess: allocation.excess,
      refundStatus: allocation.excess ? "pending" : null, refundDueAt: allocation.excess ? refundDeadline(paidAt) : null,
    } });
    const entries = [
      ...(allocation.credited ? [{ donationId: donation.id, beneficiaryCaseId: record.id,
        operationKey: `${donation.id}:original`, kind: "original_case_credit", amount: allocation.credited }] : []),
      ...(allocation.excess ? [{ donationId: donation.id, operationKey: `${donation.id}:held`, kind: "excess_held", amount: allocation.excess }] : []),
    ];
    await tx.donationLedgerEntry.createMany({ data: entries });
    await tx.beneficiaryCase.update({ where: { id: record.id }, data: {
      amountRaised: allocation.raised, amountOversubscribed: { increment: allocation.excess },
      ...(allocation.credited && allocation.raised === record.amountNeeded ? { status: "funded", fundedAt: new Date() } : {}),
    } });
    await tx.supportPaymentIntent.update({ where: { id: intent.id }, data: { status: "finalized", providerTransactionId: payment.providerTransactionId } });
    await financialAudit(tx, { action: "CASE_PAYMENT_ALLOCATED", entityId: donation.id, after: financialSnapshot(donation) });
    if (allocation.excess) await enqueueChoiceInvitation(tx, donation);
    return donation;
  });
  if (!result) throw new SupportError("reconciliation_required", "Your payment needs confirmation by FTF. Please contact us.", 409);
  return result;
}

export const donationAccountingSelect = {
  amount: true, currency: true, paymentStatus: true, beneficiaryCaseId: true,
  amountCreditedToCase: true, amountExcess: true, financialHoldAt: true, refundStatus: true, refundDueAt: true,
  excessResolution: { select: { state: true, choice: true } },
  ledgerEntries: { select: { kind: true, amount: true, currency: true } },
} satisfies Prisma.DonationSelect;

export async function casePaymentStatus(reference: string) {
  return prisma.$transaction(async (tx) => {
    const donation = await tx.donation.findUnique({ where: { paymentReference: reference }, select: donationAccountingSelect });
    return donation ? projectCaseAllocation(donation) : null;
  }, { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead });
}

// A receipt reads committed accounting. It never allocates or retries a refund.
// Delayed webhooks are finalized by the existing reconciliation service.
export async function verifyPaymentReceipt(reference: string) {
  referenceSchema.parse(reference);
  assertFinancialEnvironment();
  const result = await verifyTransaction(reference);
  const basic = z.object({ reference: z.literal(reference), amount: pesewasSchema,
    currency: z.string().regex(/^[A-Z]{3}$/), status: z.string() }).safeParse(result);
  if (!basic.success) throw new SupportError("verification_failed", "Payment verification is unavailable.", 502);
  const casePayment = await isCasePayment(reference, result.metadata);
  let caseReceipt: CaseReceipt | null = null;
  if (casePayment) {
    caseReceipt = await prisma.$transaction(async (tx): Promise<CaseReceipt> => {
      const intent = await tx.supportPaymentIntent.findUnique({ where: { reference },
        include: { beneficiaryCase: { select: { publicId: true } } } });
      const verified = verifiedSchema.safeParse({ ...result, status: "success" });
      if (!intent || !verified.success || intent.status === "quarantined") return { state: "reconciliation_required", allocation: null };
      const payment = verified.data;
      if (payment.amount !== intent.amount || payment.currency !== intent.currency || payment.customer.email !== intent.email ||
          payment.metadata.beneficiaryCaseId !== intent.beneficiaryCase.publicId ||
          (intent.providerTransactionId && payment.providerTransactionId !== intent.providerTransactionId)) return { state: "reconciliation_required", allocation: null };
      const donation = await tx.donation.findUnique({ where: { paymentReference: reference }, select: { ...donationAccountingSelect, paidAt: true } });
      if (!donation) return { state: intent.status === "finalized" ? "reconciliation_required" : "pending", allocation: null };
      if (intent.status !== "finalized" || donation.beneficiaryCaseId !== intent.beneficiaryCaseId || donation.amount !== payment.amount ||
          donation.paidAt?.getTime() !== new Date(payment.paidAt).getTime()) return { state: "reconciliation_required", allocation: null };
      const allocation = projectCaseAllocation(donation);
      if (!allocation || (payment.status !== result.status && !donation.financialHoldAt &&
          !(result.status === "refunded" && allocation.refundedAmount === allocation.originalAmount))) return { state: "reconciliation_required", allocation: null };
      return { state: "allocated", allocation };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead });
  }
  const store = !casePayment && !!await prisma.order.findFirst({ where: { paymentReference: reference }, select: { id: true } });
  return {
    success: true, verified: result.status === "success" || caseReceipt?.state === "allocated", status: result.status,
    amount: result.amount as number, currency: result.currency as string, paidAt: result.paidAt,
    channel: result.channel, customer: { email: result.customer?.email, first_name: result.customer?.first_name, last_name: result.customer?.last_name },
    gatewayResponse: result.gatewayResponse,
    paymentKind: casePayment ? "case" as const : store ? "store" as const : "donation" as const,
    caseReceipt,
  };
}

// Keep original amounts for compatibility, but use completed allocations for giving totals.
export async function supporterDonationHistory(supporterId: string) {
  return prisma.$transaction(async (tx) => {
    const rows = await tx.donation.findMany({ where: { supporterId }, orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      select: { ...donationAccountingSelect, id: true, anonymous: true, createdAt: true, campaign: { select: { name: true, slug: true } } } });
    const totals = new Map<string, { currency: string; amount: number; unreconciledCount: number }>();
    const donations = rows.map((row) => {
      const allocation = projectCaseAllocation(row);
      const retained = retainedGivingAmount(row, allocation);
      const total = totals.get(row.currency) ?? { currency: row.currency, amount: 0, unreconciledCount: 0 };
      total.amount += retained ?? 0;
      if (!Number.isSafeInteger(total.amount)) throw new SupportError("total_range", "Giving totals are unavailable.", 409);
      if (retained === null) total.unreconciledCount++;
      totals.set(row.currency, total);
      return { id: row.id, amount: row.amount, currency: row.currency, paymentStatus: row.paymentStatus,
        anonymous: row.anonymous, createdAt: row.createdAt, campaign: row.campaign,
        caseAllocation: allocation, retainedGivingAmount: retained };
    });
    return { donations, totals: [...totals.values()] };
  }, { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead });
}
