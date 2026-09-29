import { z } from "zod";

export const MAX_PESEWAS = 2_147_483_647;
export const CHOICE_WINDOW_MS = 14 * 24 * 60 * 60 * 1000;
export const CASE_PAGE_SIZE = 20;
export const CONSENT_VERSION = "excess-v1";
export const PUBLIC_CASE_ID = /^FTF-\d{4}-\d{3,}$/;
export const NEED_TYPES = ["Learning", "Health and dignity", "Wellbeing and safety", "Pathways and skills"] as const;
export const CASE_REGIONS = [
  "Ahafo", "Ashanti", "Bono", "Bono East", "Central", "Eastern", "Greater Accra",
  "North East", "Northern", "Oti", "Savannah", "Upper East", "Upper West", "Volta",
  "Western", "Western North", "Oyo",
] as const;

export class SupportError extends Error {
  constructor(public readonly code: string, message: string, public readonly status = 400) {
    super(message);
    this.name = "SupportError";
  }
}

export const pesewasSchema = z.number().int().min(1).max(MAX_PESEWAS);
const plainText = (max: number) => z.string().trim().min(1).max(max).refine(
  (value) => !/[<>\u0000-\u0008]/u.test(value), "Use plain text without HTML.",
);
const optionalText = (max: number) => plainText(max).nullable();
const optionalId = z.string().cuid().nullable();
const optionalDate = z.iso.datetime().nullable();

// Explicit allowlist: approval, publication and financial fields are separate actions.
export const caseDraftSchema = z.object({
  firstName: z.string().trim().max(40).regex(/^[\p{L}\p{M}'’-]+$/u, "Use a first name or pseudonym only.").nullable(),
  age: z.number().int().min(0).max(30).nullable(),
  region: z.enum(CASE_REGIONS),
  needType: z.enum(NEED_TYPES),
  needDescription: plainText(800),
  storyShort: plainText(320),
  storyFull: plainText(6000),
  amountNeeded: pesewasSchema,
  pillarId: optionalId,
  programId: optionalId,
  consentGiven: z.boolean(),
  consentEvidenceRef: optionalText(200),
  consentRecordedAt: optionalDate,
  consentExpiresAt: optionalDate,
  closesAt: optionalDate,
  photoAssetId: z.string().regex(/^ftf\/beneficiary-cases\/[a-zA-Z0-9_/-]+$/).max(200).nullable(),
  photoAlt: optionalText(200),
}).strict().superRefine((value, ctx) => {
  if (value.consentGiven && (!value.consentEvidenceRef || !value.consentRecordedAt)) {
    ctx.addIssue({ code: "custom", path: ["consentEvidenceRef"], message: "Record consent evidence and its date." });
  }
  if (value.photoAssetId && !value.photoAlt) {
    ctx.addIssue({ code: "custom", path: ["photoAlt"], message: "Add safeguarding-safe image alternative text." });
  }
  if (value.consentRecordedAt && value.consentExpiresAt && value.consentExpiresAt <= value.consentRecordedAt) {
    ctx.addIssue({ code: "custom", path: ["consentExpiresAt"], message: "Consent expiry must follow its recorded date." });
  }
});
export type CaseDraft = z.infer<typeof caseDraftSchema>;

export const initializeCaseSchema = z.object({
  publicId: z.string().regex(PUBLIC_CASE_ID),
  amountInPesewas: pesewasSchema,
  email: z.email().max(254).transform((value) => value.toLowerCase()),
  donorName: z.string().trim().max(100).optional(),
  anonymous: z.boolean().default(false),
  channel: z.enum(["card", "mobile_money", "bank_transfer"]).default("card"),
  phone: z.string().regex(/^\+?[0-9]{9,15}$/).optional(),
}).strict();

export type ResolutionChoice = "refund" | "general" | "case";
export const resolutionChoiceSchema = z.enum(["refund", "general", "case"]);

export function assertPesewas(amount: number, allowZero = false): number {
  if (!Number.isSafeInteger(amount) || amount < (allowZero ? 0 : 1) || amount > MAX_PESEWAS) {
    throw new SupportError("invalid_amount", "Enter a valid amount in Ghana cedis.");
  }
  return amount;
}

export function splitAllocation(payment: number, needed: number, raised: number, eligible = true) {
  assertPesewas(payment);
  assertPesewas(needed);
  assertPesewas(raised, true);
  if (raised > needed) throw new SupportError("invalid_balance", "This case needs financial reconciliation.", 409);
  const credited = eligible ? Math.min(payment, needed - raised) : 0;
  return { credited, excess: payment - credited, raised: raised + credited };
}

export function refundDeadline(paidAt: Date): Date {
  if (!Number.isFinite(paidAt.getTime())) throw new SupportError("invalid_payment_date", "Payment verification is incomplete.", 409);
  return new Date(paidAt.getTime() + CHOICE_WINDOW_MS);
}

export function formatGhs(pesewas: number): string {
  return `GH₵${(assertPesewas(pesewas, true) / 100).toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function parseGhs(value: string): number | null {
  const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(value.trim());
  if (!match) return null;
  const amount = Number(match[1]) * 100 + Number((match[2] || "").padEnd(2, "0"));
  return Number.isSafeInteger(amount) && amount > 0 && amount <= MAX_PESEWAS ? amount : null;
}

export function resolutionConsent(choice: ResolutionChoice, amount: number, targetPublicId?: string): string {
  const money = formatGhs(amount);
  if (choice === "refund") return `Refund the excess of ${money}. Keep the original case allocation unchanged.`;
  if (choice === "general") return `I authorize FTF to redirect my entire excess of ${money} to its general fund. Keep the original case allocation unchanged.`;
  if (!targetPublicId || !PUBLIC_CASE_ID.test(targetPublicId)) throw new SupportError("invalid_target", "Choose an eligible case.");
  return `I authorize FTF to redirect my entire excess of ${money} to case ${targetPublicId}. Keep the original case allocation unchanged.`;
}

// Private accounting projections contain no beneficiary content or provider identifiers.
export interface DonationAccounting {
  amount: number;
  currency: string;
  paymentStatus: string;
  beneficiaryCaseId: string | null;
  amountCreditedToCase: number;
  amountExcess: number;
  financialHoldAt: Date | null;
  refundStatus: string | null;
  refundDueAt: Date | null;
  excessResolution: { state: string; choice: string } | null;
  ledgerEntries: { kind: string; amount: number; currency: string }[];
}

const balanceSchema = z.number().int().min(0).max(MAX_PESEWAS);
export const caseAllocationSchema = z.object({
  originalAmount: pesewasSchema, creditedAmount: balanceSchema, excessAmount: balanceSchema,
  refundedAmount: balanceSchema, redirectedAmount: balanceSchema, heldAmount: balanceSchema,
  retainedAmount: balanceSchema.nullable(), allocatedAmount: balanceSchema.nullable(), financialHold: z.boolean(),
  refundStatus: z.string().nullable(), resolutionState: z.string().nullable(), refundDueAt: z.iso.datetime().nullable(),
}).strict().refine((row) => row.originalAmount === row.creditedAmount + row.excessAmount &&
  row.excessAmount === row.refundedAmount + row.redirectedAmount + row.heldAmount &&
  (row.financialHold ? row.retainedAmount === null && row.allocatedAmount === null
    : row.retainedAmount === row.originalAmount - row.refundedAmount && row.allocatedAmount === row.creditedAmount + row.redirectedAmount));
export type CaseAllocation = z.infer<typeof caseAllocationSchema>;
export const caseReceiptSchema = z.discriminatedUnion("state", [
  z.object({ state: z.literal("allocated"), allocation: caseAllocationSchema }).strict(),
  z.object({ state: z.enum(["pending", "reconciliation_required"]), allocation: z.null() }).strict(),
]);
export type CaseReceipt = z.infer<typeof caseReceiptSchema>;

export function projectCaseAllocation(donation: DonationAccounting): CaseAllocation | null {
  if (!donation.beneficiaryCaseId) return null;
  const total = (kind: string) => donation.ledgerEntries.filter((entry) => entry.kind === kind).reduce((sum, entry) => {
    if (entry.currency !== donation.currency) throw new SupportError("ledger_mismatch", "This gift needs financial reconciliation.", 409);
    return assertPesewas(sum + assertPesewas(entry.amount), true);
  }, 0);
  if (donation.currency !== "GHS" || total("original_case_credit") !== donation.amountCreditedToCase || total("excess_held") !== donation.amountExcess) {
    throw new SupportError("ledger_mismatch", "This gift needs financial reconciliation.", 409);
  }
  const refunded = total("refund_excess");
  const redirected = total("redirect_general") + total("redirect_case");
  const financialHold = !!donation.financialHoldAt;
  return caseAllocationSchema.parse({
    originalAmount: donation.amount, creditedAmount: donation.amountCreditedToCase, excessAmount: donation.amountExcess,
    refundedAmount: refunded, redirectedAmount: redirected, heldAmount: donation.amountExcess - refunded - redirected,
    retainedAmount: financialHold ? null : donation.amount - refunded,
    allocatedAmount: financialHold ? null : donation.amountCreditedToCase + redirected, financialHold,
    refundStatus: donation.refundStatus, resolutionState: donation.excessResolution?.state ?? null,
    refundDueAt: donation.refundDueAt?.toISOString() ?? null,
  });
}

export function retainedGivingAmount(donation: DonationAccounting, allocation = projectCaseAllocation(donation)): number | null {
  if (donation.financialHoldAt) return null;
  if (allocation) return allocation.allocatedAmount;
  return donation.paymentStatus === "paid" ? assertPesewas(donation.amount, true) : 0;
}

export function caseReceiptMessage(receipt: CaseReceipt): string {
  if (receipt.state === "pending") return "Payment received; allocation is being confirmed. Check status again before making another payment.";
  if (receipt.state !== "allocated" || receipt.allocation.financialHold) return "This gift needs finance reconciliation. Recorded allocations remain history, not a confirmed current balance. Please contact FTF.";
  const allocation = receipt.allocation;
  if (allocation.refundedAmount > 0) return "The excess refund is complete. Any original case allocation remains intact.";
  if (allocation.redirectedAmount > 0) return "Your consented excess redirect is complete. The original case allocation remains intact.";
  if (allocation.heldAmount > 0) return allocation.resolutionState
    ? "Your refund instruction is recorded, but provider completion is not yet confirmed. The excess remains held."
    : "The original case allocation is confirmed. Your excess is held separately; use your private email invitation to choose what happens to it.";
  return "Your payment is fully allocated to the FTF-administered need.";
}

export function canCelebrateCaseReceipt(receipt: CaseReceipt): boolean {
  return receipt.state === "allocated" && !receipt.allocation.financialHold && receipt.allocation.excessAmount === 0;
}

export interface PublicBeneficiaryCase {
  publicId: string;
  displayName: string;
  age: number | null;
  region: string;
  needType: string;
  needDescription: string;
  storyShort: string;
  storyFull?: string;
  amountNeeded: number;
  amountRaised: number;
  photoUrl: string | null;
  photoAlt: string | null;
  status: string;
}
