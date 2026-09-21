"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Send, Loader2 } from "lucide-react";
import { trackVolunteerSubmit } from "@/lib/analytics";

export interface InterestOption {
  value: string;
  label: string;
}

interface VolunteerApplicationFormProps {
  /** Options for the "area of interest" select. */
  interestOptions: InterestOption[];
  /** Preselect an interest (e.g. "fellowship", "mentorship"). */
  defaultInterest?: string;
  /** Copy shown above the form. */
  title?: string;
  description?: string;
  submitLabel?: string;
  successTitle?: string;
  successBody?: string;
  /** Small note under the submit button (e.g. safeguarding / response time). */
  footnote?: string;
}

/**
 * Shared application/interest form for the /get-involved tree (Phase 5). Posts to
 * /api/volunteer, which persists a VolunteerApplication row (name/email/phone/
 * country/interest/message). The `interest` value distinguishes the pathway
 * (volunteering / fellowship / mentorship) so the same model serves all three.
 */
export default function VolunteerApplicationForm({
  interestOptions,
  defaultInterest = "",
  title = "Apply to get involved",
  description = "Tell us a little about yourself and our team will be in touch within 48 hours.",
  submitLabel = "Submit application",
  successTitle = "Application received",
  successBody = "Thank you for your interest in For The Future Organization. Our team will review your details and get back to you within 48 hours.",
  footnote,
}: VolunteerApplicationFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    country: "",
    interest: defaultInterest,
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (key: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setFormData((prev) => ({ ...prev, [key]: e.target.value }));

  // Build-time deployment flag (baked via next.config `env`): true on Vercel
  // preview/branch builds and locally, false only on production builds. Lets the
  // form show a clear notice and skip a doomed request; the API route's 403 is
  // the bypass-proof backstop.
  const IS_PREVIEW = process.env.NEXT_PUBLIC_DEPLOY_ENV !== "production";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (IS_PREVIEW) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/volunteer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Unable to submit your application. Please try again.");
        return;
      }
      setSubmitted(true);
      trackVolunteerSubmit(formData.interest);
    } catch {
      setError("Unable to submit your application. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl border border-success/20 bg-surface p-10 text-center md:p-12"
      >
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success-bg">
          <Check className="h-8 w-8 text-success-text" />
        </div>
        <h3 className="font-[family-name:var(--font-display)] text-2xl font-bold text-text-primary">
          {successTitle}
        </h3>
        <p className="mx-auto mt-2 max-w-md text-text-secondary">{successBody}</p>
      </motion.div>
    );
  }

  const fieldClass =
    "w-full rounded-xl border border-border-strong bg-surface px-4 py-3 text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20";
  const labelClass = "mb-2 block text-sm font-medium text-text-secondary";

  return (
    <motion.form
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5 }}
      onSubmit={handleSubmit}
      className="space-y-6 rounded-2xl border border-border bg-surface p-8 md:p-10"
    >
      <div>
        <h3 className="font-[family-name:var(--font-display)] text-2xl font-bold text-text-primary">
          {title}
        </h3>
        <p className="mt-1.5 text-sm text-text-secondary">{description}</p>
      </div>

      {IS_PREVIEW && (
        <p
          role="status"
          className="rounded-xl border border-border bg-bg-tertiary px-4 py-3 text-sm text-text-secondary"
        >
          This is a preview build - form submissions are disabled.
        </p>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="gif-name" className={labelClass}>
            Full name <span className="text-error">*</span>
          </label>
          <input
            id="gif-name"
            type="text"
            required
            minLength={2}
            value={formData.name}
            onChange={update("name")}
            className={fieldClass}
            placeholder="Your full name"
            autoComplete="name"
          />
        </div>
        <div>
          <label htmlFor="gif-email" className={labelClass}>
            Email address <span className="text-error">*</span>
          </label>
          <input
            id="gif-email"
            type="email"
            required
            value={formData.email}
            onChange={update("email")}
            className={fieldClass}
            placeholder="you@example.com"
            autoComplete="email"
          />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="gif-phone" className={labelClass}>
            Phone number
          </label>
          <input
            id="gif-phone"
            type="tel"
            value={formData.phone}
            onChange={update("phone")}
            className={fieldClass}
            placeholder="+233 XXX XXX XXX"
            autoComplete="tel"
          />
        </div>
        <div>
          <label htmlFor="gif-country" className={labelClass}>
            Country <span className="text-error">*</span>
          </label>
          <select
            id="gif-country"
            required
            value={formData.country}
            onChange={update("country")}
            className={fieldClass}
          >
            <option value="">Select country</option>
            <option value="Ghana">Ghana</option>
            <option value="Nigeria">Nigeria</option>
            <option value="United States">United States</option>
            <option value="United Kingdom">United Kingdom</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="gif-interest" className={labelClass}>
          Area of interest <span className="text-error">*</span>
        </label>
        <select
          id="gif-interest"
          required
          value={formData.interest}
          onChange={update("interest")}
          className={fieldClass}
        >
          {!defaultInterest && <option value="">Select an area</option>}
          {interestOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="gif-message" className={labelClass}>
          Tell us about yourself
        </label>
        <textarea
          id="gif-message"
          rows={4}
          value={formData.message}
          onChange={update("message")}
          className={`${fieldClass} resize-none`}
          placeholder="Share your skills, experience and why you'd like to get involved with FTF…"
        />
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-xl border border-error/20 bg-error/5 px-4 py-3 text-sm text-error"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || IS_PREVIEW}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-cta px-8 py-4 text-base font-semibold text-on-cta shadow-lg shadow-accent/20 transition-all hover:bg-cta-hover hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
        {loading ? "Submitting…" : IS_PREVIEW ? "Submissions disabled on preview" : submitLabel}
      </button>

      {footnote && <p className="text-center text-xs text-text-muted">{footnote}</p>}
    </motion.form>
  );
}
