/**
 * Phase 7.2: Analytics event helpers.
 *
 * Vercel Analytics (pageviews) is always active — it uses no cookies and is
 * privacy-friendly. GA4 is loaded ONLY after the user accepts cookies via the
 * consent banner (ftf-cookie-consent=accepted).
 *
 * Conversion events fire through whichever provider is active:
 * - trackEvent() always sends to Vercel Analytics (custom events).
 * - If GA4 is loaded, it also sends via gtag().
 */

// Vercel Analytics custom event tracking
import { track } from "@vercel/analytics";

/** Check whether the user has accepted cookies (GA4 consent gate). */
export function hasConsent(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.includes("ftf-cookie-consent=accepted");
}

/** Track a conversion/custom event. Always fires to Vercel Analytics; GA4 only with consent. */
export function trackEvent(name: string, data?: Record<string, string | number | boolean>) {
  // Vercel Analytics (no consent needed — privacy-friendly, no cookies)
  track(name, data);

  // GA4 (consent-gated)
  if (hasConsent() && typeof window !== "undefined" && window.gtag) {
    window.gtag("event", name, data);
  }
}

// ─── Named conversion events ───

/** Fired when Paystack checkout is initialised (Give / Impact Store). */
export function trackGiveInitiated(amount: number, frequency?: string) {
  trackEvent("give_initiated", { amount, frequency: frequency ?? "one-time" });
}

/** Fired on successful volunteer form submission. */
export function trackVolunteerSubmit(role?: string) {
  trackEvent("volunteer_submit", { role: role ?? "general" });
}

/** Fired on successful partner inquiry submission. */
export function trackPartnerInquiry(org?: string) {
  trackEvent("partner_inquiry", { org: org ?? "unknown" });
}

/** Fired on successful newsletter signup. */
export function trackNewsletterSignup() {
  trackEvent("newsletter_signup");
}

// ─── GA4 type augmentation ───
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}
