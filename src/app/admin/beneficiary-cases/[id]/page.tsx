import { BookOpen, ShieldCheck } from "lucide-react";
import { caseDraftFromRecord, getAdminCase, getAdminCaseOptions } from "@/lib/support-a-future/case-workflow";
import { getPublicCase } from "@/lib/support-a-future/cases";
import { requireSupportAdmin } from "@/lib/support-a-future/security";
import { hasPermission } from "@/lib/admin-rbac";
import { formatGhs } from "@/lib/support-a-future/domain";
import { cardClasses, cardPadding } from "@/lib/ui/cardClasses";
import CaseEditor from "../CaseEditor";

export const dynamic = "force-dynamic";
const timestamp = (value: Date | null) => value ? value.toLocaleString("en-GB", { timeZone: "UTC", dateStyle: "medium", timeStyle: "short" }) + " UTC" : "Not recorded";

export default async function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  try {
    const actor = await requireSupportAdmin("cases.view");
    const { id } = await params;
    const [{ record, history, preview }, options] = await Promise.all([getAdminCase(id), getAdminCaseOptions()]);
    const visible = await getPublicCase(record.publicId);
    const independent = record.createdBy !== actor.userId && record.updatedBy !== actor.userId;
    const permissions = {
      edit: hasPermission(actor, "cases.edit"),
      review: hasPermission(actor, "cases.review") && independent,
      publish: hasPermission(actor, "cases.publish"),
      withdraw: ["SUPER_ADMIN", "ADMIN", "SAFEGUARDING_OFFICER"].includes(actor.role),
    };
    return <div className="space-y-8">
      <header>
        <a href="/admin/beneficiary-cases" className="inline-flex min-h-11 items-center text-text-link underline">Back to cases</a>
        <p className="mt-4 text-sm text-text-secondary">{record.publicId}</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl text-text-primary">Case workspace</h1>
        <p className="mt-3 max-w-[620px] text-text-secondary">Review the saved public content and restricted consent evidence separately. Changes are never approved or published automatically.</p>
      </header>
      <section aria-labelledby="saved-revision" className={`${cardClasses} ${cardPadding.compact}`}>
        <h2 id="saved-revision" className="flex items-center gap-3 font-[family-name:var(--font-display)] text-2xl text-text-primary"><ShieldCheck aria-hidden="true" className="h-6 w-6 shrink-0 text-accent-text" />Saved revision {record.revision}</h2>
        <dl className="mt-4 grid gap-4 text-text-secondary sm:grid-cols-2 xl:grid-cols-4">
          <div><dt>Review</dt><dd className="font-semibold text-text-primary">{record.reviewStatus}</dd></div>
          <div><dt>Lifecycle</dt><dd className="font-semibold text-text-primary">{record.status}</dd></div>
          <div><dt>Public access now</dt><dd className="font-semibold text-text-primary">{visible ? visible.fundable ? "Visible, accepting support" : "Visible, support closed" : "Unavailable to the public"}</dd></div>
          <div><dt>Approved revision</dt><dd className="tabular-nums font-semibold text-text-primary">{record.approvedRevision ?? "None"}</dd></div>
        </dl>
        <p className="mt-4 text-sm text-text-secondary">Approval recorded: {timestamp(record.safeguardingApprovedAt)}. These are current server records, not an unsaved preview.</p>
        {!independent && hasPermission(actor, "cases.review") && <p className="mt-3 text-warning-text">You authored this case or its latest content revision. A different reviewer must approve or return it.</p>}
      </section>
      <div className="grid items-start gap-8 xl:grid-cols-2">
        <section aria-labelledby="case-preview" className={`${cardClasses} ${cardPadding.compact} min-w-0 space-y-4`}>
          <h2 id="case-preview" className="font-[family-name:var(--font-display)] text-2xl text-text-primary">Saved public-content preview</h2>
          <p className="text-sm text-text-secondary">Private preview only. Publication eligibility is checked separately.</p>
          <BookOpen aria-hidden="true" className="h-12 w-12 text-accent-text" />
          <h3 className="font-[family-name:var(--font-display)] text-2xl text-text-primary">{preview.displayName}</h3>
          <p className="text-text-secondary">{preview.age !== null ? `Age ${preview.age} · ` : ""}{preview.region} · {preview.needType}</p>
          <p className="whitespace-pre-wrap break-words text-text-secondary">{preview.needDescription}</p>
          <h3 className="font-semibold text-text-primary">Short story</h3>
          <p className="whitespace-pre-wrap break-words text-text-secondary">{preview.storyShort}</p>
          <h3 className="font-semibold text-text-primary">Full story</h3>
          <p className="whitespace-pre-wrap break-words text-text-secondary">{preview.storyFull}</p>
          <p className="text-sm text-text-secondary">Non-photo illustration fallback. This preview exposes no consent documents.</p>
        </section>
        <section aria-labelledby="saved-consent" className={`${cardClasses} ${cardPadding.compact} min-w-0 space-y-4`}>
          <h2 id="saved-consent" className="font-[family-name:var(--font-display)] text-2xl text-text-primary">Restricted consent evidence</h2>
          <p className="text-text-secondary">Inspect the original evidence in FTF’s restricted store before approval. A reference alone does not establish permission to publish.</p>
          <dl className="space-y-4 text-text-secondary">
            <div><dt>Evidence reference</dt><dd className="break-all font-medium text-text-primary">{record.consentEvidenceRef ?? "Missing"}</dd></div>
            <div><dt>Consent declared</dt><dd>{record.consentGiven ? "Yes" : "No"}</dd></div>
            <div><dt>Obtained</dt><dd>{timestamp(record.consentRecordedAt)}</dd></div>
            <div><dt>Expires</dt><dd>{record.consentExpiresAt ? timestamp(record.consentExpiresAt) : "No expiry recorded"}</dd></div>
            <div><dt>Withdrawn</dt><dd>{record.consentRevokedAt ? timestamp(record.consentRevokedAt) : "No withdrawal recorded"}</dd></div>
          </dl>
          <p className="border-t border-border pt-4 text-sm text-text-secondary">Never copy evidence into the public story, a public media upload, or workflow reasons. Already viewed copies cannot be recalled.</p>
        </section>
      </div>
      <section aria-labelledby="case-accounting" className="rounded-2xl border border-border bg-surface p-6">
        <h2 id="case-accounting" className="font-[family-name:var(--font-display)] text-2xl text-text-primary">Read-only accounting</h2>
        <dl className="mt-4 grid gap-6 text-text-secondary sm:grid-cols-3">
          <div><dt>Credited to this case</dt><dd className="text-xl tabular-nums text-text-primary">{formatGhs(record.amountRaised)}</dd></div>
          <div><dt>Approved target</dt><dd className="text-xl tabular-nums text-text-primary">{formatGhs(record.amountNeeded)}</dd></div>
          <div><dt>Lifetime original excess</dt><dd className="text-xl tabular-nums text-text-primary">{formatGhs(record.amountOversubscribed)}</dd></div>
        </dl>
        <p className="mt-4 text-sm text-text-secondary">Lifetime excess is not the currently held balance. Refunds and redirects never change the original credited allocation.</p>
        {hasPermission(actor, "refunds.view") && <a href="/admin/refunds" className="mt-3 inline-flex min-h-11 items-center text-text-link underline">Open excess-resolution queue</a>}
      </section>
      <CaseEditor key={`${record.id}:${record.revision}`} initial={caseDraftFromRecord(record)} options={options} permissions={permissions}
        record={{ id: record.id, revision: record.revision, reviewStatus: record.reviewStatus, status: record.status, amountRaised: record.amountRaised, funded: !!record.fundedAt && record.amountRaised === record.amountNeeded }} />
      <section aria-labelledby="case-audit" className="space-y-4">
        <h2 id="case-audit" className="font-[family-name:var(--font-display)] text-2xl text-text-primary">Editorial audit timeline</h2>
        <p className="text-sm text-text-secondary">Most recent {history.length} entries, up to 100. Private evidence is not copied into audit snapshots.</p>
        <ol className="divide-y divide-border rounded-2xl border border-border bg-surface px-6">
          {history.map((entry) => {
            const after = entry.after && typeof entry.after === "object" && !Array.isArray(entry.after) ? entry.after : {};
            return <li key={entry.id} className="space-y-2 py-5 text-text-secondary">
              <p className="font-semibold text-text-primary">{entry.action}{typeof after.revision === "number" ? ` · revision ${after.revision}` : ""}</p>
              <p className="text-sm"><time dateTime={entry.createdAt.toISOString()}>{timestamp(entry.createdAt)}</time> · {entry.createdBy?.name || entry.createdById || "System"}</p>
              {typeof after.reason === "string" && <p className="whitespace-pre-wrap break-words">{after.reason}</p>}
            </li>;
          })}
        </ol>
        {!history.length && <p className="text-text-secondary">No editorial actions have been recorded.</p>}
      </section>
    </div>;
  } catch {
    return <section role="alert" className="space-y-4">
      <h1 className="font-[family-name:var(--font-display)] text-3xl text-text-primary">Case unavailable</h1>
      <p className="text-text-secondary">The saved case or your access could not be verified. No case information is shown.</p>
      <a href="/admin/beneficiary-cases" className="inline-flex min-h-11 items-center text-text-link underline">Return to cases</a>
    </section>;
  }
}
