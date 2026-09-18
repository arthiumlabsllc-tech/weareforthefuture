"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { img } from "@/lib/imageUrl";
import {
  ArrowLeft,
  Check,
  Eye,
  EyeOff,
  HeartHandshake,
  Loader2,
  Lock,
  Mail,
  ReceiptText,
  Bookmark,
} from "lucide-react";

const benefits = [
  {
    icon: ReceiptText,
    title: "Every gift, documented",
    text: "Track each donation and download receipts for your records.",
  },
  {
    icon: Bookmark,
    title: "Causes you follow",
    text: "Save the initiatives and pillars you care about most.",
  },
  {
    icon: HeartHandshake,
    title: "Impact you can see",
    text: "Updates on the programmes your support makes possible.",
  },
];

export default function SupporterLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/supporter/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid credentials");
        return;
      }

      router.push("/my-account");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* ===== BRAND PANEL ===== */}
      <div className="relative hidden overflow-hidden bg-primary text-text-on-primary lg:flex lg:flex-col lg:justify-between lg:p-14">
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-accent/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-accent/15 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(76,182,77,0.12),transparent_55%)]" />

        <div className="relative">
          <Image
            src={img("/images/misc/ftf-logo-white.png")}
            alt="For The Future Organization"
            width={150}
            height={56}
            className="h-12 w-auto object-contain"
            unoptimized
            priority
          />
        </div>

        <div className="relative max-w-md">
          <span className="inline-block text-xs font-semibold uppercase tracking-[0.3em] text-accent-bright">
            My FTF
          </span>
          <h2 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-bold leading-tight xl:text-5xl">
            One account for every act of kindness.
          </h2>
          <ul className="mt-10 space-y-6">
            {benefits.map((benefit) => (
              <li key={benefit.title} className="flex items-start gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
                  <benefit.icon aria-hidden="true" className="h-5 w-5 text-accent-bright" />
                </span>
                <span>
                  <span className="block font-semibold">{benefit.title}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-text-on-primary/70">
                    {benefit.text}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-sm text-text-on-primary/60">
          10 years of impact · 9,000+ lives reached · Ghana, Nigeria & beyond
        </p>
      </div>

      {/* ===== FORM PANEL ===== */}
      <div className="relative flex flex-col px-6 py-10 sm:px-12 lg:px-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 self-start text-sm font-medium text-text-tertiary transition-colors hover:text-text-primary"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          Back to site
        </Link>

        <div className="flex flex-1 items-center justify-center py-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            <div className="mb-8 lg:hidden">
              <Image
                src={img("/images/misc/ftf-logo.png")}
                alt="For The Future Organization"
                width={150}
                height={56}
                className="h-12 w-auto object-contain"
                unoptimized
                priority
              />
            </div>

            <h1 className="text-3xl font-bold text-text-primary">Welcome back</h1>
            <p className="mt-2 text-sm text-text-secondary">
              Sign in to My FTF to see your donations, receipts and saved causes.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-error/20 bg-error/10 px-4 py-3 text-sm text-error"
                >
                  {error}
                </div>
              )}

              <div>
                <label
                  htmlFor="supporter-email"
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-text-tertiary"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    aria-hidden="true"
                    className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
                  />
                  <input
                    id="supporter-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                    className="w-full rounded-xl border border-border-strong bg-surface py-3 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="supporter-password"
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-text-tertiary"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock
                    aria-hidden="true"
                    className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
                  />
                  <input
                    id="supporter-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                    className="w-full rounded-xl border border-border-strong bg-surface py-3 pl-10 pr-12 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted transition-colors hover:text-text-secondary"
                  >
                    {showPassword ? (
                      <EyeOff aria-hidden="true" className="h-4 w-4" />
                    ) : (
                      <Eye aria-hidden="true" className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-bold text-text-on-primary shadow-lg shadow-primary/20 transition-all hover:bg-primary-hover hover:shadow-xl disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Lock aria-hidden="true" className="h-4 w-4" />
                    Sign In
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 flex items-center gap-3" aria-hidden="true">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs uppercase tracking-wider text-text-muted">New here?</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <p className="mt-6 text-center text-sm text-text-secondary">
              Become a supporter of For The Future —{" "}
              <Link
                href="/register"
                className="font-semibold text-accent-hover underline underline-offset-4 transition-colors hover:text-accent-text"
              >
                create your account
              </Link>
            </p>

            <p className="mt-8 flex items-start gap-2 text-xs leading-relaxed text-text-muted">
              <Check aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
              Your session is private and encrypted. We never share supporter
              information with third parties.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
