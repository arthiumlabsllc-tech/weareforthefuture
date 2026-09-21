"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Send, Loader2 } from "lucide-react";
import { trackPartnerInquiry } from "@/lib/analytics";

const interests = [
  "Programme grant",
  "CSR / CSV partnership",
  "ESG & impact reporting",
  "Implementation partnership",
  "School / community partnership",
  "Employee volunteering",
  "In-kind support",
  "Research & learning",
  "Internships & fellowships",
  "Multi-year strategic alliance",
  "Something else",
];

/**
 * Partnership inquiry form for the institutional /partners page (Phase 5). Posts
 * to /api/contact, which persists a ContactSubmission. The chosen partnership
 * route becomes the `subject`; the organisation name is folded into the message
 * body so the admin inbox can triage without a schema change.
 */
export default function PartnerInquiryForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    organization: "",
    interest: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update =
    (key: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setFormData((prev) => ({ ...prev, [key]: e.target.value }));

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
      const composedMessage = formData.organization
        ? `${formData.message.trim()}\n\nOrganisation: ${formData.organization.trim()}`
        : formData.message.trim();
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || undefined,
          subject: formData.interest || "Partnership inquiry",
          message: composedMessage,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Unable to send your inquiry. Please try again.");
        return;
      }
      setSubmitted(true);
      trackPartnerInquiry(formData.organization);
    } catch {
      setError("Unable to send your inquiry. Please check your connection and try again.");
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
          Inquiry received
        </h3>
        <p className="mx-auto mt-2 max-w-md text-text-secondary">
          Thank you for your interest in partnering with For The Future
          Organization. Our partnerships team will respond within two business
          days.
        </p>
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
          Start the conversation
        </h3>
        <p className="mt-1.5 text-sm text-text-secondary">
          Tell us about your organisation and the partnership you have in mind.
          Our team will respond within two business days.
        </p>
      </div>

      {IS_PREVIEW && (
        <p
          role="status"
          className="rounded-xl border border-border bg-bg-tertiary px-4 py-3 text-sm text-text-secondary"
        >
          This is a preview build — form submissions are disabled.
        </p>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="pf-name" className={labelClass}>
            Full name <span className="text-error">*</span>
          </label>
          <input
            id="pf-name"
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
          <label htmlFor="pf-org" className={labelClass}>
            Organisation
          </label>
          <input
            id="pf-org"
            type="text"
            value={formData.organization}
            onChange={update("organization")}
            className={fieldClass}
            placeholder="Company / foundation / institution"
            autoComplete="organization"
          />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="pf-email" className={labelClass}>
            Work email <span className="text-error">*</span>
          </label>
          <input
            id="pf-email"
            type="email"
            required
            value={formData.email}
            onChange={update("email")}
            className={fieldClass}
            placeholder="you@organisation.com"
            autoComplete="email"
          />
        </div>
        <div>
          <label htmlFor="pf-phone" className={labelClass}>
            Phone
          </label>
          <input
            id="pf-phone"
            type="tel"
            value={formData.phone}
            onChange={update("phone")}
            className={fieldClass}
            placeholder="+233 XXX XXX XXX"
            autoComplete="tel"
          />
        </div>
      </div>

      <div>
        <label htmlFor="pf-interest" className={labelClass}>
          Partnership route <span className="text-error">*</span>
        </label>
        <select
          id="pf-interest"
          required
          value={formData.interest}
          onChange={update("interest")}
          className={fieldClass}
        >
          <option value="">Select a partnership route</option>
          {interests.map((i) => (
            <option key={i} value={i}>
              {i}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="pf-message" className={labelClass}>
          How can we work together? <span className="text-error">*</span>
        </label>
        <textarea
          id="pf-message"
          rows={5}
          required
          minLength={10}
          value={formData.message}
          onChange={update("message")}
          className={`${fieldClass} resize-none`}
          placeholder="Share your goals, timeline and the kind of partnership you're exploring…"
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
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-accent to-accent-hover px-8 py-4 text-base font-semibold text-navy-900 shadow-lg shadow-accent/20 transition-all hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
        {loading ? "Sending…" : IS_PREVIEW ? "Submissions disabled on preview" : "Send inquiry"}
      </button>
      <p className="text-center text-xs text-text-muted">
        We&apos;ll only use your details to respond to this inquiry. See our privacy commitments.
      </p>
    </motion.form>
  );
}
