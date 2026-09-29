import { NextRequest } from "next/server";
import { z } from "zod";
import { verifyPaymentReceipt } from "@/lib/support-a-future/payments";
import { readSupportJson, supportJson } from "@/lib/support-a-future/http";
import { SupportError } from "@/lib/support-a-future/domain";
import { rateLimit } from "@/lib/support-a-future/security";

const requestSchema = z.object({ reference: z.string().regex(/^[A-Za-z0-9._=-]{8,100}$/) }).strict();

export async function POST(request: NextRequest) {
  try {
    const parsed = requestSchema.safeParse(await readSupportJson(request));
    if (!parsed.success) return supportJson({ error: "A valid transaction reference is required." }, 400);
    await rateLimit("payment-receipt", parsed.data.reference, 30);
    return supportJson(await verifyPaymentReceipt(parsed.data.reference));
  } catch (error) {
    // Provider errors and private references must not enter client responses or logs.
    return supportJson({ error: error instanceof SupportError ? error.message : "Payment verification is unavailable. Please try again." },
      error instanceof SupportError ? error.status : 503);
  }
}
