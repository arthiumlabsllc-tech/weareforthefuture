import { NextRequest } from "next/server";
import { verifyCronAuthorization } from "@/lib/support-a-future/security";
import { supportError, supportJson } from "@/lib/support-a-future/http";
import { runRefundSweep } from "@/lib/support-a-future/sweep";

export const dynamic = "force-dynamic";
export const maxDuration = 300;
export async function GET(request: NextRequest) {
  try {
    if (process.env.VERCEL_ENV !== "production" || !verifyCronAuthorization(request.headers.get("authorization"))) {
      return supportJson({ error: "Not authorized" }, 401);
    }
    return supportJson(await runRefundSweep());
  } catch (error) { return supportError(error); }
}
