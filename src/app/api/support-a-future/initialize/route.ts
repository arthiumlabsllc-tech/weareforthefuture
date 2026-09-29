import { NextRequest } from "next/server";
import { initializeCasePayment } from "@/lib/support-a-future/payments";
import { initializeCaseSchema } from "@/lib/support-a-future/domain";
import { rateLimit, requireSameOrigin } from "@/lib/support-a-future/security";
import { readSupportJson, supportError, supportJson } from "@/lib/support-a-future/http";

export async function POST(request: NextRequest) {
  try {
    requireSameOrigin(request.headers);
    await rateLimit("initialize-ip", request.headers.get("x-vercel-forwarded-for") ?? "local", 30);
    const input = initializeCaseSchema.parse(await readSupportJson(request));
    await rateLimit("initialize-email", input.email, 10);
    return supportJson({ success: true, ...await initializeCasePayment(input) });
  } catch (error) { return supportError(error); }
}
