"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { img } from "@/lib/imageUrl";
import { ArrowRight, Heart } from "lucide-react";
import SectionWrapper, { SectionHeader } from "@/components/ui/SectionWrapper";
import StatDisplay from "@/components/ui/StatDisplay";
import { impactMetrics, fundAllocation, successStories } from "@/data/impact";
import { siteConfig } from "@/data/site";
import type { ProgrammeIndicator } from "@/lib/pillars";

/**
 * /impact dashboard (Phase 4 rebuild).
 *
 * All figures are static (no count-up): organisation-wide numbers come from the
 * verified `siteConfig.stats`, per-metric cards from `impactMetrics`, and the
 * programme grid from the CMS via getProgrammeIndicators(). Fund allocation
 * renders the real `fundAllocation` breakdown - the earlier unsubstantiated
 * single-percentage and per-dollar claims from Phase 2.5 are gone.
 */
export default function ImpactClient({ indicators = [] }: { indicators?: ProgrammeIndicator[] }) {
  const { yearsOfFoundation, beneficiaries, volunteers, campaigns } = siteConfig.stats;

  return (
    <>
      {/* ===== HERO ===== */}
      <section className="relative min-h-[50vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={img("/images/page-heroes/impact-hero.jpg")}
            alt="Our Impact"
            fill
            className="object-cover"
            priority
            unoptimized
          />
          <div className="absolute inset-0 bg-primary/70" />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/40 to-primary/70" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 py-32 lg:px-8 w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <span className="inline-block text-xs font-semibold uppercase tracking-[0.3em] text-accent-text mb-4">
              Transparency &amp; Impact
            </span>
            <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold leading-[1.1] text-text-on-primary sm:text-5xl md:text-6xl">
              Where your money goes.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-text-on-primary/70 leading-relaxed">
              {siteConfig.positioning}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ===== IMPACT DASHBOARD (static - no count-up) ===== */}
      <SectionWrapper background="white">
        <SectionHeader
          overline="Impact dashboard"
          title="A decade, measured"
          description="Verified organisational figures across ten years of community-rooted programming."
        />

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <StatDisplay value={`${yearsOfFoundation}`} label="Years of continuous impact" />
          <StatDisplay value={beneficiaries.toLocaleString()} suffix="+" label="Children and young people reached" />
          <StatDisplay value={`${volunteers}`} suffix="+" label="Volunteers mobilised" />
          <StatDisplay value={`${campaigns}`} suffix="+" label="Campaigns and activities" />
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {impactMetrics.map((metric, i) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="rounded-2xl border border-border bg-surface p-7"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-bg-tertiary text-text-secondary">
                <metric.icon className="h-6 w-6" />
              </div>
              <div className="font-[family-name:var(--font-display)] text-3xl font-bold text-text-primary tabular-nums">
                {metric.value}
              </div>
              <div className="mt-1 text-sm font-semibold text-text-secondary">{metric.label}</div>
              <p className="mt-2 text-sm text-text-tertiary leading-relaxed">{metric.description}</p>
            </motion.div>
          ))}
        </div>

        <p className="mt-10 text-sm text-text-muted">
          Last updated: {siteConfig.stats.lastUpdated}
        </p>
      </SectionWrapper>

      {/* ===== FUND ALLOCATION (real breakdown, no unsubstantiated percentage claim) ===== */}
      <SectionWrapper background="warm">
        <div className="grid gap-12 lg:grid-cols-2 items-start">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-text">
              Financial transparency
            </span>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold text-text-primary md:text-4xl leading-tight">
              How funds are allocated
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Spending is prioritised across the five programme pillars, with a
              small reserved share for operations and governance. The breakdown
              below reflects FTF&apos;s current programme-spending priorities.
            </p>

            <div className="mt-8 space-y-4">
              {fundAllocation.map((item) => (
                <div key={item.category}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-text-secondary">{item.category}</span>
                    <span className="text-sm font-bold text-text-primary tabular-nums">{item.percentage}%</span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-bg-tertiary">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${item.percentage}%`, backgroundColor: item.hex }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-8">
            <h3 className="font-[family-name:var(--font-display)] text-xl font-bold text-text-primary">
              Reading this chart
            </h3>
            <ul className="mt-5 space-y-3">
              {fundAllocation.map((item) => (
                <li key={item.category} className="flex items-center gap-3 text-sm text-text-secondary">
                  <span
                    className="h-3.5 w-3.5 shrink-0 rounded-full"
                    style={{ backgroundColor: item.hex }}
                    aria-hidden="true"
                  />
                  <span className="flex-1">{item.category}</span>
                  <span className="font-semibold text-text-primary tabular-nums">{item.percentage}%</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-text-tertiary leading-relaxed">
              Audited financial statements and annual reports are published under
              Reports &amp; Transparency as they are finalised.
            </p>
            <Link
              href="/impact/reports"
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-accent-text hover:underline"
            >
              Reports &amp; Transparency <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </SectionWrapper>

      {/* ===== PROGRAMME-LEVEL INDICATORS (from DB) ===== */}
      {indicators.length > 0 && (
        <SectionWrapper background="white">
          <SectionHeader
            overline="Programme-level indicators"
            title="Impact by programme"
            description="Reported reach and focus for each active programme, as recorded in the CMS."
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {indicators.map((ind, i) => (
              <motion.div
                key={ind.slug}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.5 }}
              >
                <Link
                  href={ind.href}
                  className="group flex h-full flex-col rounded-2xl border border-border bg-surface p-6 transition-all hover:border-accent hover:shadow-lg"
                >
                  <span className="text-xs font-semibold uppercase tracking-[0.15em] text-accent-text">
                    {ind.pillarTitle}
                  </span>
                  <h3 className="mt-2 font-[family-name:var(--font-display)] text-lg font-bold text-text-primary">
                    {ind.name}
                  </h3>
                  <div className="mt-3 text-2xl font-bold text-text-primary tabular-nums">
                    {ind.beneficiaries != null ? `${ind.beneficiaries.toLocaleString()}+` : "-"}
                    <span className="ml-2 text-sm font-medium text-text-tertiary">reached</span>
                  </div>
                  {ind.category && (
                    <span className="mt-3 inline-flex w-fit items-center rounded-full bg-bg-tertiary px-3 py-1 text-xs font-medium text-text-secondary">
                      {ind.category}
                    </span>
                  )}
                  {ind.highlights.length > 0 && (
                    <ul className="mt-4 space-y-1.5">
                      {ind.highlights.slice(0, 3).map((h) => (
                        <li key={h} className="flex items-start gap-2 text-sm text-text-secondary">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                          {h}
                        </li>
                      ))}
                    </ul>
                  )}
                  <span className="mt-auto pt-5 inline-flex items-center gap-2 text-sm font-semibold text-accent-text">
                    View programme
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </SectionWrapper>
      )}

      {/* ===== STORIES OF CHANGE ===== */}
      <SectionWrapper background="warm">
        <SectionHeader
          overline="Stories of change"
          title="Behind the numbers"
          description="Shared with consent and safeguarding approval. Names and identifying details appear only where approved."
        />
        <div className="grid gap-8 md:grid-cols-2">
          {successStories.map((story, i) => (
            <motion.div
              key={story.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.5 }}
              className="rounded-2xl bg-surface border border-border p-8"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent-subtle text-accent-text">
                <Heart className="h-6 w-6" />
              </div>
              <p className="text-text-secondary leading-relaxed mb-6 italic">&ldquo;{story.story}&rdquo;</p>
              <div className="border-t border-border pt-4">
                <div className="font-semibold text-text-primary">{story.name}</div>
                <div className="text-sm text-text-tertiary">{story.location}</div>
                <div className="mt-2 inline-flex items-center rounded-full bg-success-bg px-3 py-1 text-xs font-medium text-success-text">
                  {story.program}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      {/* ===== CTA ===== */}
      <SectionWrapper background="navy">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold text-text-on-primary md:text-4xl">
            Put your support to work
          </h2>
          <p className="mt-4 text-lg text-text-on-primary/70">
            Give today, or see exactly how funding is stewarded and reported.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/donate"
              className="inline-flex items-center gap-2 rounded-full bg-cta px-7 py-3.5 text-sm font-semibold text-on-cta shadow-lg shadow-accent/20 transition-all hover:bg-cta-hover hover:scale-[1.02]"
            >
              Give Now <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/impact/reports"
              className="inline-flex items-center gap-2 rounded-full border border-border-strong bg-surface/10 px-7 py-3.5 text-sm font-semibold text-text-on-primary transition-all hover:border-accent hover:text-accent-bright"
            >
              Reports &amp; Transparency
            </Link>
          </div>
        </div>
      </SectionWrapper>
    </>
  );
}
