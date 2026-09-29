import { after } from "next/server";
import { z } from "zod";
import { actOnRefund, continueAdminRefund, getAdminRedirectTargets, getRefundDetail } from "@/lib/support-a-future/refund-admin";
import { readSupportJson, supportError, supportJson } from "@/lib/support-a-future/http";
import { requireSameOrigin } from "@/lib/support-a-future/security";

type Context = { params: Promise<{ id: string }> };
export const dynamic = "force-dynamic";
export const maxDuration = 60;
export async function GET(request: Request, { params }: Context) {
  try {
    const query = z.object({ view: z.literal("targets").optional(), cursor: z.string().max(400).optional() }).strict().parse(Object.fromEntries(new URL(request.url).searchParams));
    const { id } = await params;
    return supportJson(query.view === "targets" ? await getAdminRedirectTargets(id, query.cursor) : await getRefundDetail(id));
  } catch (error) { return supportError(error); }
}
export async function POST(request: Request, { params }: Context) {
  try {
    requireSameOrigin(request.headers);
    const { id } = await params;
    const result = await actOnRefund(id, await readSupportJson(request));
    after(async () => {
      try { await continueAdminRefund(id, result.operationId, result.process); }
      catch { /* Durable financial operations and outbox remain retryable by the sweep. */ }
    });
    return supportJson({ message: result.message });
  } catch (error) { return supportError(error); }
}
