import { getRefundDetail } from "@/lib/support-a-future/refund-admin";
import { requireSupportAdmin } from "@/lib/support-a-future/security";
import { hasPermission } from "@/lib/admin-rbac";
import { formatGhs } from "@/lib/support-a-future/domain";
import RefundActions from "../RefundActions";

export const dynamic = "force-dynamic";
const timestamp = (value: Date | null) => value ? value.toLocaleString("en-GB", { timeZone: "UTC", dateStyle: "medium", timeStyle: "short" }) + " UTC" : "Not recorded";
const section = "min-w-0 space-y-4 rounded-2xl border border-border bg-surface p-6";
const heading = "font-[family-name:var(--font-display)] text-2xl text-text-primary";

export default async function RefundDetailPage({ params }: { params: Promise<{ id: string }> }) {
  try {
    const actor = await requireSupportAdmin("refunds.view");
    const { id } = await params;
    const { donation: gift, held, history } = await getRefundDetail(id);
    const operation = gift.excessResolution;
    const refunded = gift.ledgerEntries.filter((entry) => entry.kind === "refund_excess").reduce((sum, entry) => sum + entry.amount, 0);
    const redirected = gift.ledgerEntries.filter((entry) => entry.kind.startsWith("redirect_")).reduce((sum, entry) => sum + entry.amount, 0);
    return <div className="space-y-8">
      <header>
        <a href="/admin/refunds" className="inline-flex min-h-11 items-center text-text-link underline">Back to refund queue</a>
        <h1 className="mt-4 font-[family-name:var(--font-display)] text-3xl text-text-primary">Excess-resolution record</h1>
        <p className="mt-3 break-all text-sm text-text-secondary">{gift.id}</p>
      </header>
      {gift.financialHoldAt && <section className="space-y-3 rounded-2xl border border-warning/30 bg-warning-bg p-6 text-warning-text">
        <h2 className={heading}>Financial hold - automated movement paused</h2>
        <p>Recorded {timestamp(gift.financialHoldAt)} · {gift.financialHoldReason}</p>
        <p>A provider exception needs separately governed finance reconciliation. The original allocation, accepted instruction, and ledger below are unchanged accounting history, not a reconciled provider balance.</p>
        <p>Escalation records the investigation only. It does not clear this hold, reopen a completed decision, or authorize another transfer.</p>
      </section>}
      <section className={section}>
        <h2 className={heading}>Original allocation stays intact</h2>
        <dl className="grid gap-6 text-text-secondary sm:grid-cols-3">
          {[["Original gift", gift.amount], ["Original case credit", gift.amountCreditedToCase], ["Original excess", gift.amountExcess], ["Held excess in ledger", held], ["Provider-confirmed refund", refunded], ["Consented redirects", redirected]].map(([label, amount]) => <div key={label}><dt>{label}</dt><dd className="text-xl tabular-nums text-text-primary">{formatGhs(Number(amount))}</dd></div>)}
        </dl>
        <p className="text-sm text-text-secondary">A requested refund is not a completed refund. Held excess remains a liability, including after escalation.</p>
      </section>
      <div className="grid items-start gap-8 xl:grid-cols-2">
        <section className={section}>
          <h2 className={heading}>Restricted payment details</h2>
          <dl className="space-y-3 text-text-secondary">
            <div><dt>Donor</dt><dd className="break-words text-text-primary">{gift.donorName || "Name not recorded"}</dd></div>
            <div><dt>Email</dt><dd className="break-all text-text-primary">{gift.donorEmail || "Not recorded"}</dd></div>
            <div><dt>Payment reference</dt><dd className="break-all">{gift.paymentReference}</dd></div>
            <div><dt>Verified payment time</dt><dd>{timestamp(gift.paidAt)}</dd></div>
            <div><dt>Original case</dt><dd>{gift.beneficiaryCase ? <a href={`/admin/beneficiary-cases/${gift.beneficiaryCase.id}`} className="inline-flex min-h-11 items-center text-text-link underline">{gift.beneficiaryCase.publicId}</a> : "Unavailable"}</dd></div>
            <div><dt>Choice deadline</dt><dd>{timestamp(gift.refundDueAt)}</dd></div>
            <div><dt>Payment / excess status</dt><dd>{gift.paymentStatus} / {gift.refundStatus}</dd></div>
            <div><dt>Last escalation</dt><dd>{timestamp(gift.refundAuditedAt)}</dd></div>
          </dl>
          {gift.refundNotes && <p className="whitespace-pre-wrap break-words text-text-secondary">{gift.refundNotes}</p>}
        </section>
        <section className={section}>
          <h2 className={heading}>Accepted instruction and provider progress</h2>
          {operation ? <>
            <dl className="space-y-3 text-text-secondary">
              <div><dt>Choice / operation state</dt><dd className="font-semibold text-text-primary">{operation.choice} / {operation.state}</dd></div>
              <div><dt>Operation</dt><dd className="break-all">{operation.id}</dd></div>
              <div><dt>Recorded by</dt><dd className="break-all">{operation.actorType}{operation.actorId ? ` · ${operation.actorId}` : ""}</dd></div>
              <div><dt>Consent timestamp</dt><dd>{timestamp(operation.consentAt)}</dd></div>
              <div><dt>Consent evidence</dt><dd className="break-all">{operation.consentEvidenceRef || (operation.actorType === "donor" ? "Single-use authenticated choice" : operation.actorType === "system" ? "Disclosed automatic-refund policy" : "Authorized staff excess-refund instruction; see audit reason")}</dd></div>
              <div><dt>Provider refund ID</dt><dd>{operation.providerId || "Not yet assigned"}</dd></div>
              <div><dt>Provider submission recorded</dt><dd>{timestamp(operation.submittedAt)}</dd></div>
              <div><dt>Completed</dt><dd>{timestamp(operation.completedAt)}</dd></div>
              <div><dt>Attempts / next check</dt><dd>{operation.attempts} / {timestamp(operation.nextAttemptAt)}</dd></div>
              {operation.lastError && <div><dt>Attention category</dt><dd className="text-warning-text">{operation.lastError}</dd></div>}
            </dl>
            <blockquote className="whitespace-pre-wrap break-words border-l-2 border-border-strong pl-4 text-text-secondary">{operation.consentText}</blockquote>
          </> : <p className="text-text-secondary">{gift.amountExcess ? "No resolution is accepted. The entire excess remains in the held ledger. Any financial hold must be reconciled before provider submission." : "This payment has no original excess. Its provider exception cannot be resolved through excess-refund actions."}</p>}
          <a href={`/admin/refunds/${id}`} className="inline-flex min-h-11 items-center text-text-link underline">Refresh current status</a>
        </section>
      </div>
      <RefundActions id={id} excess={gift.amountExcess} financialHold={!!gift.financialHoldAt} paidAt={gift.paidAt?.toISOString() ?? null} deadline={gift.refundDueAt?.toISOString() ?? null} operation={operation ? { choice: operation.choice, state: operation.state } : null} canManage={hasPermission(actor, "refunds.manage")} />
      <section className={section}>
        <h2 className={heading}>Append-only financial movements</h2>
        <ul className="divide-y divide-border">{gift.ledgerEntries.map((entry) => <li key={entry.id} className="space-y-2 py-4 text-text-secondary"><p className="font-semibold text-text-primary">{entry.kind} · {formatGhs(entry.amount)}</p><p>{timestamp(entry.createdAt)}{entry.beneficiaryCase ? ` · ${entry.beneficiaryCase.publicId}` : ""}</p><p className="break-all text-xs">{entry.id}</p></li>)}</ul>
      </section>
      <section className={section}>
        <h2 className={heading}>Notification delivery</h2>
        <p className="text-sm text-text-secondary">Most recent 50 entries. Delivery failure never changes the accepted instruction or financial ledger.</p>
        {gift.notifications.length ? <ul className="divide-y divide-border">{gift.notifications.map((entry) => <li key={entry.id} className="py-4 text-text-secondary"><p>{entry.template} · {entry.state} · {entry.attempts} attempts</p><p className="text-sm">{entry.sentAt ? `Sent: ${timestamp(entry.sentAt)}` : `Next attempt: ${timestamp(entry.nextAttemptAt)}`}</p>{entry.lastError && <p className="text-warning-text">{entry.lastError}</p>}</li>)}</ul> : <p className="text-text-secondary">No notification records.</p>}
      </section>
      <section className={section}>
        <h2 className={heading}>Financial audit trail</h2>
        <p className="text-sm text-text-secondary">Most recent 100 entries. Restricted snapshots contain financial state, not bearer tokens or private beneficiary dossiers.</p>
        <ol className="divide-y divide-border">{history.map((entry) => <li key={entry.id} className="space-y-3 py-4 text-text-secondary">
          <p className="font-semibold text-text-primary">{entry.action}</p><p className="text-sm">{timestamp(entry.createdAt)} · {entry.userId || "Donor / system (see snapshot)"}</p>
          <details><summary className="min-h-11 cursor-pointer py-2 text-text-link">Inspect before / after state</summary><pre className="whitespace-pre-wrap break-all rounded-xl bg-bg-tertiary p-4 text-xs">{JSON.stringify({ before: entry.before, after: entry.after }, null, 2)}</pre></details>
        </li>)}</ol>
      </section>
    </div>;
  } catch {
    return <section role="alert" className="space-y-4"><h1 className="font-[family-name:var(--font-display)] text-3xl text-text-primary">Financial record unavailable</h1><p className="text-text-secondary">The record or your authorization could not be verified. No financial instruction has been recorded.</p><a href="/admin/refunds" className="inline-flex min-h-11 items-center text-text-link underline">Return to queue</a></section>;
  }
}
