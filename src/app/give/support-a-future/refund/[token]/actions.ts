"use server";

import { headers } from "next/headers";
import { after } from "next/server";
import { z } from "zod";
import { acceptDonorChoice, getChoiceContext, getChoiceTargets, resolutionSummary } from "@/lib/support-a-future/resolutions";
import { requireSameOrigin } from "@/lib/support-a-future/security";
import { dispatchNotifications } from "@/lib/support-a-future/notifications";
import { processRefund } from "@/lib/support-a-future/refunds";
import { SupportError } from "@/lib/support-a-future/domain";

function safeFailure(error: unknown) {
  return { ok: false as const, error: error instanceof SupportError ? error.message : error instanceof z.ZodError
    ? "Choose an option and confirm your instruction." : "This service is temporarily unavailable. Please try again.",
    unavailable: error instanceof SupportError && error.code === "invalid_link",
    financialHold: error instanceof SupportError && error.code === "financial_hold" };
}

export async function refreshChoice(token: string) {
  try {
    requireSameOrigin(await headers());
    return { ok: true as const, context: await getChoiceContext(token) };
  } catch (error) { return safeFailure(error); }
}

export async function loadChoiceTargets(token: string, cursor?: string | null) {
  try {
    requireSameOrigin(await headers());
    return { ok: true as const, ...await getChoiceTargets(token, cursor) };
  } catch (error) { return safeFailure(error); }
}

export async function submitChoice(token: string, input: unknown) {
  try {
    requireSameOrigin(await headers());
    const operation = await acceptDonorChoice(token, input);
    after(async () => {
      try { if (operation.choice === "refund") await processRefund(operation.id); } catch { /* Durable reconciliation retries through cron. */ }
      try { await dispatchNotifications({ donationId: operation.donationId }); } catch { /* Durable outbox retries through cron. */ }
    });
    return { ok: true as const, resolution: resolutionSummary(operation) };
  } catch (error) { return safeFailure(error); }
}
