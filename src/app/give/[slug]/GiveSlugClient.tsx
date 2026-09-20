"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, ShieldCheck, CalendarClock, Sparkles } from "lucide-react";
import { img } from "@/lib/imageUrl";
import SectionWrapper from "@/components/ui/SectionWrapper";
import GivingPanel from "@/components/give/GivingPanel";
import { siteConfig } from "@/data/site";
import type { GivingTarget } from "@/lib/give";

const KIND_LABEL: Record<GivingTarget["kind"], string> = {
  campaign: "Time-bound campaign",
  programme: "Programme support",
  general: "Unrestricted giving",
};

export default function GiveSlugClient({ target }: { target: GivingTarget }) {
  const isMonthly = target.slug === "monthly";
  const source =
    target.kind === "campaign"
      ? "give_campaign"
      : target.kind === "programme"
        ? "give_programme"
        : "give_general";

  const goal = target.goalAmount != null ? Math.round(target.goalAmount / 100) : null;
  const raised = target.raisedAmount != null ? Math.round(target.raisedAmount / 100) : null;
  const pct = goal && goal > 0 && raised != null ? Math.min(100, Math.round((raised / goal) * 100)) : 0;

  const { legal, stats } = siteConfig;

  return (
    <>
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden bg-primary text-text-on-primary">
        {target.image && (
          <Image
            src={img(target.image)}
            alt=""
            fill
            className="object-cover opacity-20"
            priority
            unoptimized
          />
        )}
        <div className="absolute inset-0 bg-primary/80" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(212,168,67,0.16),transparent_55%)]" />
        <div className="relative z-10 mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
          <Link
            href="/give"
            className="inline-flex items-center gap-1.5 text-sm text-text-on-primary/70 transition-colors hover:text-accent-bright"
          >
            <ArrowLeft className="h-4 w-4" />
            All giving routes
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="mt-6 max-w-3xl"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-accent-text">
              <Sparkles className="h-3.5 w-3.5" />
              {KIND_LABEL[target.kind]}
            </span>
            <h1 className="mt-5 font-[family-name:var(--font-display)] text-4xl font-bold leading-[1.1] sm:text-5xl">
              {target.name}
            </h1>
            {target.description && (
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-text-on-primary/75">
                {target.description}
              </p>
            )}
          </motion.div>
        </div>
      </section>

      {/* ===== PANEL + CONTEXT ===== */}
      <SectionWrapper background="warm">
        <div className="grid items-start gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
          <GivingPanel
            source={source}
            targetName={target.name}
            campaignId={target.campaignId}
            defaultFrequency={isMonthly ? "monthly" : "one-time"}
            heading={isMonthly ? "Start a monthly gift" : "Make your gift"}
          />

          <aside className="space-y-6">
            {/* Campaign progress */}
            {target.kind === "campaign" && goal != null && (
              <div className="rounded-2xl border border-border bg-surface p-6">
                <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-text-muted">
                  Campaign progress
                </h2>
                <div className="mt-4 flex items-baseline justify-between">
                  <span className="font-[family-name:var(--font-display)] text-3xl font-bold text-text-primary">
                    GH₵{(raised ?? 0).toLocaleString()}
                  </span>
                  <span className="text-sm text-text-muted">of GH₵{goal.toLocaleString()}</span>
                </div>
                <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-bg-tertiary">
                  <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
                </div>
                <p className="mt-2 text-xs text-text-muted">{pct}% funded</p>
              </div>
            )}

            {/* Trust */}
            <div className="rounded-2xl border border-border bg-surface p-6">
              <h2 className="flex items-center gap-2 font-[family-name:var(--font-display)] text-lg font-bold text-text-primary">
                <ShieldCheck className="h-5 w-5 text-success" />
                Giving with confidence
              </h2>
              <ul className="mt-4 space-y-3 text-sm text-text-secondary">
                <li className="flex items-start gap-2">
                  <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-accent-hover" />
                  {legal.status}
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-accent-hover" />
                  {legal.taxNote}
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-accent-hover" />
                  Payments processed securely by Paystack (card, bank or Mobile Money).
                </li>
              </ul>
              <p className="mt-4 flex items-center gap-2 text-xs text-text-muted">
                <CalendarClock className="h-3.5 w-3.5" />
                Last updated: {stats.lastUpdated}
              </p>
              <Link
                href="/impact/reports"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-accent-hover hover:underline"
              >
                Reports &amp; Transparency
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Other ways to give */}
            <div className="rounded-2xl border border-border bg-surface p-6">
              <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-text-muted">
                Other ways to give
              </h2>
              <div className="mt-4 flex flex-col gap-2 text-sm">
                {[
                  { href: "/give/where-most-needed", label: "Give where it's needed most" },
                  { href: "/give/monthly", label: "Start monthly giving" },
                  { href: "/give/support-a-future", label: "Support a Future" },
                  { href: "/partners", label: "Partner with FTF" },
                ]
                  .filter((l) => l.href !== `/give/${target.slug}`)
                  .map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      className="inline-flex items-center justify-between rounded-xl border border-border px-4 py-2.5 text-text-secondary transition-colors hover:border-accent/50 hover:text-text-primary"
                    >
                      {l.label}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  ))}
              </div>
            </div>
          </aside>
        </div>
      </SectionWrapper>
    </>
  );
}
