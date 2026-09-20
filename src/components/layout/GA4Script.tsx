"use client";

import { useEffect } from "react";

/**
 * Phase 7.2: Consent-gated GA4 loader.
 * Only injects the gtag.js script when ftf-cookie-consent=accepted.
 * If the user has not consented, nothing loads — no cookies, no tracking.
 *
 * Set NEXT_PUBLIC_GA4_ID in .env.local to activate. Without it, this
 * component is a no-op (safe to render unconditionally).
 */
const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID;

export default function GA4Script() {
  useEffect(() => {
    if (!GA4_ID) return;
    if (!document.cookie.includes("ftf-cookie-consent=accepted")) return;
    // Already loaded?
    if (document.getElementById("ga4-script")) return;

    const script = document.createElement("script");
    script.id = "ga4-script";
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function (...args: unknown[]) {
      window.dataLayer!.push(args);
    };
    window.gtag("js", new Date());
    window.gtag("config", GA4_ID, { anonymize_ip: true });
  }, []);

  // Also listen for consent being granted mid-session (banner accept click)
  useEffect(() => {
    if (!GA4_ID) return;
    const interval = setInterval(() => {
      if (document.cookie.includes("ftf-cookie-consent=accepted")) {
        clearInterval(interval);
        if (!document.getElementById("ga4-script")) {
          const script = document.createElement("script");
          script.id = "ga4-script";
          script.async = true;
          script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
          document.head.appendChild(script);
          window.dataLayer = window.dataLayer || [];
          window.gtag = function (...args: unknown[]) {
            window.dataLayer!.push(args);
          };
          window.gtag("js", new Date());
          window.gtag("config", GA4_ID, { anonymize_ip: true });
        }
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return null;
}
