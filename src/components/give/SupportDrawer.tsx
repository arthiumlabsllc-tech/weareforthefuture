"use client";

/* eslint-disable @next/next/no-html-link-for-pages -- Payment and case routes require a clean document navigation boundary. */
import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { z } from "zod";
import { formatGhs, initializeCaseSchema, parseGhs } from "@/lib/support-a-future/domain";
import { caseOutline, casePrimary } from "./BeneficiaryCard";
import { fetchCase, resumeCasePayment, useFreshCase } from "./case-client";
const initializedSchema = z.object({ success: z.literal(true), reference: z.string().regex(/^FTF-SAF-[a-zA-Z0-9-]+$/), accessCode: z.string().min(1).max(200) });
const inputClass = "mt-2 min-h-12 w-full rounded-xl border border-border-strong bg-surface px-4 py-3 text-base text-text-primary";

export default function SupportDrawer({ publicId, onClose }: { publicId: string; onClose: () => void }) {
  const { detail, pending: checking, error: checkError, refresh } = useFreshCase(publicId, null);
  const [values, setValues] = useState({ amount: "", email: "", phone: "", channel: "card" });
  const [issues, setIssues] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [providerOpen, setProviderOpen] = useState(false);
  const [payment, setPayment] = useState<z.infer<typeof initializedSchema> | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const status = useRef<HTMLParagraphElement>(null);
  const mounted = useRef(false);
  const busy = useRef(false);
  const controller = useRef<AbortController | null>(null);
  const stopProvider = useRef<(() => void) | null>(null);
  const closing = useRef(false);

  useEffect(() => {
    mounted.current = true;
    const node = dialog.current!;
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const overflow = document.body.style.overflow;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const stopMotion = () => { if (media.matches) node.getAnimations().forEach((animation) => animation.finish()); };
    node.showModal(); heading.current?.focus({ preventScroll: true });
    document.body.style.overflow = "hidden";
    if (!media.matches) node.animate([{ transform: "translateX(100%)" }, { transform: "translateX(0)" }], { duration: 250, easing: "ease-out" });
    media.addEventListener("change", stopMotion);
    void refresh();
    return () => {
      mounted.current = false; controller.current?.abort();
      stopProvider.current?.();
      media.removeEventListener("change", stopMotion); node.getAnimations().forEach((animation) => animation.cancel());
      node.close(); document.body.style.overflow = overflow;
      if (trigger?.isConnected) trigger.focus({ preventScroll: true });
      else (document.getElementById("case-browser-heading") ?? document.getElementById("case-detail-content"))?.focus({ preventScroll: true });
    };
  }, [refresh]);

  async function close() {
    if (closing.current) return;
    closing.current = true; controller.current?.abort();
    if (dialog.current && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      await dialog.current.animate([{ transform: "translateX(0)" }, { transform: "translateX(100%)" }], { duration: 200, easing: "ease-in" }).finished.catch(() => {});
    }
    onClose();
  }

  function restore(text: string) {
    if (!mounted.current || closing.current) return;
    busy.current = false;
    setProviderOpen(false); setPending(false); setMessage(text);
    dialog.current?.showModal(); heading.current?.focus({ preventScroll: true });
    void refresh();
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current || closing.current || checking || !detail?.fundable || !detail.checkoutEnabled) return;
    const amount = parseGhs(values.amount);
    const parsed = initializeCaseSchema.safeParse({ publicId, amountInPesewas: amount, email: values.email.trim(), channel: values.channel,
      ...(values.channel === "mobile_money" && values.phone ? { phone: values.phone.trim() } : {}) });
    const fields: Record<string, string> = {};
    if (!parsed.success) for (const issue of parsed.error.issues) fields[String(issue.path[0]) === "amountInPesewas" ? "amount" : String(issue.path[0])] = issue.message;
    if (!amount) fields.amount = "Enter a positive amount with no more than two decimal places.";
    else if (!payment && amount > detail.case.amountNeeded - detail.case.amountRaised) fields.amount = "Enter an amount no greater than the remaining need.";
    if (Object.keys(fields).length) { setIssues(fields); setMessage("Check the marked fields before continuing."); return; }
    busy.current = true; setPending(true); setMessage(""); setIssues({});
    const request = new AbortController(); controller.current = request;
    try {
      // Do not import the provider until an explicit Pay action and an enabled checkout.
      const { default: Paystack } = await import("@paystack/inline-js");
      const latest = await fetchCase(publicId, AbortSignal.any([request.signal, AbortSignal.timeout(15000)]));
      if (!latest?.fundable || !latest.checkoutEnabled) { await refresh(); throw new Error("This need is no longer accepting payments."); }
      let bound = payment;
      if (!bound) {
        const response = await fetch("/api/support-a-future/initialize", { method: "POST", cache: "no-store", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(parsed.data), signal: AbortSignal.any([request.signal, AbortSignal.timeout(20000)]) });
        const result = await response.json();
        if (!response.ok) {
          if (Array.isArray(result.fields)) setIssues(Object.fromEntries(result.fields.map((field: { field: string; message: string }) => [field.field === "amountInPesewas" ? "amount" : field.field, field.message])));
          await refresh();
          throw new Error(typeof result.error === "string" ? result.error : "Checkout could not open. Please try again.");
        }
        bound = initializedSchema.parse(result);
        if (!mounted.current || request.signal.aborted || closing.current) return;
        setPayment(bound);
      }
      if (!mounted.current || request.signal.aborted || closing.current) return;
      const reference = bound.reference;
      const instance = new Paystack();
      stopProvider.current?.();
      // Release the native modal's top layer and focus trap before Paystack takes ownership.
      dialog.current?.close(); setProviderOpen(true);
      stopProvider.current = resumeCasePayment(instance, bound.accessCode, () => {
        if (!mounted.current || closing.current) return;
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- Leave the private payment document without client-router history capture.
        window.location.assign(`/donate/success?reference=${encodeURIComponent(reference)}&source=donation`);
      }, restore);
    } catch (error) {
      if (mounted.current && !request.signal.aborted && !closing.current) {
        setMessage(error instanceof Error && error.name === "Error" ? error.message : "Checkout could not be confirmed. Your entries remain here; check with your payment provider before trying again.");
        setProviderOpen(false); setPending(false); busy.current = false;
        if (!dialog.current?.open) dialog.current?.showModal();
        status.current?.focus({ preventScroll: true });
      }
    }
  }

  const remaining = detail ? detail.case.amountNeeded - detail.case.amountRaised : 0;
  const enabled = !!detail?.fundable && detail.checkoutEnabled;
  return <>
    {providerOpen && <p role="status" className="mt-4 text-text-secondary">Payment checkout is open. Complete or close it in the payment provider’s window.</p>}
    <dialog ref={dialog} aria-labelledby="support-drawer-heading" aria-describedby="support-drawer-help"
      onCancel={(event) => { event.preventDefault(); void close(); }}
      className="fixed inset-y-0 left-auto right-0 m-0 h-dvh max-h-none w-full max-w-lg overflow-y-auto overscroll-contain border-l border-border bg-surface p-6 text-text-primary shadow-xl backdrop:bg-bg-overlay sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <h2 id="support-drawer-heading" ref={heading} tabIndex={-1} className="font-[family-name:var(--font-display)] text-3xl">Support this need</h2>
        <button type="button" onClick={() => void close()} aria-label="Close support drawer" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full hover:bg-bg-tertiary"><X aria-hidden="true" /></button>
      </div>
      <p id="support-drawer-help" className="mt-4 text-text-secondary">FTF administers the gift. Opening this drawer does not charge you or create direct contact with a beneficiary.</p>
      <div className="my-6 space-y-3" aria-busy={checking}>
        {checking ? <p role="status">Checking current consent and funding…</p> : checkError ? <p role="alert" className="text-error-text">{checkError}</p> : !detail ? <p role="status">This case is unavailable. No new payment can be started.</p> : <>
          <p className="text-lg font-semibold">{detail.case.displayName} · {detail.case.publicId}</p>
          <p className="tabular-nums text-text-secondary">{formatGhs(remaining)} remaining</p>
          {!detail.fundable && <p role="status">This need is no longer accepting support.</p>}
          {!detail.checkoutEnabled && <p role="status" className="rounded-xl bg-info-bg p-4 text-info-text">Case giving is not open yet. You can still read approved needs or choose another giving route.</p>}
        </>}
        <button type="button" aria-disabled={checking || pending} className={caseOutline} onClick={() => { if (!checking && !pending) void refresh(); }}>Check current status</button>
      </div>
      <form onSubmit={submit} className="space-y-5" noValidate>
        {enabled && <fieldset disabled={pending || !!payment} className="space-y-5">
          <legend className="mb-4 font-semibold">One-time gift in Ghana cedis</legend>
          <label className="block text-text-secondary" htmlFor="case-amount">Amount (GH₵), required
            <input id="case-amount" name="amount" inputMode="decimal" required value={values.amount} maxLength={14} onChange={(event) => setValues({ ...values, amount: event.target.value })} className={inputClass} aria-invalid={!!issues.amount} aria-describedby="case-amount-help case-amount-error" />
          </label>
          <p id="case-amount-help" className="text-sm text-text-secondary">Up to {formatGhs(remaining)}. The amount is checked again before checkout.</p>
          <p id="case-amount-error" className="text-sm text-error-text">{issues.amount}</p>
          <label className="block text-text-secondary" htmlFor="case-email">Email, required
            <input id="case-email" name="email" type="email" autoComplete="email" required maxLength={254} value={values.email} onChange={(event) => setValues({ ...values, email: event.target.value })} className={inputClass} aria-invalid={!!issues.email} aria-describedby="case-email-error" />
          </label>
          <p id="case-email-error" className="text-sm text-error-text">{issues.email}</p>
          <label className="block text-text-secondary" htmlFor="case-channel">Payment method
            <select id="case-channel" value={values.channel} onChange={(event) => setValues({ ...values, channel: event.target.value })} className={inputClass}>
              <option value="card">Card</option><option value="mobile_money">Mobile Money</option><option value="bank_transfer">Bank transfer</option>
            </select>
          </label>
          {values.channel === "mobile_money" && <><label className="block text-text-secondary" htmlFor="case-phone">Mobile Money number (optional)
            <input id="case-phone" type="tel" autoComplete="tel" value={values.phone} maxLength={16} onChange={(event) => setValues({ ...values, phone: event.target.value })} className={inputClass} aria-invalid={!!issues.phone} aria-describedby="case-phone-error" />
          </label><p id="case-phone-error" className="text-sm text-error-text">{issues.phone}</p></>}
        </fieldset>}
        <p className="text-sm text-text-secondary">Another gift may arrive before yours clears. Your valid case allocation stays intact. Any excess can be refunded or redirected to the general fund or another eligible case only with your consent. Taking no action starts an excess refund after the 14-day choice window; daily processing and provider settlement take additional time.</p>
        {enabled && <button type="submit" disabled={pending || checking} className={`${casePrimary} w-full`}>{pending ? "Opening checkout…" : payment ? "Resume the same payment" : `Pay${parseGhs(values.amount) ? ` ${formatGhs(parseGhs(values.amount)!)}` : " with Paystack"}`}</button>}
        {payment && <a className={caseOutline} href={`/donate/success?reference=${encodeURIComponent(payment.reference)}&source=donation`}>Check payment status</a>}
        <p ref={status} tabIndex={-1} role="status" className="text-text-secondary">{message}</p>
        <a href="/give" className="inline-flex min-h-11 items-center text-text-link underline">Other giving routes</a>
      </form>
    </dialog>
  </>;
}
