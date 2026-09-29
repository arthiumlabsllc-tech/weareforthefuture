import "server-only";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../db";
import { SupportError } from "./domain";
import { getCasePage } from "./cases";
import { financialTransaction, rateLimit, requireSupportAdmin } from "./security";
import { financialAudit, financialSnapshot, lockDonation } from "./persistence";
import { acceptAdminResolution, markExcessAudited, resendChoiceInvitation } from "./resolutions";
import { processRefund } from "./refunds";
import { dispatchNotifications } from "./notifications";

const idSchema = z.string().cuid();
const operationSelect = {
  id: true, choice: true, amount: true, state: true, providerId: true, attempts: true,
  lastError: true, nextAttemptAt: true, submittedAt: true, completedAt: true,
  consentText: true, consentVersion: true, consentAt: true, consentEvidenceRef: true, actorType: true, actorId: true,
  targetCase: { select: { publicId: true } },
} satisfies Prisma.ExcessResolutionSelect;
const outflows = ["refund_excess", "redirect_general", "redirect_case"];

export async function getRefundQueue(input: unknown) {
  await requireSupportAdmin("refunds.view");
  const query = z.object({ status: z.enum(["pending", "audited", "refunded", "donor_redirected", "overdue", "attention", "all"]).default("pending"),
    page: z.coerce.number().int().min(1).max(10000).default(1) }).strict().parse(input);
  const where: Prisma.DonationWhereInput = { beneficiaryCaseId: { not: null },
    ...(["all", "attention"].includes(query.status) ? { OR: [{ amountExcess: { gt: 0 } }, { financialHoldAt: { not: null } }] } : { amountExcess: { gt: 0 } }),
    ...(query.status === "overdue" ? { refundStatus: { in: ["pending", "audited"] }, refundDueAt: { lte: new Date() } }
      : query.status === "attention" ? { AND: [{ OR: [{ financialHoldAt: { not: null } }, { excessResolution: { OR: [{ state: { in: ["failed", "needs_attention"] } }, { state: { not: "completed" }, lastError: "worker_unavailable" }] } }] }] }
        : query.status === "all" ? {} : { refundStatus: query.status }) };
  const rows = await prisma.donation.findMany({ where, orderBy: [{ refundDueAt: "asc" }, { id: "asc" }], skip: (query.page - 1) * 20, take: 21,
    select: { id: true, donorEmail: true, amount: true, amountCreditedToCase: true, amountExcess: true, refundStatus: true, refundDueAt: true, financialHoldAt: true,
      beneficiaryCase: { select: { publicId: true } }, excessResolution: { select: { choice: true, state: true } } } });
  const quarantined = await prisma.supportPaymentIntent.findMany({ where: { status: "quarantined" },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }], take: 21, skip: (query.page - 1) * 20,
    select: { id: true, reference: true, amount: true, currency: true, createdAt: true } });
  return { page: query.page, status: query.status, hasMore: rows.length > 20 || quarantined.length > 20, quarantined: quarantined.slice(0, 20), records: rows.slice(0, 20).map(({ donorEmail, ...row }) => ({
    ...row, maskedDonor: donorEmail ? `${donorEmail.slice(0, 1)}***@***` : "No email recorded",
  })) };
}

export async function getRefundDetail(id: string) {
  await requireSupportAdmin("refunds.view");
  await requireSupportAdmin("audit.view");
  idSchema.parse(id);
  const donation = await prisma.donation.findFirst({ where: { id, beneficiaryCaseId: { not: null }, OR: [{ amountExcess: { gt: 0 } }, { financialHoldAt: { not: null } }] },
    select: { id: true, donorName: true, donorEmail: true, amount: true, currency: true, amountCreditedToCase: true, amountExcess: true,
      paymentReference: true, paymentStatus: true, paidAt: true, refundDueAt: true, refundStatus: true, refundReference: true,
      refundedAt: true, refundAuditedAt: true, refundNotes: true, financialHoldAt: true, financialHoldReason: true,
      beneficiaryCase: { select: { id: true, publicId: true } }, excessResolution: { select: operationSelect },
      ledgerEntries: { orderBy: [{ createdAt: "asc" }, { id: "asc" }], select: { id: true, kind: true, amount: true, currency: true, createdAt: true, beneficiaryCase: { select: { publicId: true } } } },
      notifications: { take: 50, orderBy: { createdAt: "desc" }, select: { id: true, template: true, state: true, attempts: true, nextAttemptAt: true, sentAt: true, lastError: true } },
    } });
  if (!donation) throw new SupportError("unavailable", "This excess record is unavailable.", 404);
  const history = await prisma.auditLog.findMany({ where: { entity: "SupportAFuture", entityId: id }, take: 100,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }], select: { id: true, action: true, before: true, after: true, userId: true, createdAt: true } });
  const held = donation.amountExcess - donation.ledgerEntries.filter((row) => outflows.includes(row.kind)).reduce((total, row) => total + row.amount, 0);
  if (held < 0) throw new SupportError("ledger_mismatch", "This record needs financial reconciliation.", 409);
  return { donation, held, history };
}

export async function getAdminRedirectTargets(id: string, cursor?: string) {
  const { donation } = await getRefundDetail(id);
  if (donation.financialHoldAt || donation.excessResolution || !donation.refundDueAt || donation.refundDueAt <= new Date()) {
    throw new SupportError("resolved", "This gift is no longer accepting a redirect instruction.", 409);
  }
  return getCasePage({ cursor, minimumCapacity: donation.amountExcess, excludePublicId: donation.beneficiaryCase?.publicId });
}

export async function actOnRefund(id: string, input: unknown) {
  const actor = await requireSupportAdmin("refunds.manage");
  idSchema.parse(id);
  await rateLimit("admin-refund", actor.userId, 30);
  const data = z.object({ action: z.enum(["resolve", "retry", "resend", "audit"]), reason: z.string().trim().min(10).max(1000),
    confirmed: z.literal(true), resolution: z.unknown().optional() }).strict().parse(input);
  const { donation } = await getRefundDetail(id);
  if (donation.financialHoldAt && data.action !== "audit") throw new SupportError("financial_hold", "Automated money movement is paused. Reconcile the provider exception with finance; retry and audit do not clear the hold.", 409);
  if (data.action === "resolve") {
    const resolution = z.record(z.string(), z.unknown()).parse(data.resolution);
    const operation = await acceptAdminResolution(id, { ...resolution, reason: data.reason });
    return { operationId: operation.id, process: operation.choice === "refund", message: operation.state === "completed" ? "The recorded resolution is complete." : "The refund instruction is recorded. Provider processing is not yet confirmed." };
  }
  if (data.resolution !== undefined) throw new SupportError("invalid_action", "Submit only the fields for this action.");
  if (data.action === "resend") {
    await resendChoiceInvitation(id, data.reason);
    return { operationId: null, process: false, message: "A replacement invitation is queued. The original deadline has not changed." };
  }
  if (data.action === "audit") {
    const audited = await markExcessAudited(id, data.reason);
    return { operationId: null, process: false, message: audited.financialHoldAt ? "Escalation recorded. The financial hold remains in place; no money movement was authorized." : "Escalation recorded. The liability remains unresolved and eligible for automatic refund." };
  }
  const operation = donation.excessResolution;
  if (!operation || operation.choice !== "refund" || operation.state === "completed") throw new SupportError("invalid_retry", "Only an outstanding accepted refund can be reconciled.", 409);
  await financialTransaction(async (tx) => {
    const current = await lockDonation(tx, id);
    if (current.financialHoldAt) throw new SupportError("financial_hold", "Finance reconciliation is required. The hold cannot be cleared by retrying.", 409);
    await financialAudit(tx, { action: "ADMIN_REFUND_RECONCILIATION_REQUESTED", entityId: id, actorType: "admin", actorId: actor.userId,
      before: financialSnapshot(current), after: { ...financialSnapshot(current), operationId: operation.id, reason: data.reason } });
  });
  return { operationId: operation.id, process: true, message: "Reconciliation requested for the existing operation. No second refund has been authorized." };
}

export async function continueAdminRefund(id: string, operationId: string | null, process: boolean) {
  if (process && operationId) {
    try { await processRefund(operationId); }
    catch {
      await financialTransaction(async (tx) => {
        const donation = await lockDonation(tx, id);
        if (donation.financialHoldAt) return;
        await tx.excessResolution.updateMany({ where: { id: operationId, donationId: id, state: { not: "completed" }, leaseToken: null },
          data: { lastError: "worker_unavailable" } });
        await financialAudit(tx, { entityId: id, action: "REFUND_WORKER_UNAVAILABLE", before: financialSnapshot(donation),
          after: { ...financialSnapshot(donation), operationId, alert: true } });
      });
    }
  }
  await dispatchNotifications({ donationId: id });
}

const csvCell = (value: unknown) => {
  const text = String(value ?? "");
  return `"${(/^[=+\-@\t\r\n]/.test(text) ? "'" + text : text).replaceAll('"', '""')}"`;
};
export async function exportExcessLedger(input: unknown) {
  const actor = await requireSupportAdmin("refunds.view");
  await requireSupportAdmin("audit.view");
  await rateLimit("ledger-export", actor.userId, 10, 3_600_000);
  const query = z.object({ from: z.iso.date(), to: z.iso.date() }).strict().parse(input);
  const start = new Date(`${query.from}T00:00:00.000Z`);
  const end = new Date(`${query.to}T00:00:00.000Z`);
  if (end <= start || end.getTime() - start.getTime() > 31 * 86400000) throw new SupportError("date_range", "Choose a range of at most 31 days. The end date is exclusive.");
  // One repeatable-read snapshot keeps opening, movement and closing rows consistent.
  const report = await prisma.$transaction(async (tx) => {
    const balance = async (before: Date) => {
      const groups = await tx.donationLedgerEntry.groupBy({ by: ["kind"], where: { createdAt: { lt: before }, kind: { in: ["excess_held", ...outflows] } }, _sum: { amount: true } });
      let held = BigInt(0);
      for (const group of groups) {
        const amount = group._sum.amount ?? 0;
        if (!Number.isSafeInteger(amount)) throw new SupportError("export_range", "This aggregate requires finance-assisted export.", 409);
        held += BigInt(amount) * BigInt(group.kind === "excess_held" ? 1 : -1);
      }
      return held.toString();
    };
    const rows = await tx.donationLedgerEntry.findMany({ where: { createdAt: { gte: start, lt: end } }, take: 5001,
      orderBy: [{ createdAt: "asc" }, { id: "asc" }], select: { id: true, createdAt: true, donationId: true, resolutionId: true, kind: true, amount: true, currency: true,
        beneficiaryCase: { select: { publicId: true } }, donation: { select: { beneficiaryCase: { select: { publicId: true } }, refundDueAt: true } } } });
    if (rows.length > 5000) throw new SupportError("export_range", "More than 5,000 entries match. Choose a shorter range; no partial export was produced.", 413);
    const [liabilities] = await tx.$queryRaw<Array<{ pending: bigint; audited: bigint; heldExceptions: bigint }>>`
      WITH held AS (
        SELECT d."id", d."refundDueAt", d."financialHoldAt",
          SUM(CASE WHEN l."kind" = 'excess_held' THEN l."amount"::bigint
            WHEN l."kind" IN ('refund_excess','redirect_general','redirect_case') THEN -l."amount"::bigint ELSE 0 END) AS amount,
          EXISTS (SELECT 1 FROM "AuditLog" a WHERE a."entity" = 'SupportAFuture' AND a."entityId" = d."id"
            AND a."action" = 'EXCESS_AUDITED' AND a."createdAt" < ${end}) AS audited
        FROM "Donation" d JOIN "DonationLedgerEntry" l ON l."donationId" = d."id"
        WHERE l."createdAt" < ${end} GROUP BY d."id"
      ) SELECT COALESCE(SUM(amount) FILTER (WHERE "refundDueAt" < ${end} AND NOT audited), 0)::bigint AS pending,
        COALESCE(SUM(amount) FILTER (WHERE "refundDueAt" < ${end} AND audited), 0)::bigint AS audited,
        COALESCE(SUM(amount) FILTER (WHERE "financialHoldAt" < ${end}), 0)::bigint AS "heldExceptions" FROM held`;
    return { rows, opening: await balance(start), closing: await balance(end), liabilities };
  }, { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead });
  const periodKinds = { period_new_excess: "excess_held", period_refunded_excess: "refund_excess", period_redirected_general: "redirect_general", period_redirected_cases: "redirect_case" };
  const movements = Object.fromEntries(Object.entries(periodKinds).map(([label, kind]) => [label,
    report.rows.filter((row) => row.kind === kind).reduce((sum, row) => sum + BigInt(row.amount), BigInt(0))]));
  const lines: unknown[][] = [["entry_id", "recorded_at_utc", "donation_id", "original_case", "destination_case", "resolution_id", "kind", "amount_pesewas", "currency", "refund_due_at_utc"],
    ["summary", start.toISOString(), "", "", "", "", "opening_held_excess", report.opening, "GHS", ""],
    ...report.rows.map((row) => [row.id, row.createdAt.toISOString(), row.donationId, row.donation.beneficiaryCase?.publicId, row.beneficiaryCase?.publicId,
      row.resolutionId, row.kind, row.amount, row.currency, row.donation.refundDueAt?.toISOString()]),
    ["summary", end.toISOString(), "", "", "", "", "closing_held_excess", report.closing, "GHS", ""],
    ...Object.entries({ ...movements, closing_overdue_pending: report.liabilities.pending, closing_overdue_audited: report.liabilities.audited,
      closing_held_under_reconciliation: report.liabilities.heldExceptions }).map(([kind, amount]) =>
      ["summary", end.toISOString(), "", "", "", "", kind, amount.toString(), "GHS", ""])];
  await prisma.auditLog.create({ data: { userId: actor.userId, entity: "SupportAFuture", action: "EXCESS_LEDGER_EXPORTED",
    after: { actorType: "admin", from: query.from, to: query.to, entries: report.rows.length } } });
  return lines.map((line) => line.map(csvCell).join(",")).join("\r\n") + "\r\n";
}
