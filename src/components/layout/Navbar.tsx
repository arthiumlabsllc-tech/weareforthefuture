"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Heart, ChevronDown } from "lucide-react";
import { navLinks, siteConfig } from "@/data/site";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { img } from "@/lib/imageUrl";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
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
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-surface/80 backdrop-blur-xl shadow-lg shadow-navy-900/5"
          : "bg-transparent"
      }`}
    >
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
                    ? isScrolled
                      ? "text-accent-hover"
                      : "text-accent"
                    : isScrolled
                    ? "text-text-secondary hover:text-text-primary"
                    : "text-white/80 hover:text-white"
                }`}
              >
                {link.label}
                {isActive && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className={`absolute bottom-0 left-3 right-3 h-0.5 rounded-full ${
                      isScrolled ? "bg-accent" : "bg-accent"
                    }`}
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
          <Link
            href="/donate"
            className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-accent to-accent-hover px-5 py-2.5 text-sm font-semibold text-navy-900 shadow-lg shadow-accent/25 transition-all hover:shadow-xl hover:shadow-accent/30 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Heart className="h-4 w-4 transition-transform group-hover:scale-110" />
            Donate Now
          </Link>
        </div>

        {/* Mobile Menu Button + Theme Toggle */}
        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className={`relative z-50 flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
              isMobileOpen
                ? "bg-primary text-text-on-primary"
                : isScrolled
                ? "bg-bg-tertiary text-text-primary"
                : "bg-white/10 text-white"
            }`}
            aria-label={isMobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileOpen}
          >
            {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>
    </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[60] bg-primary/95 backdrop-blur-xl lg:hidden"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="flex h-full flex-col items-center justify-center gap-2 px-6"
            >
              {/* Logo */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05, duration: 0.4 }}
                className="mb-6"
              >
                <Link href="/" onClick={() => setIsMobileOpen(false)}>
                  <Image
                    src={img("/images/misc/ftf-logo.png")}
                    alt="For The Future Organization"
                    width={140}
                    height={56}
                    className="h-14 w-auto object-contain"
                    unoptimized
                  />
                </Link>
              </motion.div>
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={`block px-6 py-3 text-center text-xl font-medium transition-colors rounded-xl ${
                      pathname === link.href
                        ? "text-accent bg-white/5"
                        : "text-white/80 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-6"
              >
                <Link
                  href="/donate"
                  onClick={() => setIsMobileOpen(false)}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-accent to-accent-hover px-8 py-3 text-base font-semibold text-navy-900 shadow-lg"
                >
                  <Heart className="h-5 w-5" />
                  Donate Now
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
