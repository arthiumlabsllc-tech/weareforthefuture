"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";

const COOKIE_NAME = "ftf-cookie-consent";
const COOKIE_VALUE = "accepted";
const MAX_AGE = 60 * 60 * 24 * 365; // 1 year

function getCookie(name: string): string | undefined {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match?.[2];
}

function setCookie(name: string, value: string, maxAge: number) {
  document.cookie = `${name}=${value};path=/;max-age=${maxAge};SameSite=Lax`;
}

/**
 * Phase 7.1: Non-blocking cookie consent banner.
 * - Renders only if the consent cookie is unset.
 * - Dismissible without action (close button just hides for the session).
 * - "Accept" sets the cookie for 12 months.
 * - Links to /cookies for details.
 */
export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!getCookie(COOKIE_NAME)) {
      // Small delay so the banner doesn't compete with initial paint
      const t = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(t);
    }
  }, []);

  if (!visible) return null;

  const handleAccept = () => {
    setCookie(COOKIE_NAME, COOKIE_VALUE, MAX_AGE);
    setVisible(false);
  };

  const handleDismiss = () => {
    // Dismiss without accepting — hides for this session only (no cookie set).
    // The banner will reappear on next visit.
    setVisible(false);
  };

  return (
    <div
      role="region"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-surface/95 backdrop-blur-sm p-4 sm:p-5 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-relaxed text-text-secondary">
          We use essential cookies to keep the site working and remember your
          preferences. No tracking or advertising cookies.{" "}
          <Link
            href="/cookies"
            className="font-medium text-text-link underline decoration-text-link/30 underline-offset-2 hover:text-text-link-hover"
          >
            Learn more
          </Link>
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={handleAccept}
            className="rounded-full bg-accent-hover px-5 py-2 text-sm font-semibold text-text-inverse transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            Accept
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss cookie banner"
            className="inline-flex size-8 items-center justify-center rounded-full text-text-tertiary transition hover:bg-bg-tertiary hover:text-text-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
