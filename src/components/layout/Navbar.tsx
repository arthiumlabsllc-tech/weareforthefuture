"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Heart, ChevronDown, User, LogOut, LayoutDashboard } from "lucide-react";
import { navLinks, siteConfig } from "@/data/site";
import ThemeToggle from "@/components/ui/ThemeToggle";
import MobileMenu from "@/components/layout/MobileMenu";
import { img } from "@/lib/imageUrl";

export default function Navbar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [supporter, setSupporter] = useState<{ name: string; email: string } | null>(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  // Check supporter session
  useEffect(() => {
    fetch("/api/supporter/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.supporter) setSupporter(data.supporter);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  return (
    <>
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/60 bg-surface/85 backdrop-blur-xl shadow-lg shadow-navy-900/5">
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative h-12 w-auto overflow-hidden transition-transform group-hover:scale-105">
            <Image
              src={img("/images/misc/ftf-logo.png")}
              alt="For The Future Organization"
              width={120}
              height={48}
              className="h-12 w-auto object-contain"
              unoptimized
              priority
            />
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex lg:items-center lg:gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-3 py-2 text-sm font-medium transition-colors rounded-lg hover:bg-primary/5 ${
                  isActive
                    ? "text-accent-hover"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {link.label}
                {isActive && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-accent"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Desktop CTA + Theme Toggle */}
        <div className="hidden lg:flex lg:items-center lg:gap-3">
          <ThemeToggle />
          {supporter ? (
            <div className="relative">
              <button
                onClick={() => setAccountOpen(!accountOpen)}
                className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors text-text-secondary hover:text-text-primary hover:bg-bg-primary"
              >
                <User className="h-4 w-4" />
                {supporter.name.split(" ")[0]}
                <ChevronDown className={`h-3 w-3 transition-transform ${accountOpen ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {accountOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setAccountOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl bg-surface border border-border shadow-lg"
                    >
                      <div className="border-b border-border px-4 py-3">
                        <p className="text-sm font-medium text-text-primary">{supporter.name}</p>
                        <p className="text-xs text-text-muted">{supporter.email}</p>
                      </div>
                      <div className="p-1">
                        <Link href="/my-account" onClick={() => setAccountOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-text-secondary hover:bg-bg-primary hover:text-text-primary">
                          <LayoutDashboard className="h-4 w-4" /> My Account
                        </Link>
                        <button
                          onClick={async () => {
                            await fetch("/api/supporter/logout", { method: "POST" });
                            setSupporter(null);
                            setAccountOpen(false);
                            window.location.reload();
                          }}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-text-secondary hover:bg-bg-primary hover:text-error"
                        >
                          <LogOut className="h-4 w-4" /> Sign Out
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link
              href="/supporter-login"
              className="text-sm font-medium transition-colors text-text-secondary hover:text-text-primary"
            >
              Sign In
            </Link>
          )}
          <Link
            href="/donate"
            className="group inline-flex items-center gap-2 rounded-full bg-cta px-5 py-2.5 text-sm font-semibold text-on-cta shadow-lg shadow-accent/25 transition-all hover:shadow-xl hover:shadow-accent/30 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Heart className="h-4 w-4 transition-transform group-hover:scale-110" />
            Give Now
          </Link>
        </div>

        {/* Mobile Menu Button + Theme Toggle */}
        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          <button
            ref={hamburgerRef}
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className={`relative z-50 flex h-11 w-11 items-center justify-center rounded-xl transition-colors ${
              isMobileOpen
                ? "bg-primary text-text-on-primary"
                : "bg-bg-tertiary text-text-primary"
            }`}
            aria-label={isMobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileOpen}
          >
            {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>
    </header>

      {/* Phase 8.9 - Pattern A right-side drawer (replaces the old
          full-screen blue overlay entirely). */}
      <MobileMenu
        open={isMobileOpen}
        onClose={() => setIsMobileOpen(false)}
        hamburgerRef={hamburgerRef}
        supporterName={supporter?.name ?? null}
      />
    </>
  );
}
