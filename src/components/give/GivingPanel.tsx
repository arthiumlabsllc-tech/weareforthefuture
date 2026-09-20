"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, CreditCard, Smartphone, Shield, Repeat, Heart } from "lucide-react";
import PaystackCheckout from "@/components/ui/PaystackCheckout";
import { GIVING_AMOUNTS, GIVING_TIERS, DEFAULT_GIVING_AMOUNT } from "@/data/giving";

type Frequency = "one-time" | "monthly";
type Method = "paystack" | "momo";

interface GivingPanelProps {
  /** Metadata source tag recorded with the donation. */
  source: string;
  /** Human-readable name of what is being supported (programme/campaign/fund). */
  targetName: string;
  /** DonationCampaign id when giving toward a specific campaign. */
  campaignId?: string | null;
  /** Preselect recurring giving (e.g. the /give/monthly route). */
  defaultFrequency?: Frequency;
  /** Optional compact heading above the panel. */
  heading?: string;
}

/**
 * Reusable donation panel for the /give tree (Phase 5). Collects frequency,
 * amount and optional donor details, then hands off to the shared
 * <PaystackCheckout> which redirects to /donate/success on completion — the same
 * flow the legacy /donate page and Impact Store use, so Paystack routing,
 * verification and the webhook are unchanged.
 */
export default function GivingPanel({
  source,
  targetName,
  campaignId = null,
  defaultFrequency = "one-time",
  heading,
}: GivingPanelProps) {
  const [frequency, setFrequency] = useState<Frequency>(defaultFrequency);
  const [selected, setSelected] = useState<number | null>(DEFAULT_GIVING_AMOUNT);
  const [custom, setCustom] = useState("");
  const [method, setMethod] = useState<Method>("paystack");
  const [donorName, setDonorName] = useState("");
  const [message, setMessage] = useState("");
  const [anonymous, setAnonymous] = useState(false);

  const activeAmount = custom ? Number(custom) : selected;
  const impact = GIVING_TIERS.find((t) => t.amount === activeAmount)?.impact;

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm md:p-8">
      {heading && (
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-text-primary mb-6">
          {heading}
        </h2>
      )}

      {/* Frequency */}
      <fieldset className="mb-6">
        <legend className="text-xs font-semibold uppercase tracking-[0.15em] text-text-muted mb-2">
          Frequency
        </legend>
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-bg-tertiary p-1">
          {(["one-time", "monthly"] as Frequency[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFrequency(f)}
              aria-pressed={frequency === f}
              className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold capitalize transition-all ${
                frequency === f
                  ? "bg-primary text-text-on-primary shadow"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {f === "monthly" ? <Repeat className="h-4 w-4" /> : <Heart className="h-4 w-4" />}
              {f === "one-time" ? "One-time" : "Monthly"}
            </button>
          ))}
        </div>
        {frequency === "monthly" && (
          <p className="mt-2 text-xs text-text-muted">
            Monthly giving is the most effective way to sustain programme work.
          </p>
        )}
      </fieldset>

      {/* Amounts */}
      <fieldset className="mb-6">
        <legend className="text-xs font-semibold uppercase tracking-[0.15em] text-text-muted mb-2">
          Amount (GH₵)
        </legend>
        <div className="grid grid-cols-3 gap-2">
          {GIVING_AMOUNTS.map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => {
                setSelected(amt);
                setCustom("");
              }}
              aria-pressed={selected === amt && !custom}
              className={`rounded-xl border px-3 py-3 text-sm font-bold transition-all ${
                selected === amt && !custom
                  ? "border-accent bg-accent-subtle text-accent-text"
                  : "border-border bg-surface text-text-primary hover:border-accent/50"
              }`}
            >
              GH₵{amt.toLocaleString()}
            </button>
          ))}
        </div>
        <div className="mt-3">
          <label htmlFor="give-custom" className="sr-only">
            Custom amount in Ghana Cedis
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-text-muted">
              GH₵
            </span>
            <input
              id="give-custom"
              type="text"
              inputMode="numeric"
              placeholder="Other amount"
              value={custom}
              onChange={(e) => {
                setCustom(e.target.value.replace(/[^0-9]/g, ""));
                setSelected(null);
              }}
              className="w-full rounded-xl border border-border bg-surface py-3 pl-12 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
          </div>
        </div>
        {impact && (
          <p className="mt-3 flex items-start gap-2 text-sm text-text-secondary">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
            <span>{impact}</span>
          </p>
        )}
      </fieldset>

      {/* Method */}
      <fieldset className="mb-6">
        <legend className="text-xs font-semibold uppercase tracking-[0.15em] text-text-muted mb-2">
          Payment method
        </legend>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setMethod("paystack")}
            aria-pressed={method === "paystack"}
            className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
              method === "paystack"
                ? "border-accent bg-accent-subtle text-accent-text"
                : "border-border text-text-secondary hover:border-accent/50"
            }`}
          >
            <CreditCard className="h-4 w-4" />
            Card / Bank
          </button>
          <button
            type="button"
            onClick={() => setMethod("momo")}
            aria-pressed={method === "momo"}
            className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
              method === "momo"
                ? "border-accent bg-accent-subtle text-accent-text"
                : "border-border text-text-secondary hover:border-accent/50"
            }`}
          >
            <Smartphone className="h-4 w-4" />
            Mobile Money
          </button>
        </div>
      </fieldset>

      {/* Donor details (optional) */}
      <div className="mb-6 space-y-4">
        <div>
          <label htmlFor="give-name" className="block text-xs font-semibold uppercase tracking-[0.15em] text-text-muted mb-1.5">
            Name (optional)
          </label>
          <input
            id="give-name"
            type="text"
            value={donorName}
            onChange={(e) => setDonorName(e.target.value)}
            placeholder="Your name"
            className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          />
        </div>
        <div>
          <label htmlFor="give-message" className="block text-xs font-semibold uppercase tracking-[0.15em] text-text-muted mb-1.5">
            Message (optional)
          </label>
          <textarea
            id="give-message"
            rows={2}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Add a note of support"
            className="w-full resize-none rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          />
        </div>
        <label className="flex items-center gap-3 text-sm text-text-secondary">
          <input
            type="checkbox"
            checked={anonymous}
            onChange={(e) => setAnonymous(e.target.checked)}
            className="h-4 w-4 rounded border-border-strong text-accent focus:ring-accent/30"
          />
          Give anonymously
        </label>
      </div>

      {/* Checkout */}
      {activeAmount && activeAmount > 0 ? (
        <PaystackCheckout
          amount={activeAmount}
          label={
            method === "momo"
              ? `Give GH₵${activeAmount.toLocaleString()} via MoMo`
              : `Give GH₵${activeAmount.toLocaleString()}${frequency === "monthly" ? " / month" : ""}`
          }
          redirectOnSuccess
          source="donation"
          momoMode={method === "momo"}
          metadata={{
            source,
            frequency,
            donation_amount: activeAmount,
            payment_channel: method,
            target: targetName,
            campaign_id: campaignId ?? undefined,
            donor_name: donorName || undefined,
            donor_message: message || undefined,
            anonymous,
          }}
        />
      ) : (
        <button
          type="button"
          disabled
          className="w-full rounded-full bg-border-strong px-6 py-4 text-sm font-bold text-text-muted"
        >
          Select an amount first
        </button>
      )}

      <p className="mt-4 flex items-center justify-center gap-2 text-xs text-text-muted">
        <Shield className="h-3.5 w-3.5 text-success" />
        Secure &amp; tax-deductible. {` `}
        <span>501(c)(3) organization.</span>
      </p>
    </div>
  );
}
