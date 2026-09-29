import Button from "@/components/ui/Button";
import { getRefundQueue } from "@/lib/support-a-future/refund-admin";
import { formatGhs } from "@/lib/support-a-future/domain";
import { LedgerExport } from "./RefundActions";

export const dynamic = "force-dynamic";
export default async function RefundQueuePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  try {
    const raw = await searchParams;
    const result = await getRefundQueue(Object.fromEntries(["status", "page"].flatMap((key) => typeof raw[key] === "string" && raw[key] ? [[key, raw[key]]] : [])));
    const pageHref = (page: number) => `/admin/refunds?${new URLSearchParams({ status: result.status, page: String(page) })}`;
    const now = Date.now();
    return <div className="space-y-8">
      <header><h1 className="font-[family-name:var(--font-display)] text-3xl text-text-primary">Excess-resolution queue</h1><p className="mt-3 max-w-[620px] text-text-secondary">Keep valid case allocations intact. Resolve only unallocated excess, with donor consent for every redirect and provider confirmation for every completed refund.</p></header>
      <form method="get" className="flex flex-wrap items-end gap-4">
        <label className="text-text-secondary">Queue<select name="status" defaultValue={result.status} className="mt-2 block min-h-12 rounded-xl border border-border-strong bg-surface px-4 text-text-primary">
          {[["pending", "Pending"], ["overdue", "Overdue unresolved"], ["attention", "Provider attention"], ["audited", "Audited / escalated"], ["refunded", "Refunded excess"], ["donor_redirected", "Donor redirected"], ["all", "All excess and held records"]].map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select></label>
        <Button type="submit" variant="outline" className="min-h-12 hover:scale-100">Apply filter</Button>
      </form>
      <p className="rounded-xl bg-info-bg p-4 text-info-text">Daily requests run after the 14-day choice deadline. Overdue does not mean refunded. Audited balances remain liabilities until settlement.</p>
      {result.records.length ? <div role="region" aria-label="Excess-resolution table" tabIndex={0} className="overflow-x-auto rounded-2xl border border-border bg-surface">
        <table className="w-full text-left text-sm">
          <caption className="p-4 text-left text-text-secondary">Page {result.page} · {result.records.length} records shown. Donor email is masked until an authorized detail view.</caption>
          <thead className="border-y border-border bg-bg-tertiary"><tr>{["Donor / record", "Original case", "Gift / credited", "Original excess", "Resolution", "Choice deadline (UTC)"].map((text) => <th key={text} scope="col" className="p-4 font-semibold text-text-secondary">{text}</th>)}</tr></thead>
          <tbody>{result.records.map((item) => {
            const unresolved = ["pending", "audited"].includes(item.refundStatus ?? "");
            const hours = item.refundDueAt ? (item.refundDueAt.getTime() - now) / 3600000 : null;
            return <tr key={item.id} className="border-b border-border last:border-0 hover:bg-surface-hover">
              <th scope="row" className="p-4 font-normal"><a href={`/admin/refunds/${item.id}`} className="inline-flex min-h-11 flex-col justify-center text-text-link underline"><span>{item.maskedDonor}</span><span className="text-xs">Open record {item.id.slice(-6)}</span></a></th>
              <td className="p-4 text-text-secondary">{item.beneficiaryCase?.publicId ?? "Unavailable"}</td>
              <td className="p-4 tabular-nums text-text-primary">{formatGhs(item.amount)}<span className="block text-text-secondary">{formatGhs(item.amountCreditedToCase)} credited</span></td>
              <td className="p-4 tabular-nums text-text-primary">{formatGhs(item.amountExcess)}</td>
              <td className="p-4 text-text-secondary">{item.financialHoldAt && <strong className="block text-warning-text">Financial hold - movement paused</strong>}{item.refundStatus || "No excess liability"}<span className="block">{item.excessResolution ? `${item.excessResolution.choice} · ${item.excessResolution.state}` : item.amountExcess ? "No accepted instruction" : "Provider exception only"}</span></td>
              <td className="p-4 text-text-secondary">{item.refundDueAt?.toLocaleString("en-GB", { timeZone: "UTC", dateStyle: "medium", timeStyle: "short" }) ?? "Not recorded"}
                {unresolved && hours !== null && <span className={`block ${hours <= 0 ? "text-warning-text" : ""}`}>{hours <= 0 ? `${Math.ceil(-hours)} hours overdue` : `${Math.ceil(hours / 24)} days remaining`}</span>}</td>
            </tr>;
          })}</tbody>
        </table>
      </div> : <section className="rounded-2xl border border-dashed border-border p-8"><h2 className="font-[family-name:var(--font-display)] text-2xl text-text-primary">No records match this filter</h2><p className="mt-3 text-text-secondary">Choose another queue or return to the first page. This is not a provider-balance reconciliation.</p></section>}
      <section className="space-y-4 rounded-2xl border border-border bg-surface p-6" aria-labelledby="quarantine-heading">
        <h2 id="quarantine-heading" className="font-[family-name:var(--font-display)] text-2xl text-text-primary">Quarantined payments</h2>
        <p className="max-w-[620px] text-text-secondary">These payment intents need finance investigation before allocation. The amounts are expected payments, not verified retained giving. Do not refund or allocate them through the excess controls. This list is independent of the excess-status filter.</p>
        <p className="text-sm text-text-secondary">Page {result.page} · {result.quarantined.length} quarantined intents shown, up to 20 per page.</p>
        {result.quarantined.length ? <ul className="divide-y divide-border">{result.quarantined.map((item) => <li key={item.id} className="space-y-2 py-4 text-text-secondary">
          <p className="break-all font-semibold text-text-primary">{item.reference}</p>
          <p className="tabular-nums">Expected: {formatGhs(item.amount)} · {item.createdAt.toLocaleString("en-GB", { timeZone: "UTC", dateStyle: "medium", timeStyle: "short" })} UTC</p>
          <p className="break-all text-sm">Intent: {item.id}</p>
        </li>)}</ul> : <p className="text-text-secondary">No quarantined intents on this page. This does not confirm provider reconciliation.</p>}
      </section>
      <nav aria-label="Refund queue pages" className="flex flex-wrap gap-4">{result.page > 1 && <Button href={pageHref(result.page - 1)} variant="outline">Previous page</Button>}{result.hasMore && <Button href={pageHref(result.page + 1)} variant="outline">Next page</Button>}</nav>
      <LedgerExport />
    </div>;
  } catch {
    return <section role="alert" className="space-y-4"><h1 className="font-[family-name:var(--font-display)] text-3xl text-text-primary">Refund queue unavailable</h1><p className="text-text-secondary">Access, filters, or financial records could not be verified. No balances are shown.</p><a href="/admin/refunds" className="inline-flex min-h-11 items-center text-text-link underline">Reload the queue</a></section>;
  }
}
