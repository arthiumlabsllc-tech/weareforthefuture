import { getRefundQueue, exportExcessLedger } from "@/lib/support-a-future/refund-admin";
import { privateHeaders, supportError, supportJson } from "@/lib/support-a-future/http";

export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  try {
    const query = Object.fromEntries(new URL(request.url).searchParams);
    if (query.export === "ledger") {
      const { export: _format, ...range } = query;
      const csv = await exportExcessLedger(range);
      return new Response(csv, { headers: { ...privateHeaders, "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": "attachment; filename=ftf-excess-ledger.csv", "X-Content-Type-Options": "nosniff" } });
    }
    return supportJson(await getRefundQueue(query));
  } catch (error) { return supportError(error); }
}
