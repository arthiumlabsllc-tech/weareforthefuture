"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Button from "@/components/ui/Button";
import { formatGhs, parseGhs, resolutionConsent, type PublicBeneficiaryCase } from "@/lib/support-a-future/domain";

const input = "mt-2 min-h-12 w-full rounded-xl border border-border-strong bg-surface px-4 py-3 text-base text-text-primary";
const panel = "space-y-5 rounded-2xl border border-border bg-surface p-6";

type FieldIssue = { field: string; message: string };
const issueKey = (field: string) => {
  const key = field.split(".").at(-1);
  return !key || ["decision", "choice", "resolution"].includes(key) ? "action" : key;
};
function FieldError({ field, issues }: { field: string; issues: FieldIssue[] }) {
  const found = issues.filter((issue) => issueKey(issue.field) === field);
  return found.length ? <span id={`refund-${field}-error`} className="mt-2 block text-sm text-error-text">{found.map((issue) => issue.message).join(" ")}</span> : null;
}

export default function RefundActions({ id, excess, deadline, paidAt, financialHold: initialHold, operation: initialOperation, canManage }: {
  id: string; excess: number; deadline: string | null; paidAt: string | null; financialHold: boolean;
  operation: { choice: string; state: string } | null; canManage: boolean;
}) {
  const [financialHold, setFinancialHold] = useState(initialHold);
  const [operation, setOperation] = useState(initialOperation);
  const [action, setAction] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [targets, setTargets] = useState<PublicBeneficiaryCase[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [target, setTarget] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [verified, setVerified] = useState(false);
  const [evidence, setEvidence] = useState({ evidenceRef: "", consentAt: "", consentAmount: "" });
  const [reason, setReason] = useState("");
  const [issues, setIssues] = useState<FieldIssue[]>([]);
  const [fresh, setFresh] = useState(true);
  const [open, setOpen] = useState(() => !!deadline && new Date(deadline).getTime() > Date.now());
  const requestId = useRef(0);
  const submitting = useRef(false);
  const status = useRef<HTMLParagraphElement>(null);
  const path = `/api/admin/refunds/${id}`;
  useEffect(() => { if (error || message) status.current?.focus(); }, [error, message]);
  const redirect = action === "general" || action === "case";
  const settled = operation?.state === "completed";
  const attributes = (field: string, help?: string) => {
    const invalid = issues.some((issue) => issueKey(issue.field) === field);
    return { "aria-invalid": invalid || undefined, "aria-describedby": [help, invalid ? `refund-${field}-error` : null].filter(Boolean).join(" ") || undefined };
  };
  const windowOpen = () => !!deadline && new Date(deadline).getTime() > Date.now();
  const refresh = useCallback(async () => {
      if (document.hidden || submitting.current) return;
      const sequence = ++requestId.current;
      setFresh(false); setPending(true); setTargets([]); setTarget(""); setLoaded(false); setCursor(null); setConfirmed(false); setVerified(false);
      try {
        const response = await fetch(path, { cache: "no-store", signal: AbortSignal.timeout(15000) });
        const data = await response.json();
        if (sequence !== requestId.current) return;
        if (!response.ok) throw new Error("Current authorization or payment state could not be verified. Reload the record before acting.");
        setFinancialHold(!!data.donation.financialHoldAt); setOperation(data.donation.excessResolution);
        setOpen(!!data.donation.refundDueAt && new Date(data.donation.refundDueAt).getTime() > Date.now());
        setAction(""); setFresh(true); setError("");
      } catch { if (sequence === requestId.current) setError("Current status could not be checked. Text entries remain in this tab. Check status again before recording an instruction."); }
      finally { if (sequence === requestId.current) setPending(false); }
  }, [path]);
  useEffect(() => {
    const requests = requestId;
    const onFocus = () => { void refresh(); };
    window.addEventListener("focus", onFocus); document.addEventListener("visibilitychange", onFocus);
    const timer = deadline ? window.setTimeout(() => {
      setOpen(false);
      if (submitting.current) return;
      ++requestId.current; setPending(false); setAction(""); setTargets([]); setTarget(""); setConfirmed(false); setVerified(false);
    }, Math.max(0, new Date(deadline).getTime() - Date.now())) : undefined;
    return () => { ++requests.current; clearTimeout(timer); window.removeEventListener("focus", onFocus); document.removeEventListener("visibilitychange", onFocus); };
  }, [deadline, refresh]);
  const dirty = !!(action || reason || evidence.evidenceRef || evidence.consentAt || evidence.consentAmount) && !message;
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    if (dirty) window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  async function loadTargets() {
    if (pending || !fresh || financialHold || !windowOpen()) return;
    const sequence = ++requestId.current;
    setPending(true); setError(""); setTargets([]); setTarget(""); setConfirmed(false); setVerified(false); setLoaded(false);
    try {
      const response = await fetch(`${path}?${new URLSearchParams({ view: "targets", ...(cursor ? { cursor } : {}) })}`, { cache: "no-store", signal: AbortSignal.timeout(15000) });
      const data = await response.json();
      if (sequence !== requestId.current || !windowOpen()) return;
      if (!response.ok) {
        if (["financial_hold", "resolved"].includes(data.code)) setFresh(false);
        throw new Error(data.error || "Cases could not be loaded.");
      }
      setTargets(data.cases); setCursor(data.nextCursor); setLoaded(true);
    } catch (failure) { if (sequence === requestId.current) setError(failure instanceof Error ? failure.message : "Cases could not be loaded."); }
    finally { if (sequence === requestId.current) setPending(false); }
  }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!confirmed || pending || submitting.current || !fresh || (financialHold && action !== "audit")) return;
    if ((redirect || action === "resend") && !windowOpen()) {
      setOpen(false); setAction(""); setConfirmed(false); setVerified(false); setTargets([]); setTarget("");
      setError("The choice window has ended. Text entries remain in this tab; redirects and new invitations are no longer available.");
      return;
    }
    const form = new FormData(event.currentTarget);
    setIssues([]); setError("");
    const errors: FieldIssue[] = [];
    let consentAt: string | undefined;
    const consentAmount = parseGhs(String(form.get("consentAmount")));
    if (redirect) {
      const raw = String(form.get("consentAt"));
      const date = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?$/.test(raw) ? new Date(`${raw}Z`) : new Date(NaN);
      if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, raw.length) !== raw || date > new Date() || (paidAt && date < new Date(paidAt))) errors.push({ field: "consentAt", message: "Enter a valid UTC time between payment and now." });
      else consentAt = date.toISOString();
      if (consentAmount !== excess) errors.push({ field: "consentAmount", message: `Written consent must authorize the entire ${formatGhs(excess)} excess.` });
      if (!verified) errors.push({ field: "verifiedWrittenConsent", message: "Inspect the written evidence for this destination and confirm it." });
    }
    if (errors.length) { setIssues(errors); setError("Check the highlighted consent fields. No instruction was submitted."); return; }
    const isResolution = ["refund", "general", "case"].includes(action);
    const body = { action: isResolution ? "resolve" : action, reason: String(form.get("reason")), confirmed: true,
      ...(isResolution ? { resolution: { decision: { choice: action, confirmed: true, ...(action === "case" ? { targetPublicId: target } : {}) },
        ...(redirect ? { evidenceRef: String(form.get("evidenceRef")), consentAt, consentAmount, verifiedWrittenConsent: verified } : {}) } } : {}) };
    submitting.current = true; setPending(true);
    try {
      const response = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), cache: "no-store", signal: AbortSignal.timeout(45000) });
      const data = await response.json();
      if (!response.ok) {
        setIssues(data.fields ?? []); setError(data.error || "The action could not be accepted. Your entries are preserved."); setConfirmed(false); setVerified(false);
        if (data.code === "financial_hold") { setFinancialHold(true); setAction(""); }
        if (["resolution_conflict", "resolved", "window_closed", "consent_mismatch"].includes(data.code)) setFresh(false);
        return;
      }
      setMessage(data.message);
    } catch { setFresh(false); setError("The response could not be confirmed. Reload the record before repeating any financial action."); }
    finally { submitting.current = false; setPending(false); setOpen(windowOpen()); }
  }
  if (!canManage || (settled && !financialHold)) return null;
  return <section className={panel} aria-busy={pending}>
    <h2 className="font-[family-name:var(--font-display)] text-2xl text-text-primary">Explicit finance action</h2>
    <p className="text-text-secondary">{financialHold ? "Only escalation is available while the financial hold remains. This cannot clear the hold or authorize money movement." : `Only the ${formatGhs(excess)} excess can be resolved here. An accepted instruction cannot be replaced by a conflicting choice.`}</p>
    {!fresh && <p role="status" className="text-warning-text">Actions are paused until current status is verified.</p>}
    {!message && <><button type="button" aria-disabled={pending} onClick={() => { if (!pending) void refresh(); }} className="inline-flex min-h-12 items-center justify-center rounded-full border-2 border-border px-6 py-3 text-sm font-semibold text-text-secondary transition-colors hover:border-primary hover:bg-bg-tertiary aria-disabled:cursor-wait aria-disabled:opacity-60">Check current status</button><p className="text-sm text-text-secondary">Status checks preserve text entries in this tab, but reset the action, destination, and confirmations. Reloading or leaving the page discards unsaved entries.</p></>}
    {(error || message) && <p ref={status} tabIndex={-1} role={error ? "alert" : "status"} className={error ? "text-error-text" : "text-success-text"}>{error || message}</p>}
    {message ? <a href={`/admin/refunds/${id}`} className="inline-flex min-h-11 items-center text-text-link underline">Reload current ledger and provider status</a> : <form method="post" action={path} onSubmit={submit} className="space-y-5">
      <fieldset disabled={pending || !fresh} className="space-y-5">
        <legend className="sr-only">Choose and confirm one action</legend>
        <label className="block text-text-secondary">Action<select required value={action} onChange={(event) => { const available = windowOpen(); setOpen(available); setAction(!available && ["general", "case", "resend"].includes(event.target.value) ? "" : event.target.value); setConfirmed(false); setVerified(false); setTarget(""); setTargets([]); setLoaded(false); setCursor(null); setIssues([]); }} className={input} {...attributes("action")}>
          <option value="">Choose an action</option>
          {!financialHold && !operation && excess > 0 && <option value="refund">Refund the excess</option>}
          {!financialHold && !operation && open && <><option value="general">Record donor-authorized general-fund redirect</option><option value="case">Record donor-authorized case redirect</option><option value="resend">Resend unexpired choice invitation</option></>}
          {!financialHold && operation?.choice === "refund" && !settled && <option value="retry">Reconcile / retry the existing refund</option>}
          <option value="audit">Mark audited / escalate</option>
        </select><FieldError field="action" issues={issues} /></label>
        {action === "case" && <div className="space-y-3">
          <Button type="button" variant="outline" className="min-h-12 hover:scale-100" onClick={loadTargets}>{cursor ? "Next page of eligible cases" : "Load eligible cases"}</Button>
          {loaded && !targets.length && <p role="status" className="text-text-secondary">{cursor ? "No match on this page. More cases can be checked." : "No case on this page can receive the entire excess. You may refund it or record consent for the general fund."}</p>}
          <label className="block text-text-secondary">Consented destination<select required value={target} onChange={(event) => { setTarget(event.target.value); setConfirmed(false); setVerified(false); }} className={input} {...attributes("targetPublicId")}><option value="">Choose the destination named in the evidence</option>{targets.map((item) => <option key={item.publicId} value={item.publicId}>{item.publicId} · {item.displayName} · {item.needType}</option>)}</select><FieldError field="targetPublicId" issues={issues} /></label>
          <p className="text-sm text-text-secondary">Capacity and current safeguarding eligibility are checked again when the instruction is accepted.</p>
        </div>}
        {redirect && <div className="space-y-4 rounded-xl border border-border p-4" onChange={(event) => { setConfirmed(false); if ((event.target as HTMLInputElement).name !== "verifiedWrittenConsent") setVerified(false); }}>
          <p id="written-consent-help" className="text-text-secondary">Inspect written consent from the verified donor. It must name this payment, the exact excess amount, and the destination below. A staff note or preference is not donor consent.</p>
          <label className="block text-text-secondary">Restricted written-evidence reference<input name="evidenceRef" value={evidence.evidenceRef} onChange={(event) => setEvidence({ ...evidence, evidenceRef: event.target.value })} required minLength={5} maxLength={200} className={input} {...attributes("evidenceRef", "written-consent-help")} /><FieldError field="evidenceRef" issues={issues} /></label>
          <label className="block text-text-secondary">Consent obtained at (UTC)<input name="consentAt" value={evidence.consentAt} onChange={(event) => setEvidence({ ...evidence, consentAt: event.target.value })} type="datetime-local" step="1" required className={input} {...attributes("consentAt")} /><FieldError field="consentAt" issues={issues} /></label>
          <label className="block text-text-secondary">Exact excess authorized in the evidence (GH₵)<input name="consentAmount" value={evidence.consentAmount} onChange={(event) => setEvidence({ ...evidence, consentAmount: event.target.value })} inputMode="decimal" required className={input} {...attributes("consentAmount")} /><FieldError field="consentAmount" issues={issues} /></label>
          <label className="flex min-h-11 items-start gap-3 text-text-secondary"><input type="checkbox" name="verifiedWrittenConsent" required checked={verified} onChange={(event) => setVerified(event.target.checked)} {...attributes("verifiedWrittenConsent")} className="mt-1.5 h-5 w-5 shrink-0" /><span>I verified the donor’s identity and inspected written authorization for this payment, amount, destination, and timestamp in the restricted evidence store.<FieldError field="verifiedWrittenConsent" issues={issues} /></span></label>
        </div>}
        {action && <p className="rounded-xl bg-bg-tertiary p-4 text-text-secondary">{["refund", "general", "case"].includes(action) && (action !== "case" || target)
          ? resolutionConsent(action as "refund" | "general" | "case", excess, target || undefined)
          : action === "retry" ? "Reconcile the accepted operation. Unknown submissions are never blindly retried. This does not confirm money has returned."
            : action === "audit" ? financialHold ? "Record finance escalation only. The hold, original allocation, and any accepted instruction remain unchanged." : "Record escalation. The liability and daily automatic-refund obligation remain open."
              : action === "resend" ? "Revoke the previous invitation and queue a replacement without extending the deadline." : "Select a destination before confirming."}</p>}
        <label className="block text-text-secondary">Reason (required)<textarea name="reason" value={reason} onChange={(event) => { setReason(event.target.value); setConfirmed(false); }} required minLength={10} maxLength={1000} rows={3} className={input} {...attributes("reason")} /><FieldError field="reason" issues={issues} /></label>
        <label className="flex min-h-11 items-start gap-3 text-text-secondary"><input type="checkbox" required checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} {...attributes("confirmed")} className="mt-1.5 h-5 w-5 shrink-0" /><span>{financialHold ? "I confirm escalation only. This does not clear the hold or change any allocation or accepted instruction." : "I confirm this instruction for the excess only. The original case allocation stays unchanged."}<FieldError field="confirmed" issues={issues} /></span></label>
        <Button type="submit" disabled={!action || !confirmed || pending || (action === "case" && !target)} className="min-h-12 hover:scale-100 active:scale-100">{pending ? "Checking and recording…" : "Confirm finance action"}</Button>
        <p className="text-sm text-text-secondary">Choose an action and complete its confirmation to continue. Provider processing and email delivery are separate from accepting the instruction.</p>
      </fieldset>
    </form>}
    <noscript><p>JavaScript is required to submit finance actions. No instruction has been recorded.</p></noscript>
  </section>;
}

export function LedgerExport() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [issues, setIssues] = useState<FieldIssue[]>([]);
  const status = useRef<HTMLParagraphElement>(null);
  const controller = useRef<AbortController | null>(null);
  const downloadUrl = useRef<string | null>(null);
  const cleanupTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const releaseDownload = useCallback(() => {
    if (cleanupTimer.current) clearTimeout(cleanupTimer.current);
    if (downloadUrl.current) URL.revokeObjectURL(downloadUrl.current);
    downloadUrl.current = null;
  }, []);
  useEffect(() => () => { controller.current?.abort(); releaseDownload(); }, [releaseDownload]);
  useEffect(() => { if (error || message) status.current?.focus(); }, [error, message]);
  const attributes = (field: string) => ({
    "aria-invalid": issues.some((issue) => issueKey(issue.field) === field) || undefined,
    "aria-describedby": `export-help${issues.some((issue) => issueKey(issue.field) === field) ? ` refund-${field}-error` : ""}`,
  });
  async function download(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (controller.current) return;
    const request = new AbortController(); controller.current = request;
    setPending(true); setError(""); setMessage(""); setIssues([]); releaseDownload();
    const data = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/admin/refunds/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from: String(data.get("from")), to: String(data.get("to")) }),
        cache: "no-store",
        signal: AbortSignal.any([request.signal, AbortSignal.timeout(30000)]),
      });
      if (!response.ok) {
        const failure = await response.json();
        if (request.signal.aborted) return;
        setIssues(failure.fields ?? (failure.code === "date_range" ? [{ field: "to", message: failure.error }] : []));
        setError(failure.error || "Export could not be generated."); return;
      }
      if (!response.headers.get("content-type")?.startsWith("text/csv")) throw new Error("Invalid export response");
      const blob = await response.blob();
      if (request.signal.aborted) return;
      const url = URL.createObjectURL(blob); downloadUrl.current = url;
      const link = document.createElement("a"); link.href = url; link.download = "ftf-excess-ledger.csv";
      document.body.append(link); link.click(); link.remove();
      cleanupTimer.current = setTimeout(releaseDownload, 1000);
      setMessage("The CSV is ready and has been sent to your browser. Check your downloads.");
    } catch { if (!request.signal.aborted) setError("Export could not be downloaded. Your date range is preserved; try again."); }
    finally { controller.current = null; if (!request.signal.aborted) setPending(false); }
  }
  return <section className={panel} aria-busy={pending}>
    <h2 className="font-[family-name:var(--font-display)] text-2xl text-text-primary">Restricted reconciliation export</h2>
    <p id="export-help" className="max-w-[620px] text-text-secondary">Opening and closing held excess, new excess, processed refunds, general-fund and case redirects, and closing overdue liabilities in pesewas. Up to 31 days and 5,000 entries; oversized requests fail without truncation.</p>
    <p className="max-w-[620px] text-sm text-text-secondary">Historical audited liabilities had an escalation recorded before the cutoff; this does not mean settlement. Held excess under reconciliation is a subset of the closing balance, not the total value of disputed payments. Finance must reconcile provider balances and sign off monthly.</p>
    {(error || message) && <p ref={status} tabIndex={-1} role={error ? "alert" : "status"} className={error ? "text-error-text" : "text-success-text"}>{error || message}</p>}
    <form onSubmit={download} method="post" className="grid items-end gap-4 sm:grid-cols-3">
      <label className="text-text-secondary">From (UTC, included)<input name="from" type="date" required disabled={pending} className={input} {...attributes("from")} /><FieldError field="from" issues={issues} /></label>
      <label className="text-text-secondary">To (UTC, excluded)<input name="to" type="date" required disabled={pending} className={input} {...attributes("to")} /><FieldError field="to" issues={issues} /></label>
      <Button type="submit" variant="outline" disabled={pending} className="min-h-12 hover:scale-100">{pending ? "Preparing export…" : "Download ledger CSV"}</Button>
    </form>
  </section>;
}
