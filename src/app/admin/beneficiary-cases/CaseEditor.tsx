"use client";

import { useEffect, useRef, useState } from "react";
import { CASE_REGIONS, NEED_TYPES, caseDraftSchema, formatGhs, parseGhs, type CaseDraft } from "@/lib/support-a-future/domain";
import type { getAdminCaseOptions } from "@/lib/support-a-future/case-workflow";
import Button from "@/components/ui/Button";
import { cardClasses, cardPadding } from "@/lib/ui/cardClasses";

type Options = Awaited<ReturnType<typeof getAdminCaseOptions>>;
type RecordState = { id: string; revision: number; reviewStatus: string; status: string; amountRaised: number; funded: boolean };
type Permissions = { edit: boolean; review: boolean; publish: boolean; withdraw: boolean };
const inputClass = "mt-2 min-h-12 w-full rounded-xl border border-border-strong bg-surface px-4 py-3 text-base text-text-primary disabled:opacity-70";
const empty: CaseDraft = { firstName: null, age: null, region: "Greater Accra", needType: "Learning", needDescription: "", storyShort: "", storyFull: "",
  amountNeeded: 0, pillarId: null, programId: null, consentGiven: false, consentEvidenceRef: null, consentRecordedAt: null, consentExpiresAt: null,
  closesAt: null, photoAssetId: null, photoAlt: null };

export default function CaseEditor({ initial = empty, record, options, permissions }: {
  initial?: CaseDraft; record?: RecordState; options: Options; permissions: Permissions;
}) {
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState("");
  const [fields, setFields] = useState<Record<string, string>>({});
  const [pillar, setPillar] = useState(initial.pillarId ?? "");
  const [action, setAction] = useState("");
  const errorRef = useRef<HTMLParagraphElement>(null);
  const allowNavigation = useRef(false);
  const path = `/api/admin/beneficiary-cases${record ? `/${record.id}` : ""}`;
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => { if (!allowNavigation.current) event.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  useEffect(() => { if (error) errorRef.current?.focus(); }, [error]);
  const accessibility = (name: string) => ({ "aria-invalid": !!fields[name], "aria-describedby": fields[name] ? `case-error-${name}` : undefined });
  const fieldError = (name: string) => fields[name] ? <span id={`case-error-${name}`} className="mt-2 block text-sm text-error-text">{fields[name]}</span> : null;
  const nullable = (data: FormData, name: string) => String(data.get(name) ?? "").trim() || null;
  const date = (data: FormData, name: "consentRecordedAt" | "consentExpiresAt" | "closesAt") => {
    const value = nullable(data, name);
    if (!value) return null;
    if (value === initial[name]?.slice(0, 16)) return initial[name];
    const parsed = new Date(`${value}Z`);
    return Number.isFinite(parsed.getTime()) ? parsed.toISOString() : value;
  };
  async function send(body: unknown, method: string, result: string) {
    setBusy(true); setError(""); setFields({});
    try {
      const response = await fetch(path, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), cache: "no-store" });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "The change was not saved. Please try again.");
        setFields(Object.fromEntries((data.fields ?? []).map((item: { field: string; message: string }) => [item.field.replace(/^draft\./, ""), item.message])));
        return;
      }
      allowNavigation.current = true;
      setDirty(false);
      // New document discards stale permission, revision, and safeguarding state.
      window.location.assign(`/admin/beneficiary-cases/${data.record.id}?result=${result}`);
    } catch { setError("The response could not be confirmed. Your entries are preserved. Reload and check the case before repeating an action."); }
    finally { if (!allowNavigation.current) setBusy(false); }
  }
  function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const draft = { firstName: nullable(data, "firstName"), age: nullable(data, "age") === null ? null : Number(data.get("age")),
      region: data.get("region"), needType: data.get("needType"), needDescription: data.get("needDescription"), storyShort: data.get("storyShort"), storyFull: data.get("storyFull"),
      amountNeeded: record && record.amountRaised > 0 ? initial.amountNeeded : parseGhs(String(data.get("target"))),
      pillarId: nullable(data, "pillarId"), programId: nullable(data, "programId"), consentGiven: data.get("consentGiven") === "on",
      consentEvidenceRef: nullable(data, "consentEvidenceRef"), consentRecordedAt: date(data, "consentRecordedAt"), consentExpiresAt: date(data, "consentExpiresAt"),
      closesAt: date(data, "closesAt"), photoAssetId: null, photoAlt: null };
    const parsed = caseDraftSchema.safeParse(draft);
    if (!parsed.success) {
      setError("Check the highlighted fields. Nothing has been saved.");
      setFields(Object.fromEntries(parsed.error.issues.map((issue) => [issue.path.join("."), issue.message])));
      return;
    }
    void send(record ? { revision: record.revision, draft: parsed.data } : parsed.data, record ? "PATCH" : "POST", "saved");
  }
  function transition(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!record || !action || (dirty && action !== "withdraw")) return;
    const data = new FormData(event.currentTarget);
    void send({ action, revision: record.revision, reason: String(data.get("reason")),
      ...(action === "approve" ? { reviewedContent: data.get("reviewedContent") === "on", reviewedConsent: data.get("reviewedConsent") === "on", reviewedMedia: data.get("reviewedMedia") === "on" } : {}) }, "POST", action);
  }
  const actions = record ? [
    ...(permissions.edit && ["draft", "rejected"].includes(record.reviewStatus) ? [["submit", "Submit for safeguarding review"]] : []),
    ...(permissions.review && record.reviewStatus === "submitted" ? [["approve", "Approve this revision"], ["reject", "Return for changes"]] : []),
    ...(permissions.publish && record.reviewStatus === "approved" ? [["publish", "Publish approved revision"]] : []),
    ...(permissions.publish && record.status === "active" ? [["close", "Close new support"]] : []),
    ...(permissions.publish && record.funded && record.status !== "archived" ? [["archive", "Move to funded archive"]] : []),
    ...(permissions.withdraw ? [["withdraw", "Withdraw consent and remove public access"]] : []),
  ] : [];
  return <div className="space-y-8" aria-busy={busy}>
    {error && <p ref={errorRef} tabIndex={-1} role="alert" className="rounded-xl border border-error/20 bg-error/10 p-4 text-error-text">{error}</p>}
    {permissions.edit && <form method="post" action={path} onSubmit={save} onChange={() => setDirty(true)} className={`${cardClasses} ${cardPadding.compact} space-y-6`}>
      <h2 className="font-[family-name:var(--font-display)] text-2xl text-text-primary">Public content</h2>
      <p id="case-content-help" className="text-sm text-text-secondary">Use a first name or pseudonym, region only, and strengths-led plain text. Exclude contacts, schools, exact locations, diagnoses, and identifying family details.</p>
      <fieldset disabled={busy} aria-describedby="case-content-help" className="grid gap-6 sm:grid-cols-2">
        <legend className="sr-only">Case content and budget</legend>
        <label className="text-text-secondary">First name or pseudonym (optional)<input name="firstName" defaultValue={initial.firstName ?? ""} maxLength={40} className={inputClass} {...accessibility("firstName")} />{fieldError("firstName")}</label>
        <label className="text-text-secondary">Age (optional)<input name="age" type="number" min={0} max={30} defaultValue={initial.age ?? ""} className={inputClass} {...accessibility("age")} />{fieldError("age")}</label>
        <label className="text-text-secondary">Region<select name="region" required defaultValue={initial.region} className={inputClass} {...accessibility("region")}>{CASE_REGIONS.map((value) => <option key={value}>{value}</option>)}</select>{fieldError("region")}</label>
        <label className="text-text-secondary">Verified need category<select name="needType" required defaultValue={initial.needType} className={inputClass} {...accessibility("needType")}>{NEED_TYPES.map((value) => <option key={value}>{value}</option>)}</select>{fieldError("needType")}</label>
        {([ ["needDescription", "What support pays for", 800, 3], ["storyShort", "Short story", 320, 3], ["storyFull", "Full story: strengths, barrier, support, progress, and next steps", 6000, 8] ] as const).map(([name, label, max, rows]) =>
          <label key={name} className="text-text-secondary sm:col-span-2">{label}<textarea name={name} required maxLength={max} rows={rows} defaultValue={initial[name]} className={inputClass} {...accessibility(name)} />{fieldError(name)}</label>)}
        <label className="text-text-secondary">Target (GH₵)<input name="target" inputMode="decimal" required readOnly={!!record && record.amountRaised > 0} defaultValue={initial.amountNeeded ? (initial.amountNeeded / 100).toFixed(2) : ""} className={inputClass} {...accessibility("amountNeeded")} />{fieldError("amountNeeded")}
          {record && record.amountRaised > 0 && <span className="mt-2 block text-sm">Locked: {formatGhs(record.amountRaised)} has already been credited.</span>}</label>
        <label className="text-text-secondary">Close new support at (UTC, optional)<input name="closesAt" type="datetime-local" defaultValue={initial.closesAt?.slice(0, 16) ?? ""} className={inputClass} {...accessibility("closesAt")} />{fieldError("closesAt")}</label>
        <label className="text-text-secondary">Pillar (optional)<select name="pillarId" value={pillar} onChange={(event) => setPillar(event.target.value)} className={inputClass} {...accessibility("pillarId")}><option value="">No designation</option>{options.pillars.map((item) => <option key={item.id} value={item.id}>{item.title}{!item.published ? " (unpublished)" : ""}</option>)}</select>{fieldError("pillarId")}</label>
        <label className="text-text-secondary">Programme (optional)<select name="programId" defaultValue={initial.programId ?? ""} className={inputClass} {...accessibility("programId")}><option value="">No designation</option>{options.programs.filter((item) => !pillar || item.id === initial.programId || item.pillars.some((link) => link.pillarId === pillar)).map((item) => <option key={item.id} value={item.id}>{item.name}{!item.published ? " (unpublished)" : ""}</option>)}</select>{fieldError("programId")}</label>
      </fieldset>
      <section className="space-y-4 border-t border-border pt-6" aria-labelledby="private-consent-heading">
        <h2 id="private-consent-heading" className="font-[family-name:var(--font-display)] text-2xl text-text-primary">Private consent record</h2>
        <p className="text-sm text-text-secondary">Reference documented consent in FTF’s restricted evidence store. Do not paste a public document URL or the beneficiary dossier. The reviewer must inspect the evidence and its publication scope independently.</p>
        <fieldset disabled={busy} className="grid gap-6 sm:grid-cols-2">
          <legend className="sr-only">Consent evidence</legend>
          <label className="text-text-secondary sm:col-span-2">Restricted evidence reference<input name="consentEvidenceRef" defaultValue={initial.consentEvidenceRef ?? ""} maxLength={200} className={inputClass} {...accessibility("consentEvidenceRef")} />{fieldError("consentEvidenceRef")}</label>
          {([ ["consentRecordedAt", "Consent obtained at (UTC)"], ["consentExpiresAt", "Consent expires at (UTC, optional)"] ] as const).map(([name, label]) => <label key={name} className="text-text-secondary">{label}<input name={name} type="datetime-local" defaultValue={initial[name]?.slice(0, 16) ?? ""} className={inputClass} {...accessibility(name)} />{fieldError(name)}</label>)}
          <label className="flex min-h-11 items-start gap-3 text-text-secondary sm:col-span-2"><input name="consentGiven" type="checkbox" defaultChecked={initial.consentGiven} className="mt-1.5 h-5 w-5 shrink-0" /><span>Current documented consent covers this proposed public content. Consent explains that already viewed copies cannot be recalled.</span></label>
        </fieldset>
        <p className="rounded-xl bg-bg-tertiary p-4 text-sm text-text-secondary">Media: non-photo illustration fallback. Restricted photography is not enabled. Never upload case imagery through the general media uploader.</p>
      </section>
      <p className="text-sm text-text-secondary">Saving invalidates existing approval and removes the case from public eligibility until independently reapproved.</p>
      <Button className="min-h-12 hover:scale-100 active:scale-100" type="submit" disabled={busy}>{busy ? "Saving…" : record ? "Save new draft revision" : "Create private draft"}</Button>
    </form>}
    {record && actions.length > 0 && <form method="post" action={path} onSubmit={transition} className={`${cardClasses} ${cardPadding.compact} space-y-4`}>
      <h2 className="font-[family-name:var(--font-display)] text-2xl text-text-primary">Revision {record.revision}: next action</h2>
      {dirty && <p role="status" className="text-warning-text">Save your changes before a workflow action. Emergency withdrawal remains available for the saved record.</p>}
      <fieldset disabled={busy} className="space-y-4">
        <legend className="sr-only">Explicit workflow instruction</legend>
        <label className="block text-text-secondary">Action<select value={action} onChange={(event) => setAction(event.target.value)} required className={inputClass}><option value="">Choose an action</option>{actions.map(([value, label]) => <option key={value} value={value} disabled={dirty && value !== "withdraw"}>{label}</option>)}</select></label>
        <label className="block text-text-secondary">Reason (required)<textarea name="reason" required minLength={10} maxLength={1000} rows={3} className={inputClass} {...accessibility("reason")} />{fieldError("reason")}</label>
        {action === "approve" && <div className="space-y-4 rounded-xl bg-bg-tertiary p-4">
          {([ ["reviewedContent", "I independently reviewed the exact saved public-content revision for dignity and identification risks."], ["reviewedConsent", "I inspected the restricted evidence and verified consent scope, authority, date, and expiry for this publication."], ["reviewedMedia", "I verified the non-photo fallback and that no identifying media or location clues are exposed."] ] as const).map(([name, text]) => <label key={name} className="flex min-h-11 items-start gap-3 text-text-secondary"><input type="checkbox" name={name} required className="mt-1.5 h-5 w-5 shrink-0" {...accessibility(name)} /><span>{text}{fieldError(name)}</span></label>)}
        </div>}
        {action === "withdraw" && <p className="text-error-text">This immediately removes public access and new support. Existing financial allocations remain intact. Any unsaved edits will be discarded.</p>}
        <label className="flex min-h-11 items-start gap-3 text-text-secondary"><input key={action} type="checkbox" required className="mt-1.5 h-5 w-5 shrink-0" /><span>I confirm this action on saved revision {record.revision}.</span></label>
        <Button className="min-h-12 hover:scale-100 active:scale-100" type="submit" disabled={busy || !action || (dirty && action !== "withdraw")}>{busy ? "Recording…" : "Confirm workflow action"}</Button>
      </fieldset>
    </form>}
    {busy && <p role="status" className="text-text-secondary">The server is checking your permissions and the saved revision.</p>}
    <noscript><p>JavaScript is required for case editing. No action has been recorded.</p></noscript>
  </div>;
}
