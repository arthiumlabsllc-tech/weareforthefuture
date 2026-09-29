import { getAdminCaseOptions, getAdminCasePage } from "@/lib/support-a-future/case-workflow";
import { requireSupportAdmin } from "@/lib/support-a-future/security";
import { hasPermission } from "@/lib/admin-rbac";
import { formatGhs } from "@/lib/support-a-future/domain";
import Button from "@/components/ui/Button";
import { ClipboardCheck } from "lucide-react";

export const dynamic = "force-dynamic";
const control = "mt-2 min-h-12 w-full rounded-xl border border-border-strong bg-surface px-3 text-text-primary";
export default async function AdminCasesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  try {
    const raw = await searchParams;
    const query = Object.fromEntries(["status", "consent", "pillarId", "programId", "page"].flatMap((key) => typeof raw[key] === "string" && raw[key] ? [[key, raw[key]]] : []));
    const [actor, result, options] = await Promise.all([requireSupportAdmin("cases.view"), getAdminCasePage(query), getAdminCaseOptions()]);
    const pageHref = (page: number) => `/admin/beneficiary-cases?${new URLSearchParams({ ...query, page: String(page) })}`;
    return <div className="space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div><h1 className="font-[family-name:var(--font-display)] text-3xl text-text-primary">Beneficiary cases</h1><p className="mt-2 max-w-[620px] text-text-secondary">Private drafts, independent safeguarding review, and current publication status. Financial totals are read-only.</p></div>
        {hasPermission(actor, "cases.edit") && <Button href="/admin/beneficiary-cases/new" className="min-h-12 hover:scale-100">Create private draft</Button>}
      </header>
      <p className="flex items-start gap-3 rounded-xl border border-border bg-surface p-4 text-text-secondary"><ClipboardCheck aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-accent-text" /><span>Draft → independent review → publication. Any content or consent edit invalidates the approved revision.</span></p>
      <form method="get" className="grid items-end gap-4 rounded-2xl border border-border bg-surface p-6 sm:grid-cols-2 xl:grid-cols-5">
        <label className="text-sm text-text-secondary">Workflow / status<select name="status" defaultValue={query.status ?? ""} className={control}><option value="">All cases</option>{["draft", "submitted", "active", "funded", "closed", "archived"].map((value) => <option key={value} value={value}>{value === "submitted" ? "Awaiting review" : value[0].toUpperCase() + value.slice(1)}</option>)}</select></label>
        <label className="text-sm text-text-secondary">Consent<select name="consent" defaultValue={query.consent ?? ""} className={control}><option value="">Any consent state</option><option value="valid">Currently valid</option><option value="missing">Missing or invalid</option><option value="expired">Expired</option><option value="expiring">Expires within 14 days</option></select></label>
        <label className="text-sm text-text-secondary">Pillar<select name="pillarId" defaultValue={query.pillarId ?? ""} className={control}><option value="">All pillars</option>{options.pillars.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label>
        <label className="text-sm text-text-secondary">Programme<select name="programId" defaultValue={query.programId ?? ""} className={control}><option value="">All programmes</option>{options.programs.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        <Button type="submit" variant="outline" className="min-h-12 hover:scale-100">Apply filters</Button>
        <a href="/admin/beneficiary-cases" className="inline-flex min-h-11 items-center text-sm text-text-link underline">Reset filters</a>
      </form>
      {result.records.length ? <div className="overflow-x-auto rounded-2xl border border-border bg-surface" role="region" aria-label="Case workflow table" tabIndex={0}>
        <table className="w-full text-left text-sm"><caption className="p-4 text-left text-text-secondary">Page {result.page} · {result.records.length} cases shown</caption>
          <thead className="border-y border-border bg-bg-tertiary text-text-secondary"><tr>{["Case", "Workflow", "Consent", "Credited / target", "Revision"].map((label) => <th key={label} scope="col" className="p-4 font-semibold">{label}</th>)}</tr></thead>
          <tbody>{result.records.map((item) => <tr key={item.id} className="border-b border-border last:border-0 hover:bg-surface-hover">
            <th scope="row" className="p-4 font-normal"><a href={`/admin/beneficiary-cases/${item.id}`} className="inline-flex min-h-11 flex-col justify-center text-text-link underline"><span>{item.firstName || "Anonymous learner"}</span><span className="whitespace-nowrap text-xs">{item.publicId}</span></a></th>
            <td className="p-4 text-text-secondary">{item.reviewStatus}<br />{item.status}</td>
            <td className="p-4 text-text-secondary">{item.consentRevokedAt ? "Withdrawn" : !item.consentGiven ? "Missing" : item.consentExpiresAt && item.consentExpiresAt <= new Date() ? "Expired" : "Recorded"}{item.consentExpiresAt && <span className="block text-xs">Expires {item.consentExpiresAt.toLocaleDateString("en-GB", { timeZone: "UTC" })}</span>}</td>
            <td className="p-4 tabular-nums text-text-primary">{formatGhs(item.amountRaised)}<span className="block text-text-secondary">of {formatGhs(item.amountNeeded)}</span></td>
            <td className="p-4 tabular-nums text-text-secondary">{item.revision}{item.approvedRevision === item.revision ? " · approved" : " · review required"}</td>
          </tr>)}</tbody>
        </table>
      </div> : <section className="rounded-2xl border border-dashed border-border p-8"><h2 className="font-[family-name:var(--font-display)] text-2xl text-text-primary">No matching cases</h2><p className="mt-2 text-text-secondary">Adjust your filters, return to the first page, or create a private draft if you have editing permission.</p></section>}
      <nav aria-label="Case pages" className="flex flex-wrap gap-4">{result.page > 1 && <Button href={pageHref(result.page - 1)} variant="outline">Previous page</Button>}{result.hasMore && <Button href={pageHref(result.page + 1)} variant="outline">Next page</Button>}</nav>
    </div>;
  } catch {
    return <section role="alert" className="space-y-4"><h1 className="font-[family-name:var(--font-display)] text-3xl text-text-primary">Cases could not be loaded</h1><p className="text-text-secondary">Your access or filters could not be verified. No case data is shown. Reload or reset the filters.</p><a href="/admin/beneficiary-cases" className="inline-flex min-h-11 items-center text-text-link underline">Reload case list</a></section>;
  }
}
