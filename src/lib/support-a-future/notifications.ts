import "server-only";
import { randomUUID } from "node:crypto";
import sgMail from "@sendgrid/mail";
import { z } from "zod";
import { prisma } from "../db";
import { formatGhs } from "./domain";
import { decryptOutbox, financialTransaction, trustedOrigin } from "./security";
import { enqueueNotification, lockDonation } from "./persistence";

export type SupportMessage = { to: string; subject: string; text: string };
async function sendSupportMessage(message: SupportMessage) {
  if (!process.env.SENDGRID_API_KEY || !process.env.SENDGRID_FROM_EMAIL) throw new Error("Mail configuration unavailable");
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  await sgMail.send({ ...message, from: { email: process.env.SENDGRID_FROM_EMAIL, name: "For The Future Organization" },
    trackingSettings: { clickTracking: { enable: false, enableText: false }, openTracking: { enable: false },
      subscriptionTracking: { enable: false }, ganalytics: { enable: false } },
  });
}

export async function dispatchNotifications(options: { donationId?: string; limit?: number; send?: (message: SupportMessage) => Promise<void> } = {}) {
  const now = new Date();
  const rows = await prisma.notificationOutbox.findMany({ where: {
    donationId: options.donationId, state: { in: ["pending", "sending"] }, nextAttemptAt: { lte: now },
    OR: [{ leaseUntil: null }, { leaseUntil: { lte: now } }],
  }, orderBy: { nextAttemptAt: "asc" }, take: Math.min(options.limit ?? 20, 50) });
  const counts = { sent: 0, failed: 0 };
  for (const candidate of rows) {
    const leaseToken = randomUUID();
    const row = await financialTransaction(async (tx) => {
      await lockDonation(tx, candidate.donationId);
      const claim = await tx.notificationOutbox.updateMany({ where: { id: candidate.id, state: { in: ["pending", "sending"] },
        OR: [{ leaseUntil: null }, { leaseUntil: { lte: new Date() } }] },
      data: { state: "sending", leaseToken, leaseUntil: new Date(Date.now() + 120_000), attempts: { increment: 1 } } });
      if (!claim.count) return null;
      return tx.notificationOutbox.findUniqueOrThrow({ where: { id: candidate.id }, include: { donation: true, resolution: true } });
    });
    if (!row) continue;
    try {
      const gift = row.donation;
      const lines = ["Thank you for your gift to an FTF-administered need.", "",
        `Original gift: ${formatGhs(gift.amount)}`, `Credited to the original case: ${formatGhs(gift.amountCreditedToCase)}`,
        `Original excess: ${formatGhs(gift.amountExcess)}`, "The original case allocation remains unchanged.", ""];
      let subject = "Your gift: excess update";
      if (gift.financialHoldAt) {
        subject = "Your gift needs payment reconciliation";
        lines.push("FTF is checking a provider refund or payment exception. Further automated money movement is paused.",
          "Your recorded allocation and any accepted instruction have not been replaced. This message does not confirm another refund or redirect.",
          "Please contact FTF for a verified status update. The original choice deadline has not been extended.");
      } else if (row.template === "excess_choices") {
        const payload = z.object({ token: z.string().max(2048), tokenId: z.string() }).parse(JSON.parse(decryptOutbox(row.payloadEncrypted!, row.eventKey)));
        const token = await prisma.excessChoiceToken.findUnique({ where: { id: payload.tokenId } });
        if (!token || token.revokedAt || token.consumedAt || token.expiresAt <= new Date()) {
          await financialTransaction(async (tx) => {
            await lockDonation(tx, gift.id);
            await tx.notificationOutbox.update({ where: { id: row.id }, data: { state: "canceled", payloadEncrypted: null, leaseUntil: null, leaseToken: null } });
            if (token && token.expiresAt <= new Date() && !token.consumedAt && !token.revokedAt) await enqueueNotification(tx, gift.id, "excess_due");
          });
          continue;
        }
        subject = "Choose what happens to your excess gift";
        lines.push(gift.amountCreditedToCase === 0 ? "This need was no longer accepting support when your payment cleared." : "Part of your gift met the remaining need. The excess is held while you choose.",
          "", "Your three choices:", `- Refund the excess - ${formatGhs(gift.amountExcess)}`,
          "- Redirect to our general fund", "- Redirect to another eligible case", "",
          `${trustedOrigin()}/give/support-a-future/refund/${payload.token}`, "",
          `If you do nothing, we'll refund the excess after ${token.expiresAt.toISOString().slice(0, 10)} (UTC).`,
          "Automatic refund requests run daily. Bank or provider processing can take additional time.",
          "Keep this private, single-use link secure. It expires at the end of the 14-day choice period.");
      } else if (row.template === "redirect_completed") {
        subject = "Your excess redirect is confirmed";
        lines.push(row.resolution?.consentText ?? "Your authorized excess redirect is complete.");
      } else if (row.template === "refund_completed" || gift.refundStatus === "refunded") {
        subject = "Your excess refund has been processed";
        lines.push(`The payment provider has confirmed processing the excess refund of ${formatGhs(gift.amountExcess)}.`,
          "Your bank or Mobile Money provider may take additional time to show the credit.");
      } else if (row.template === "refund_requested") {
        subject = "Your excess refund request is recorded";
        lines.push(`We have recorded your request to refund the excess of ${formatGhs(gift.amountExcess)}.`,
          "This is not confirmation that funds have returned. We will email you after the provider confirms processing.");
      } else {
        lines.push("The choice period has ended. Your unallocated excess is due for automatic refund.",
          "Requests run daily. We will email you after provider-confirmed processing.");
      }
      lines.push("", "FTF administers all support and communications. For help, use the contact details on our website.");
      if (!gift.donorEmail) throw new Error("Recipient unavailable");
      await (options.send ?? sendSupportMessage)({ to: gift.donorEmail, subject, text: lines.join("\n") });
      await prisma.notificationOutbox.updateMany({ where: { id: row.id, leaseToken, state: "sending" }, data: {
        state: "sent", sentAt: new Date(), payloadEncrypted: null, leaseToken: null, leaseUntil: null, lastError: null,
      } });
      counts.sent++;
    } catch {
      await prisma.notificationOutbox.updateMany({ where: { id: row.id, leaseToken, state: "sending" }, data: {
        state: "pending", lastError: "notification_delivery_failed", leaseToken: null, leaseUntil: null,
        nextAttemptAt: new Date(Date.now() + Math.min(24 * 60, 5 * 2 ** Math.min(row.attempts, 8)) * 60_000),
      } });
      counts.failed++;
    }
  }
  return counts;
}

export async function sendFinanceAlert(summary: { overdue: number; attention: number; failedNotifications: number; missedRun: boolean; financialHolds: number; quarantinedPayments: number }) {
  if (!summary.overdue && !summary.attention && !summary.failedNotifications && !summary.missedRun && !summary.financialHolds && !summary.quarantinedPayments) return;
  const to = process.env.SUPPORT_FINANCE_ALERT_EMAIL;
  if (!to) throw new Error("Finance alert recipient unavailable");
  await sendSupportMessage({ to, subject: "Support a Future: finance action required",
    text: `Overdue unresolved gifts: ${summary.overdue}\nOperations needing attention: ${summary.attention}\nFinancial holds: ${summary.financialHolds}\nQuarantined payments: ${summary.quarantinedPayments}\nFailed notification deliveries: ${summary.failedNotifications}\nMissed daily run: ${summary.missedRun ? "yes" : "no"}\nReview the restricted admin refund queue. No donor choices may be changed without consent.` });
}
