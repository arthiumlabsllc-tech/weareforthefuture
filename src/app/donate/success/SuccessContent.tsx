"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { useSearchParams } from "next/navigation";
/* eslint-disable @next/next/no-html-link-for-pages -- Receipt exits cross the private-document analytics boundary. */
import { caseReceiptSchema, caseReceiptMessage, canCelebrateCaseReceipt, formatGhs, type CaseReceipt } from "@/lib/support-a-future/domain";
import { chartColors, confettiColors } from "@/lib/chartColors";
import { cardClasses, cardPadding } from "@/lib/ui/cardClasses";
import { siteConfig } from "@/data/site";
import { Check, AlertCircle, ArrowRight, Copy, Mail } from "lucide-react";

interface VerifiedTransaction {
  status: string;
  amount: number;
  currency: string;
  paidAt: string;
  channel: string;
  customer: {
    email: string;
    first_name?: string;
    last_name?: string;
  };
  gatewayResponse: string;
  paymentKind: "case" | "donation" | "store";
  caseReceipt: CaseReceipt | null;
}

const CELEBRATION_KEY = "ftf:donation-celebration:v1";

function claimCelebration(isStore: boolean): boolean {
  if (isStore) return false;
  try {
    const seen = sessionStorage.getItem(CELEBRATION_KEY) === "1";
    sessionStorage.setItem(CELEBRATION_KEY, "1");
    return !seen && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    // Without session storage, keep the receipt static rather than replaying.
    return false;
  }
}

function CelebrationCanvas({ cardRef }: { cardRef: RefObject<HTMLDivElement | null> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const styles = getComputedStyle(canvas);
    const allowed = new Set<string>([chartColors.accent, chartColors.primary, chartColors.charcoal, chartColors.bright]);
    const colors = confettiColors.filter((color) => allowed.has(color)).map((color) =>
      styles.getPropertyValue(color.slice(4, -1)).trim()
    );
    let width = 0;
    let height = 0;
    let cardWidth = 0;
    let frame = 0;
    let disposed = false;
    const measure = () => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      cardWidth = cardRef.current?.offsetWidth ?? width;
      const ratio = window.devicePixelRatio || 1;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    measure();
    const resize = new ResizeObserver(measure);
    resize.observe(canvas);
    const particles = Array.from({ length: 44 }, (_, i) => ({
      side: i % 2 ? 1 : -1,
      spread: 0.25 + Math.random() * 0.75,
      lift: 15 + Math.random() * 55,
      fall: 180 + Math.random() * 210,
      rotation: Math.random() * Math.PI,
      size: 4 + Math.random() * 3,
      color: colors[i % colors.length],
    }));
    const start = performance.now() + 500;
    const draw = (now: number) => {
      if (disposed) return;
      const progress = Math.min(1, Math.max(0, (now - start) / 1500));
      context.clearRect(0, 0, width, height);
      if (progress >= 1) return;
      context.save();
      context.beginPath();
      context.rect(0, 0, width, height);
      // Exclude the receipt footprint, even while its surface is fading in.
      context.rect((width - cardWidth) / 2 - 2, 56, cardWidth + 4, height);
      context.clip("evenodd");
      context.globalAlpha = Math.min(1, (1 - progress) * 2);
      const travel = 1 - Math.pow(1 - progress, 3);
      for (const particle of particles) {
        const x = width / 2 + particle.side * (30 + travel * width * 0.48 * particle.spread);
        const y = 46 - Math.sin(progress * Math.PI) * particle.lift + progress * progress * particle.fall;
        context.save();
        context.translate(x, y);
        context.rotate(particle.rotation + particle.side * progress * 3);
        context.fillStyle = particle.color;
        context.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size * 1.4);
        context.restore();
      }
      context.restore();
      frame = requestAnimationFrame(draw);
    };
    const timer = window.setTimeout(() => { frame = requestAnimationFrame(draw); }, 500);
    return () => {
      disposed = true;
      clearTimeout(timer);
      cancelAnimationFrame(frame);
      resize.disconnect();
      context.clearRect(0, 0, width, height);
    };
  }, [cardRef]);

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute -inset-x-6 -top-6 h-[480px] w-[calc(100%+3rem)] motion-reduce:hidden" />;
}

function VerifiedReceipt({ reference, isStore, transaction, celebrate }: {
  reference: string;
  isStore: boolean;
  transaction: VerifiedTransaction;
  celebrate: boolean;
}) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(celebrate);
  const [actionsRevealed, setActionsRevealed] = useState(false);
  const [shareMessage, setShareMessage] = useState("");
  const [manualLink, setManualLink] = useState("");

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    if (!playing) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const stop = () => setPlaying(false);
    const onChange = () => { if (preference.matches) stop(); };
    if (preference.matches) stop();
    preference.addEventListener("change", onChange);
    const timer = window.setTimeout(stop, 2000);
    return () => {
      clearTimeout(timer);
      preference.removeEventListener("change", onChange);
    };
  }, [playing]);

  const share = async () => {
    const url = new URL("/give", window.location.origin).href;
    try {
      await navigator.clipboard.writeText(url);
      setManualLink("");
      setShareMessage("Support link copied. Thank you for sharing.");
    } catch {
      setManualLink(url);
      setShareMessage("Copy the support link below to share.");
    }
  };
  const firstName = typeof transaction.customer?.first_name === "string" ? transaction.customer.first_name.trim() : "";
  const email = typeof transaction.customer?.email === "string" ? transaction.customer.email : "";
  const date = transaction.paidAt ? new Date(transaction.paidAt) : null;
  const channel = typeof transaction.channel === "string" ? transaction.channel.replaceAll("_", " ") : "Not provided";
  const amount = new Intl.NumberFormat("en-GH", { style: "currency", currency: transaction.currency, currencyDisplay: "code" }).format(transaction.amount);
  const caseReceipt = transaction.caseReceipt;
  const allocation = caseReceipt?.allocation;
  const actionClass = "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-colors duration-200 motion-reduce:transition-none! motion-reduce:duration-0!";

  return (
    <div data-celebration={playing ? "playing" : "static"} className={playing ? "celebration" : ""}>
      <h1 ref={headingRef} tabIndex={-1} className="rounded-lg font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
        {caseReceipt ? "Case payment record" : isStore ? "Payment confirmed" : "Donation confirmed"}
      </h1>
      <p className="mx-auto mt-4 max-w-lg text-base text-text-secondary">
        {caseReceipt ? caseReceiptMessage(caseReceipt) : isStore ? "Your purchase supports our programmes. Thank you for being part of our community."
          : "Your generosity supports learning, dignity and opportunity for children and young people."}
      </p>

      <div className="relative isolate mt-8 pt-8">
        {playing && <CelebrationCanvas cardRef={cardRef} />}
        <div data-celebration-check aria-hidden="true" className="celebration-check absolute inset-x-0 top-0 z-20 mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-success bg-success-bg text-success">
          <Check className="h-8 w-8" strokeWidth={2.5} />
        </div>
        <div ref={cardRef} data-celebration-card className={`celebration-card relative z-10 ${cardClasses} ${cardPadding.feature} text-left`}>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-3 border-b border-border pb-6">
            <h2 className="text-sm font-medium text-text-secondary">{caseReceipt ? "Original payment" : isStore ? "Payment receipt" : "Donation receipt"}</h2>
            <p className="break-all text-3xl font-semibold tabular-nums tracking-tight text-text-primary">{amount}</p>
          </div>
          <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
            <div className="col-span-2">
              <dt className="text-xs text-text-secondary">Reference</dt>
              <dd className="mt-1 break-all font-mono text-text-primary">{reference}</dd>
            </div>
            <div>
              <dt className="text-xs text-text-secondary">Payment method</dt>
              <dd className="mt-1 break-words capitalize text-text-primary">{channel || "Not provided"}</dd>
            </div>
            <div>
              <dt className="text-xs text-text-secondary">Status</dt>
              <dd className={`mt-1 font-semibold ${caseReceipt ? "text-text-primary" : "text-success-text"}`}>{caseReceipt ? "See allocation status" : "Successful"}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-xs text-text-secondary">Date</dt>
              <dd className="mt-1 text-text-primary">{date && Number.isFinite(date.getTime()) ? date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "Not provided"}</dd>
            </div>
          </dl>
          {allocation && <section className="mt-6 border-t border-border pt-6" aria-labelledby="case-allocation-heading">
            <h3 id="case-allocation-heading" className="font-semibold text-text-primary">Recorded allocation</h3>
            <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
              {([
                ["Original case credit", allocation.creditedAmount], ["Original excess", allocation.excessAmount],
                ["Completed excess refund", allocation.refundedAmount], ["Completed consented redirects", allocation.redirectedAmount],
                ["Excess still held", allocation.heldAmount], ["Retained funds (including held excess)", allocation.retainedAmount],
                ["Allocated giving (excludes held excess)", allocation.allocatedAmount],
              ] as const).map(([label, value]) => <div key={label}><dt className="text-text-secondary">{label}</dt>
                <dd className="mt-1 tabular-nums text-text-primary">{value === null ? "Awaiting reconciliation" : formatGhs(value)}</dd></div>)}
            </dl>
            <p className="mt-4 text-sm text-text-secondary">Held excess is not allocated giving. Requested refunds are shown as completed only after provider confirmation.</p>
            {allocation.heldAmount > 0 && !allocation.financialHold && !allocation.resolutionState && allocation.refundDueAt && <p className="mt-3 text-sm text-text-secondary">Choice deadline: {new Date(allocation.refundDueAt).toLocaleDateString("en-GB")}. If no choice is recorded, a daily process requests an excess refund after this date. Provider processing takes additional time.</p>}
          </section>}
          {caseReceipt && <div className="mt-6 flex flex-wrap gap-3 border-t border-border pt-4">
            <button type="button" onClick={() => window.location.reload()} className={`${actionClass} border border-border text-text-primary hover:bg-surface-hover`}>Check current status</button>
            <a href="/contact" className={`${actionClass} text-text-link underline`}>Contact FTF</a>
          </div>}
          {email && <p className="mt-6 break-words border-t border-border pt-4 text-xs text-text-secondary">Payment email: {email}</p>}
        </div>
      </div>

      <p data-celebration-thanks className="celebration-thanks mt-8 break-words font-[family-name:var(--font-display)] text-2xl leading-snug text-text-primary sm:text-3xl">
        {isStore ? "Thank you for your support." : firstName ? `Thank you, ${firstName}.` : "Thank you for your generosity."}
      </p>
      {!isStore && <p className="mt-3 text-xs text-text-secondary">{siteConfig.legal.taxNote}</p>}
      <div data-celebration-actions onFocusCapture={() => setActionsRevealed(true)} className={`celebration-actions ${actionsRevealed ? "actions-revealed" : ""} mt-6 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap`}>
        {isStore ? (
          <>
            <a href="/impact-store" className={`${actionClass} bg-cta text-on-cta hover:bg-cta-hover`}>Continue shopping</a>
            <a href="/" className={`${actionClass} text-text-primary hover:bg-bg-tertiary`}>Back to home</a>
          </>
        ) : (
          <>
            <button type="button" onClick={share} className={`${actionClass} border border-border bg-surface text-text-primary hover:bg-surface-hover`}>
              <Copy aria-hidden="true" className="h-4 w-4" /> Share your support
            </button>
            <a href="/impact" className={`${actionClass} bg-cta text-on-cta hover:bg-cta-hover`}>
              {caseReceipt ? "Explore FTF’s work" : "See your impact"} <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </a>
            <a href="/give" className={`${actionClass} text-accent-text hover:bg-bg-tertiary`}>Give again</a>
          </>
        )}
      </div>
      <p role="status" aria-live="polite" aria-atomic="true" className="mt-3 min-h-5 text-sm text-text-secondary">{shareMessage}</p>
      {manualLink && (
        <label className="mt-3 block text-left text-sm text-text-secondary">
          Support link
          <input readOnly value={manualLink} onFocus={(event) => event.currentTarget.select()} className="mt-2 w-full rounded-lg border border-border-strong bg-surface p-3 text-text-primary" />
        </label>
      )}
      <style jsx>{`
        .celebration .celebration-check { animation: verified-check 300ms ease-out 200ms both; }
        .celebration .celebration-card { animation: receipt-reveal 400ms ease-out 700ms both; }
        .celebration .celebration-thanks { animation: celebration-fade 300ms ease-out 1200ms both; }
        .celebration .celebration-actions { animation: celebration-fade 200ms ease-out 1800ms both; }
        .celebration .celebration-actions:focus-within, .celebration .actions-revealed { animation: none; opacity: 1; }
        @keyframes verified-check { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
        @keyframes receipt-reveal { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes celebration-fade { from { opacity: 0; } to { opacity: 1; } }
        @media (prefers-reduced-motion: reduce) {
          .celebration-check, .celebration-card, .celebration-thanks, .celebration-actions {
            animation: none !important;
            animation-duration: 0s !important;
            animation-delay: 0s !important;
            transition: none !important;
            transition-duration: 0s !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>
    </div>
  );
}

type VerificationState =
  | { kind: "loading" }
  | { kind: "pending"; message: string }
  | { kind: "verified"; transaction: VerifiedTransaction; celebrate: boolean };

export default function SuccessContent() {
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference") || "";
  const isStore = searchParams.get("source") === "store";
  return <VerificationResult key={`${isStore}:${reference}`} reference={reference} isStore={isStore} />;
}

function VerificationResult({ reference, isStore }: { reference: string; isStore: boolean }) {
  const [state, setState] = useState<VerificationState>(reference ? { kind: "loading" } : {
    kind: "pending",
    message: "No transaction reference found. If you completed a payment, please contact us.",
  });

  useEffect(() => {
    if (!reference) return;
    const controller = new AbortController();
    const verify = async () => {
      try {
        const res = await fetch("/api/paystack/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reference }),
          signal: controller.signal,
          cache: "no-store",
        });
        const data = await res.json();
        if (controller.signal.aborted) return;
        const caseReceipt = data.paymentKind === "case" ? caseReceiptSchema.parse(data.caseReceipt) : null;
        if (res.ok && data.success === true && data.verified === true && (data.status === "success" || caseReceipt?.state === "allocated")
          && ["case", "donation", "store"].includes(data.paymentKind)
          && typeof data.amount === "number" && Number.isSafeInteger(data.amount) && data.amount > 0
          && (!caseReceipt?.allocation || caseReceipt.allocation.originalAmount === data.amount)
          && typeof data.currency === "string" && /^[A-Z]{3}$/.test(data.currency)) {
          const eligible = data.paymentKind === "donation" || (caseReceipt && canCelebrateCaseReceipt(caseReceipt));
          setState({
            kind: "verified",
            transaction: { ...data, caseReceipt, amount: data.amount / 100 },
            celebrate: !!eligible && claimCelebration(data.paymentKind === "store"),
          });
        } else {
          setState({ kind: "pending", message: "We couldn't verify this transaction. Your payment may still be processing. Please contact us with your reference before trying again." });
        }
      } catch {
        if (!controller.signal.aborted) {
          setState({ kind: "pending", message: "Verification is unavailable. Your payment may still be processing. Please check your email or contact us before trying again." });
        }
      }
    };
    void verify();
    return () => controller.abort();
  }, [reference, isStore]);

  return (
    <div className="mx-auto max-w-[620px] text-center" data-verification={state.kind}>
      <p role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {state.kind === "verified" ? (state.transaction.caseReceipt ? caseReceiptMessage(state.transaction.caseReceipt) : state.transaction.paymentKind === "store" ? "Payment confirmed. Your purchase was successful." : "Donation confirmed. Thank you for your generosity.")
          : state.kind === "loading" ? "Verifying your payment." : state.message}
      </p>
      {state.kind === "loading" && (
        <div aria-busy="true">
          <h1 className="font-[family-name:var(--font-display)] text-3xl text-text-primary">Verifying your payment...</h1>
          <p className="mt-4 text-text-secondary">Please wait while we confirm your transaction.</p>
        </div>
      )}
      {state.kind === "pending" && (
        <div className={`${cardClasses} ${cardPadding.feature}`}>
          <AlertCircle aria-hidden="true" className="mx-auto mb-6 h-10 w-10 text-warning-text" />
          <h1 className="font-[family-name:var(--font-display)] text-3xl text-text-primary">Verification pending</h1>
          <p className="mt-4 text-text-secondary">{state.message}</p>
          {reference && <p className="mt-6 break-all text-sm text-text-secondary">Reference: <span className="font-mono">{reference}</span></p>}
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <a href="/contact" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-cta px-6 py-3 text-sm font-semibold text-on-cta hover:bg-cta-hover">
              <Mail aria-hidden="true" className="h-4 w-4" /> Contact support
            </a>
            <a href="/" className="inline-flex min-h-11 items-center justify-center rounded-full border border-border px-6 py-3 text-sm font-semibold text-text-primary hover:bg-bg-tertiary">Back to home</a>
          </div>
        </div>
      )}
      {state.kind === "verified" && <VerifiedReceipt reference={reference} isStore={state.transaction.paymentKind === "store"} transaction={state.transaction} celebrate={state.celebrate} />}
    </div>
  );
}
