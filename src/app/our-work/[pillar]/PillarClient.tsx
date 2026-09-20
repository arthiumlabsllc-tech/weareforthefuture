"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Handshake,
  Heart,
  MapPin,
  Quote,
  Sparkles,
  Users,
} from "lucide-react";
import SectionWrapper, { SectionHeader } from "@/components/ui/SectionWrapper";
import ProgrammeCard from "@/components/our-work/ProgrammeCard";
import { pillars as staticPillars } from "@/data/pillars";
import { storyStats, successStories } from "@/data/impact";
import type { PillarData, PillarProgramme } from "@/lib/pillars";

/** Pillar accent colour (theme-aware). */
const accentVar = (n: number) => `var(--ftf-pillar-${n})`;
const accentTint = (n: number, pct = 14) =>
  `color-mix(in srgb, var(--ftf-pillar-${n}) ${pct}%, transparent)`;

/**
 * Pillars where mentoring is the central delivery model get a "Volunteer as
 * mentor" secondary CTA; the rest invite supporters to "Sponsor a Future".
 */
const MENTOR_PILLARS = new Set(["foundational-education", "mentorship-leadership"]);

export default function PillarClient({
  pillar,
  programmes = [],
}: {
  pillar: Omit<PillarData, "icon">;
  programmes?: PillarProgramme[];
}) {
  // Re-derive the icon from static pillar copy by id (the DB icon name is not
  // serialisable across the server→client boundary; slugs mirror static data).
  const Icon = staticPillars.find((p) => p.id === pillar.id)?.icon ?? Sparkles;
  const stories = successStories.filter(
    (s) => s.pillar === pillar.title && s.status === "safeguarding-approved",
  );
  const mentorLed = MENTOR_PILLARS.has(pillar.id);

  return (
    <>
      {/* ===== a. HERO (pillar-accented) ===== */}
      <section className="relative overflow-hidden bg-primary pt-32 pb-20 text-text-on-primary sm:pt-36">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(circle at 80% 10%, color-mix(in srgb, ${accentVar(pillar.number)} 32%, transparent), transparent 55%)`,
          }}
        />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="mb-8 flex flex-wrap items-center gap-2 text-sm text-text-on-primary/75">
            <Link href="/" className="hover:underline focus-visible:outline-2 focus-visible:outline-offset-4">Home</Link>
            <span aria-hidden="true">/</span>
            <Link href="/our-work" className="hover:underline focus-visible:outline-2 focus-visible:outline-offset-4">Our Work</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page" className="text-text-on-primary">{pillar.title}</span>
          </nav>

          <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:items-end">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-accent-bright">
                <Icon aria-hidden="true" className="h-4 w-4" />
                Pillar {pillar.number}
              </span>
              <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-bold leading-[1.1] sm:text-5xl lg:text-6xl">
                {pillar.title}
              </h1>
              {/* Decorative pillar-accent rule */}
              <span
                aria-hidden="true"
                className="mt-6 block h-1.5 w-24 rounded-full"
                style={{ backgroundColor: accentVar(pillar.number) }}
              />
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-text-on-primary/80">
                {pillar.summary}
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/donate"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-7 py-3.5 text-base font-semibold text-on-success shadow-lg shadow-accent/20 transition-all hover:bg-accent-hover hover:scale-[1.02]"
                >
                  <Heart className="h-5 w-5" aria-hidden="true" />
                  Give to this pillar
                </Link>
                <Link
                  href="/our-work"
                  className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-text-on-primary/25 px-7 py-3.5 text-base font-semibold text-text-on-primary transition-all hover:bg-text-on-primary/10"
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  Back to Our Work
                </Link>
              </div>
            </div>

            {/* Ghost number — decorative pillar identity */}
            <div aria-hidden="true" className="hidden justify-self-end lg:block">
              <span
                className="font-[family-name:var(--font-display)] text-[10rem] font-bold leading-none opacity-25"
                style={{ color: accentVar(pillar.number) }}
              >
                0{pillar.number}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== b. THE CHALLENGE + c. WHAT WE DO ===== */}
      <SectionWrapper background="white">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-text">The challenge</span>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-bold text-text-primary sm:text-3xl">
              The barrier, concretely
            </h2>
            <p className="mt-5 leading-relaxed text-text-secondary">{pillar.challenge}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="rounded-2xl border-l-4 bg-bg-primary p-7"
            style={{ borderColor: accentVar(pillar.number) }}
          >
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-text">What we do</span>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-bold text-text-primary sm:text-3xl">
              Our delivery model
            </h2>
            <p className="mt-5 leading-relaxed text-text-secondary">{pillar.whatWeDo}</p>
          </motion.div>
        </div>
      </SectionWrapper>

      {/* ===== d. PROGRAMMES IN THIS PILLAR ===== */}
      <SectionWrapper background="warm">
        <SectionHeader
          align="left"
          overline={`Pillar ${pillar.number} programmes`}
          title="Programmes in this pillar"
          description="Each programme below is delivered as part of this pillar and connects to the wider FTF pathway."
        />
        {programmes.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {programmes.map((programme) => (
              <ProgrammeCard key={programme.slug} programme={programme} pillarId={pillar.id} />
            ))}
          </div>
        ) : (
          /* Intentional empty state — no programmes published under this pillar yet. */
          <div
            className="flex flex-col items-start gap-3 rounded-2xl border border-dashed p-8 sm:flex-row sm:items-center"
            style={{ borderColor: accentVar(pillar.number), backgroundColor: accentTint(pillar.number, 6) }}
          >
            <span
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
              style={{ backgroundColor: accentTint(pillar.number, 20) }}
            >
              <Sparkles aria-hidden="true" className="h-6 w-6" style={{ color: accentVar(pillar.number) }} />
            </span>
            <div>
              <h3 className="text-lg font-bold text-text-primary">Programmes launching soon</h3>
              <p className="mt-1 text-sm leading-relaxed text-text-secondary">
                We are formalising the published programme set for this pillar. Meanwhile, support
                here strengthens the whole pathway — from access to school to a first livelihood.
              </p>
            </div>
          </div>
        )}
      </SectionWrapper>

      {/* ===== e. WHO IT SERVES + WHERE IT WORKS ===== */}
      <SectionWrapper background="white">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-surface p-7">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: accentTint(pillar.number) }}>
                <Users aria-hidden="true" className="h-5 w-5" style={{ color: accentVar(pillar.number) }} />
              </span>
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-text-primary">Who it serves</h2>
            </div>
            <p className="mt-4 leading-relaxed text-text-secondary">{pillar.whoItServes}</p>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-7">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: accentTint(pillar.number) }}>
                <MapPin aria-hidden="true" className="h-5 w-5" style={{ color: accentVar(pillar.number) }} />
              </span>
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-text-primary">Where it works</h2>
            </div>
            <p className="mt-4 leading-relaxed text-text-secondary">{pillar.whereItWorks}</p>
          </div>
        </div>
      </SectionWrapper>

      {/* ===== f. IMPACT / PROGRESS (static, verified figures only) ===== */}
      <SectionWrapper background="warm">
        <SectionHeader
          overline="Progress, not promises"
          title="What a decade of delivery looks like"
          description="Pillar-level reporting is being formalised. The figures below are FTF's verified institutional record across ten years of community-rooted programming in Ghana and Nigeria."
        />
        <dl className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {storyStats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-border bg-surface p-6 text-center">
              <dd className="font-[family-name:var(--font-display)] text-4xl font-bold text-text-primary">
                {stat.value}
                <span style={{ color: accentVar(pillar.number) }}>{stat.suffix}</span>
              </dd>
              <dt className="mt-2 text-sm leading-snug text-text-tertiary">{stat.label}</dt>
            </div>
          ))}
        </dl>
      </SectionWrapper>

      {/* ===== g. STORIES (only if safeguarding-approved for this pillar) ===== */}
      {stories.length > 0 && (
        <SectionWrapper background="white">
          <SectionHeader
            align="left"
            overline="In their words"
            title="Stories from this pillar"
            description="Published with consent and safeguarding approval. Names and identifying details are shared only where approved."
          />
          <div className="grid gap-6 md:grid-cols-2">
            {stories.map((story) => (
              <figure
                key={story.name}
                className="flex h-full flex-col rounded-2xl border-l-4 bg-bg-primary p-7"
                style={{ borderColor: accentVar(pillar.number) }}
              >
                <Quote aria-hidden="true" className="h-6 w-6 text-accent-text" />
                <blockquote className="mt-4 flex-1 leading-relaxed text-text-secondary">
                  {story.story}
                </blockquote>
                <figcaption className="mt-5 border-t border-border pt-4 text-sm">
                  <span className="font-semibold text-text-primary">{story.name}</span>
                  {story.location && <span className="text-text-tertiary"> · {story.location}</span>}
                  <span className="mt-1 block text-xs text-text-muted">{story.program}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </SectionWrapper>
      )}

      {/* ===== h. CTA ===== */}
      <section className="relative overflow-hidden bg-primary py-20 md:py-24">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(circle at 50% 0%, color-mix(in srgb, ${accentVar(pillar.number)} 26%, transparent), transparent 55%)`,
          }}
        />
        <div className="relative mx-auto max-w-3xl px-6 text-center lg:px-8">
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold leading-tight text-text-on-primary md:text-4xl">
            Back the work of Pillar {pillar.number}
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-text-on-primary/70">
            {pillar.title} — {pillar.summary}
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/give"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-8 py-4 text-base font-semibold text-on-success shadow-lg shadow-accent/20 transition-all hover:bg-accent-hover hover:scale-[1.02] sm:w-auto"
            >
              <Heart className="h-5 w-5" aria-hidden="true" />
              Give to this pillar
            </Link>
            {/* Phase 5: the Give tree is live — "Sponsor a Future" deep-links to the
                privacy-safe /give/support-a-future page; mentors go to the mentor pathway. */}
            <Link
              href={mentorLed ? "/get-involved/mentor" : "/give/support-a-future"}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-text-on-primary/25 px-8 py-4 text-base font-semibold text-text-on-primary transition-all hover:bg-text-on-primary/10 sm:w-auto"
            >
              {mentorLed ? (
                <>
                  <Handshake className="h-5 w-5" aria-hidden="true" />
                  Volunteer as mentor
                </>
              ) : (
                <>
                  Sponsor a Future
                  <ArrowRight className="h-5 w-5" aria-hidden="true" />
                </>
              )}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
