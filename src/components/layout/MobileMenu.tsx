"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { X, Heart, Users, Mail, Phone } from "lucide-react";
import { navLinks, siteConfig } from "@/data/site";
import { img } from "@/lib/imageUrl";

/** Brand social icons (inline SVG - lucide-react dropped brand marks). */
const socialIcons = [
  { label: "Instagram", href: siteConfig.social.instagram, path: "M16 4H8a4 4 0 00-4 4v8a4 4 0 004 4h8a4 4 0 004-4V8a4 4 0 00-4-4zm-4 11a3 3 0 110-6 3 3 0 010 6zm4.5-7.5a1 1 0 110-2 1 1 0 010 2z" },
  { label: "X (Twitter)", href: siteConfig.social.twitter, path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" },
  { label: "Facebook", href: siteConfig.social.facebook, path: "M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" },
  { label: "LinkedIn", href: siteConfig.social.linkedin, path: "M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2zM4 2a2 2 0 110 4 2 2 0 010-4z" },
  { label: "YouTube", href: siteConfig.social.youtube, path: "M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33A2.78 2.78 0 003.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29 29 0 00.46-5.25 29 29 0 00-.46-5.33zM9.75 15.02V8.48l5.75 3.27-5.75 3.27z" },
];

type MobileMenuProps = {
  open: boolean;
  onClose: () => void;
  /** The header hamburger, so focus returns to it when the drawer closes. */
  hamburgerRef: React.RefObject<HTMLButtonElement | null>;
  supporterName?: string | null;
};

/**
 * Phase 8.9 - Pattern A right-side navigation drawer. Replaces the old
 * full-screen blue overlay. Slides in from the right over a dimmed, blurred
 * page; traps focus, closes on Escape / overlay click, and returns focus to
 * the hamburger on close. Transitions are neutralised site-wide by the
 * globals.css prefers-reduced-motion block, so reduced-motion is instant.
 */
export default function MobileMenu({ open, onClose, hamburgerRef, supporterName }: MobileMenuProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);
  const pathname = usePathname();

  // On open: move focus into the drawer. On close: return it to the hamburger.
  // `wasOpen` guards the initial mount so we never steal focus on page load.
  useEffect(() => {
    if (open) {
      wasOpen.current = true;
      closeRef.current?.focus();
    } else if (wasOpen.current) {
      wasOpen.current = false;
      hamburgerRef.current?.focus();
    }
  }, [open, hamburgerRef]);

  // Escape closes, globally, so it works even if focus leaves the panel.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Focus trap: keep Tab / Shift+Tab cycling inside the panel while open.
  const trapFocus = (e: React.KeyboardEvent) => {
    if (e.key !== "Tab" || !panelRef.current) return;
    const focusables = panelRef.current.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  return (
    <>
      {/* Dimmed, blurred page behind the drawer (click closes) */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`fixed inset-0 z-[60] bg-black/40 backdrop-blur-[4px] transition-opacity duration-200 lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Right-side drawer */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Main navigation"
        inert={!open}
        onKeyDown={trapFocus}
        className={`fixed right-0 top-0 z-[70] flex h-dvh w-[85vw] max-w-[400px] flex-col overflow-y-auto border-l border-border bg-surface shadow-2xl shadow-navy-900/20 transition-transform duration-300 ease-out lg:hidden ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* a. Header row - close top-right, 44px tap target */}
        <div className="flex items-center justify-end px-4 pt-4">
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label="Close menu"
            className="flex h-11 w-11 items-center justify-center rounded-xl text-text-secondary transition-colors hover:bg-bg-tertiary hover:text-text-primary"
          >
            <X className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        {/* b. Logo, centered, ~120px (same asset as the desktop header) */}
        <div className="flex justify-center px-6 pb-5 pt-2">
          <Link href="/" onClick={onClose} className="flex items-center justify-center">
            <Image
              src={img("/images/misc/ftf-logo.png")}
              alt="For The Future Organization"
              width={120}
              height={48}
              className="h-12 w-[120px] object-contain"
              unoptimized
            />
          </Link>
        </div>

        {/* c. Divider */}
        <div className="border-t border-border" aria-hidden="true" />

        {/* d. Nav links - 56px rows, active gets a green left border + text */}
        <nav className="divide-y divide-border/50" aria-label="Mobile navigation">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                aria-current={isActive ? "page" : undefined}
                className={`flex h-14 items-center border-l-[3px] px-6 text-lg font-medium transition-colors ${
                  isActive
                    ? "border-accent-hover bg-accent/5 text-accent-hover"
                    : "border-transparent text-text-primary hover:bg-bg-tertiary"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* e. Divider */}
        <div className="border-t border-border" aria-hidden="true" />

        {/* f. CTA section */}
        <div className="flex flex-col gap-3 px-6 py-5">
          <Link
            href="/donate"
            onClick={onClose}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-cta text-base font-semibold text-on-cta shadow-lg shadow-accent/20 transition-colors hover:bg-cta-hover"
          >
            <Heart className="h-5 w-5" aria-hidden="true" />
            Give Now
          </Link>
          <Link
            href="/volunteer"
            onClick={onClose}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full border-2 border-border bg-transparent text-base font-semibold text-text-secondary transition-colors hover:border-primary hover:text-primary"
          >
            <Users className="h-5 w-5" aria-hidden="true" />
            Volunteer
          </Link>
        </div>

        {/* g. Divider */}
        <div className="border-t border-border" aria-hidden="true" />

        {/* h. Contact */}
        <div className="px-6 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-text-muted">Get in touch</p>
          <div className="mt-2 flex flex-col">
            <a
              href={`mailto:${siteConfig.contact.emails[0]}`}
              className="flex h-11 items-center gap-3 text-base text-text-primary transition-colors hover:text-primary"
            >
              <Mail className="h-4 w-4 shrink-0 text-text-muted" aria-hidden="true" />
              {siteConfig.contact.emails[0]}
            </a>
            <a
              href={`tel:${siteConfig.contact.phones[0].replace(/\s/g, "")}`}
              className="flex h-11 items-center gap-3 text-base text-text-primary transition-colors hover:text-primary"
            >
              <Phone className="h-4 w-4 shrink-0 text-text-muted" aria-hidden="true" />
              {siteConfig.contact.phones[0]}
            </a>
          </div>
        </div>

        {/* i. Social */}
        <div className="px-6 pb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-text-muted">Follow us</p>
          <div className="mt-3 flex gap-2">
            {socialIcons.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-border text-text-secondary transition-colors hover:bg-bg-tertiary hover:text-text-primary"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d={s.path} />
                </svg>
              </a>
            ))}
          </div>
        </div>

        {/* j. Sign In / My Account */}
        <div className="mt-auto border-t border-border px-6 py-3">
          {supporterName ? (
            <Link
              href="/my-account"
              onClick={onClose}
              className="flex h-11 items-center text-base font-medium text-text-primary transition-colors hover:text-primary"
            >
              My Account ({supporterName.split(" ")[0]})
            </Link>
          ) : (
            <Link
              href="/supporter-login"
              onClick={onClose}
              className="flex h-11 items-center text-base font-medium text-text-primary transition-colors hover:text-primary"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
