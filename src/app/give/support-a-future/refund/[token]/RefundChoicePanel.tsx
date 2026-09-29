"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { formatGhs, resolutionConsent, type ResolutionChoice } from "@/lib/support-a-future/domain";
import type { getChoiceContext } from "@/lib/support-a-future/resolutions";
import { cardClasses, cardPadding } from "@/lib/ui/cardClasses";
import { loadChoiceTargets, refreshChoice, submitChoice } from "./actions";

type Context = Awaited<ReturnType<typeof getChoiceContext>>;
type Target = { publicId: string; displayName: string; region: string; needType: string; remaining: number };
const outline = "min-h-14 w-full rounded-xl border-2 border-border bg-surface p-4 text-left font-semibold text-text-primary transition-colors hover:border-primary hover:bg-bg-tertiary disabled:cursor-wait disabled:opacity-60";

export default function RefundChoicePanel({ token, initial }: { token: string; initial: Context }) {
  const [context, setContext] = useState<Context | null>(initial);
  const [choice, setChoice] = useState<ResolutionChoice | null>(null);
  const [targets, setTargets] = useState<Target[]>([]);
  const [targetId, setTargetId] = useState("");
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [targetsLoaded, setTargetsLoaded] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [fresh, setFresh] = useState(true);
  const confirmation = useRef<HTMLHeadingElement>(null);
  const sequence = useRef(0);
  const mounted = useRef(true);
  const submitting = useRef(false);
  const operation = context?.resolution;
  const deadline = new Date(initial.deadline).getTime();
  const current = useCallback((id: number) => mounted.current && sequence.current === id && Date.now() < deadline, [deadline]);
  const clearSelection = useCallback(() => {
    setTargets([]); setTargetId(""); setConfirmed(false); setTargetsLoaded(false); setNextCursor(null); setChoice(null);
  }, []);
  const failure = (result: { error: string; unavailable: boolean; financialHold: boolean }) => {
    if (result.unavailable) setContext(null);
    if (result.financialHold) { setContext((old) => old ? { ...old, financialHold: true } : null); clearSelection(); }
    setError(result.error);
  };
  const recheck = useCallback(async () => {
    if (document.hidden || submitting.current || Date.now() >= deadline) return;
    const id = ++sequence.current;
    clearSelection(); setFresh(false); setPending(true);
    setContext((old) => old ? { ...old, label: "an FTF-administered need" } : null);
    try {
      const result = await refreshChoice(token);
      if (!current(id)) return;
      if (result.ok) { setContext(result.context); setFresh(true); setError(""); }
      else { if (result.unavailable) setContext(null); setError(result.error); }
    } catch { if (current(id)) setError("We could not refresh this page. Reconnect and check status before choosing."); }
    finally { if (current(id)) setPending(false); }
  }, [clearSelection, current, deadline, token]);

  const operationChoice = operation?.choice;
  const operationState = operation?.state;
  useEffect(() => { if (operationChoice) confirmation.current?.focus(); }, [operationChoice, operationState]);
  useEffect(() => {
    mounted.current = true;
    const requests = sequence;
    const onFocus = () => { void recheck(); };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    const timer = window.setTimeout(() => {
      ++sequence.current; setContext(null); clearSelection(); setPending(false);
    }, Math.max(0, deadline - Date.now()));
    return () => { mounted.current = false; ++requests.current; clearTimeout(timer); window.removeEventListener("focus", onFocus); document.removeEventListener("visibilitychange", onFocus); };
  }, [clearSelection, deadline, recheck]);

  async function loadTargets(cursor?: string | null) {
    if (submitting.current || !fresh || context?.financialHold || !current(sequence.current)) return;
    const id = ++sequence.current;
    setPending(true); setError(""); setTargets([]); setTargetId(""); setConfirmed(false); setTargetsLoaded(false);
    try {
      const result = await loadChoiceTargets(token, cursor);
      if (!current(id)) return;
      if (!result.ok) { failure(result); return; }
      // Only the freshly checked page is retained; prior beneficiary content is discarded.
      setTargets(result.cases); setNextCursor(result.nextCursor); setTargetsLoaded(true);
    } catch { if (current(id)) setError("Cases could not be loaded. Please try again."); }
    finally { if (current(id)) setPending(false); }
  }

  function select(value: ResolutionChoice) {
    if (pending || !fresh || (context?.financialHold && value !== "refund")) return;
    clearSelection(); setChoice(value); setError("");
    if (value === "case") void loadTargets();
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (pending || submitting.current || !fresh || Date.now() >= deadline) return;
    if (!choice || !confirmed || (choice === "case" && !targetId)) { setError("Choose a destination and confirm your instruction."); return; }
    const id = ++sequence.current;
    submitting.current = true; setPending(true); setError("");
    try {
      const result = await submitChoice(token, { choice, confirmed: true, ...(choice === "case" ? { targetPublicId: targetId } : {}) });
      if (!current(id)) return;
      clearSelection();
      if (result.ok) {
        setContext((old) => old ? { ...old, resolution: result.resolution } : null);
        // Refresh the hold and current provider state after acceptance, without reopening choices.
        const updated = await refreshChoice(token);
        if (!current(id)) return;
        if (updated.ok) setContext(updated.context);
        else failure(updated);
      } else failure(result);
    } catch {
      if (current(id)) { setFresh(false); setError("We could not confirm the response. Check status before trying again. An instruction may already be recorded."); }
    } finally { submitting.current = false; if (current(id)) setPending(false); }
  }

  if (!context) return <div role="status" className="space-y-4">
    <h1 className="font-[family-name:var(--font-display)] text-3xl text-text-primary">This private link is unavailable</h1>
    <p className="text-text-secondary">The link may have expired or been replaced. Contact FTF for help checking your gift. No new choice has been made by viewing this page.</p>
  </div>;

  const selectedTarget = targets.find((row) => row.publicId === targetId);
  const consent = choice && (choice !== "case" || selectedTarget) ? resolutionConsent(choice, context.excess, selectedTarget?.publicId) : null;
  return <div className="space-y-8" aria-busy={pending}>
    <header className="space-y-4">
      <p className="text-sm text-text-secondary">Private gift instruction</p>
      <h1 className="font-[family-name:var(--font-display)] text-3xl leading-tight text-text-primary sm:text-4xl">Your gift to {context.label}</h1>
      <p className="text-text-secondary">{context.financialHold ? "Your recorded allocation has not been changed. A payment exception requires finance reconciliation." : "Your original case allocation remains intact. You decide what happens to the unallocated excess."}</p>
    </header>
    <dl className={`${cardClasses} ${cardPadding.compact} space-y-4 tabular-nums`}>
      {[["Original gift", context.amount], ["Credited to the original case", context.credited], ["Original unallocated excess", context.excess]].map(([label, amount]) =>
        <div key={label} className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border pb-3 last:border-0 last:pb-0">
          <dt className="text-text-secondary">{label}</dt><dd className="text-lg font-semibold text-text-primary">{formatGhs(Number(amount))}</dd>
        </div>)}
    </dl>
    {context.financialHold && <section className="space-y-3 rounded-xl border border-warning/30 bg-warning-bg p-4 text-warning-text" aria-labelledby="hold-heading">
      <h2 id="hold-heading" className="text-lg font-semibold">Automated money movement is paused</h2>
      <p>FTF is checking a provider refund or payment exception. Any accepted instruction remains recorded. The totals above are accounting history, not confirmation of the provider’s current balance.</p>
      <p>Contact FTF for a verified update. The original deadline has not been extended. Recording a refund instruction does not authorize another transfer while this hold remains.</p>
    </section>}
    {operation ? <section className="space-y-4" aria-live="polite">
      <h2 ref={confirmation} tabIndex={-1} className="font-[family-name:var(--font-display)] text-2xl text-text-primary">
        {context.financialHold ? "Your accepted instruction remains recorded" : operation.choice !== "refund" ? "Your redirect is confirmed" : operation.state === "completed" ? "Your excess refund has been processed" : "Your excess refund request is recorded"}
      </h2>
      <p className="text-text-secondary">{context.financialHold
        ? `Recorded instruction: ${operation.choice === "refund" ? "refund the excess" : operation.choice === "general" ? "redirect to the general fund" : "redirect to another case"}, ${formatGhs(operation.amount)}. Contact FTF about the payment exception; this page does not confirm further settlement.`
        : operation.choice !== "refund" ? `Your instruction to redirect ${formatGhs(operation.amount)} ${operation.choice === "general" ? "to FTF’s general fund" : "to your selected case"} is complete.`
        : operation.state === "completed"
          ? `The provider has confirmed processing ${formatGhs(operation.amount)}. Your bank or Mobile Money provider may take additional time to show the credit.`
          : `Your excess of ${formatGhs(operation.amount)} remains pending until the payment provider confirms processing. We will email you when that happens.`}</p>
      <p className="text-sm text-text-secondary">This instruction cannot be changed through this link. Refresh to check progress while the link remains valid, or contact FTF.</p>
    </section> : fresh && <form onSubmit={submit} className="space-y-6">
      <fieldset disabled={pending} className="space-y-3">
        <legend className="mb-4 font-[family-name:var(--font-display)] text-2xl text-text-primary">Choose what happens next</legend>
        {([
          ["refund", `Refund the excess - ${formatGhs(context.excess)}`],
          ["general", "Redirect to our general fund"],
          ["case", "Redirect to another case"],
        ] as const).map(([value, label]) => <button type="button" key={value} aria-pressed={choice === value} disabled={context.financialHold && value !== "refund"} aria-describedby={context.financialHold ? "hold-heading" : undefined} onClick={() => select(value)}
          className={`${outline} ${choice === value ? "border-primary" : ""}`}>{label}{choice === value && <span className="ml-2 text-sm font-normal">(Selected)</span>}</button>)}
      </fieldset>
      {choice === "case" && !context.financialHold && <fieldset disabled={pending} className="space-y-4">
        <legend className="mb-3 font-semibold text-text-primary">A case that can receive the entire {formatGhs(context.excess)}</legend>
        {targets.length > 0 && <label className="block text-text-secondary">Destination case
          <select value={targetId} onChange={(event) => { setTargetId(event.target.value); setConfirmed(false); }} required aria-describedby="choice-destination-help"
            className="mt-2 min-h-12 w-full rounded-xl border border-border-strong bg-surface p-3 text-text-primary">
            <option value="">Select a case</option>
            {targets.map((target) => <option key={target.publicId} value={target.publicId}>{target.displayName} - {target.publicId} - {target.region} - {target.needType}</option>)}
          </select>
        </label>}
        <p id="choice-destination-help" className="text-sm text-text-secondary">We recheck consent and capacity when you confirm. The excess will never be split between cases.</p>
        {targetsLoaded && !targets.length && <p role="status" className="text-text-secondary">{nextCursor ? "No matching case on this page. Check the next page." : "No matching case on this page and no further pages. Refund and general-fund choices remain available."}</p>}
        {(!targetsLoaded || nextCursor) && <button type="button" className={outline} onClick={() => loadTargets(nextCursor)}>{pending ? "Loading cases…" : nextCursor ? "Check more cases" : "Reload available cases"}</button>}
      </fieldset>}
      {consent && <div className="space-y-4 rounded-xl border border-border p-4">
        {selectedTarget && choice === "case" && <p className="font-semibold text-text-primary">Destination: {selectedTarget.displayName} ({selectedTarget.publicId})</p>}
        <label className="flex min-h-11 items-start gap-3 text-text-secondary">
          <input type="checkbox" required checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} aria-describedby={error ? "choice-error" : undefined} disabled={pending} className="mt-1.5 h-5 w-5 shrink-0" />
          <span>{consent}</span>
        </label>
        <button type="submit" disabled={pending} className={outline}>{pending ? "Recording your instruction…" : "Confirm this instruction"}</button>
      </div>}
      <p className="text-text-secondary">{context.financialHold ? "If no instruction is recorded, the excess becomes due for refund after " : "If you do nothing, we’ll refund the excess after "} <time dateTime={context.deadline}>{new Date(context.deadline).toLocaleDateString("en-GB", { timeZone: "UTC", day: "numeric", month: "long", year: "numeric" })} (UTC)</time>.</p>
      <p className="text-sm text-text-secondary">{context.financialHold ? "The daily fallback can record the refund obligation, but provider submission is paused until finance resolves the exception. No completion date is confirmed." : "Automatic requests run daily, normally within 24 hours after the choice period ends. Bank or provider processing can take additional time."}</p>
    </form>}
    {!fresh && <p role="status" className="text-text-secondary">Check the current status before recording an instruction.</p>}
    <button type="button" onClick={() => { if (!pending) void recheck(); }} aria-disabled={pending} className={`${outline} aria-disabled:cursor-wait aria-disabled:opacity-60`}>Check current status</button>
    {error && <p id="choice-error" role="alert" className="rounded-xl border border-error/20 bg-error/10 p-4 text-error-text">{error}</p>}
    {pending && <p role="status" className="text-text-secondary">Please wait. Your request is being checked.</p>}
    <noscript><p className="text-text-secondary">JavaScript is required to record a choice here. You can contact FTF using the link below. Taking no action keeps the automatic excess-refund fallback in place.</p></noscript>
  </div>;
}
