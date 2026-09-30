import { exportExcessLedger } from "@/lib/support-a-future/refund-admin";
import { privateHeaders, supportError } from "@/lib/support-a-future/http";
import { requireSameOrigin } from "@/lib/support-a-future/security";
import { z } from "zod";

export const dynamic = "force-dynamic";

const exportSchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
}).strict();

export async function POST(request: Request) {
  try {
    requireSameOrigin(request.headers);
    const body = exportSchema.parse(await request.json().catch(() => ({})));
    const csv = await exportExcessLedger(body);
    return new Response(csv, {
      headers: {
        ...privateHeaders,
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": "attachment; filename=ftf-excess-ledger.csv",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) { return supportError(error); }
}
