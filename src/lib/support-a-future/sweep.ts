import "server-only";
import { prisma } from "../db";
import { acceptAutomaticRefund } from "./resolutions";
import { processRefund } from "./refunds";
import { dispatchNotifications, sendFinanceAlert } from "./notifications";
import { assertFinancialEnvironment } from "./security";

export async function runRefundSweep() {
  // Checkout's feature flag deliberately does not gate obligations already owed.
  assertFinancialEnvironment();
  const startedAt = new Date();
  const previous = await prisma.auditLog.findFirst({ where: { entity: "SupportAFuture", action: "REFUND_SWEEP_COMPLETED" },
    orderBy: { createdAt: "desc" }, select: { createdAt: true } });
  const firstLiability = previous ? null : await prisma.donation.findFirst({ where: { amountExcess: { gt: 0 } }, orderBy: { createdAt: "asc" }, select: { createdAt: true } });
  const lastExpectedActivity = previous?.createdAt ?? firstLiability?.createdAt;
  const missedRun = !!lastExpectedActivity && startedAt.getTime() - lastExpectedActivity.getTime() > 26 * 3_600_000;
  const counts = { accepted: 0, attempted: 0, completed: 0, failed: 0 };
  await prisma.auditLog.create({ data: { entity: "SupportAFuture", action: "REFUND_SWEEP_STARTED", after: { actorType: "system", missedRun } } });
  const due = await prisma.donation.findMany({ where: {
    amountExcess: { gt: 0 }, refundStatus: { in: ["pending", "audited"] }, refundDueAt: { lte: startedAt }, excessResolution: null,
  }, orderBy: [{ refundDueAt: "asc" }, { id: "asc" }], take: 100, select: { id: true } });
  for (const donation of due) {
    try { await acceptAutomaticRefund(donation.id); counts.accepted++; } catch { counts.failed++; }
  }
  const operations = await prisma.excessResolution.findMany({ where: { choice: "refund", state: { not: "completed" },
    nextAttemptAt: { lte: new Date() }, OR: [{ leaseUntil: null }, { leaseUntil: { lte: new Date() } }],
  }, orderBy: [{ nextAttemptAt: "asc" }, { id: "asc" }], take: 20, select: { id: true } });
  for (let offset = 0; offset < operations.length && Date.now() - startedAt.getTime() < 200_000; offset += 3) {
    await Promise.all(operations.slice(offset, offset + 3).map(async (operation) => {
      counts.attempted++;
      try {
        await processRefund(operation.id);
        const result = await prisma.excessResolution.findUniqueOrThrow({ where: { id: operation.id }, select: { state: true } });
        if (result.state === "completed") counts.completed++;
        if (["failed", "needs_attention"].includes(result.state)) counts.failed++;
      } catch { counts.failed++; }
    }));
  }
  const notifications = await dispatchNotifications({ limit: 30 });
  await prisma.supportRateLimit.deleteMany({ where: { expiresAt: { lt: startedAt } } });
  await prisma.notificationOutbox.updateMany({ where: { expiresAt: { lte: startedAt }, payloadEncrypted: { not: null } },
    data: { payloadEncrypted: null, state: "canceled" } });
  const overdue = await prisma.donation.count({ where: { amountExcess: { gt: 0 }, refundStatus: { in: ["pending", "audited"] }, refundDueAt: { lte: startedAt } } });
  const attention = await prisma.excessResolution.count({ where: { state: { in: ["failed", "needs_attention"] } } });
  const failedNotifications = await prisma.notificationOutbox.count({ where: { state: "pending", lastError: { not: null } } });
  const financialHolds = await prisma.donation.count({ where: { financialHoldAt: { not: null } } });
  const quarantinedPayments = await prisma.supportPaymentIntent.count({ where: { status: "quarantined" } });
  let alertFailed = false;
  try { await sendFinanceAlert({ overdue, attention, failedNotifications, missedRun, financialHolds, quarantinedPayments }); } catch { alertFailed = true; }
  const summary = { ...counts, notificationsSent: notifications.sent, failedNotifications, overdue, attention, financialHolds, quarantinedPayments, missedRun, alertFailed };
  await prisma.auditLog.create({ data: { entity: "SupportAFuture", action: "REFUND_SWEEP_COMPLETED", after: { ...summary, actorType: "system" } } });
  if (alertFailed) throw new Error("Finance alert delivery failed");
  return summary;
}
