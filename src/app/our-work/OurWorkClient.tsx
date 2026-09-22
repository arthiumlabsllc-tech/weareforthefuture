"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  Handshake,
  Heart,
  MapPin,
  Sparkles,
  Users,
} from "lucide-react";
import SectionWrapper, { SectionHeader } from "@/components/ui/SectionWrapper";
import JourneyStepper from "@/components/home/JourneyStepper";
import ProgrammeCard from "@/components/our-work/ProgrammeCard";
import { pillars as staticPillars } from "@/data/pillars";
import { siteConfig } from "@/data/site";
import type { PillarData, PillarProgramme } from "@/lib/pillars";
import { img } from "@/lib/imageUrl";
import { cardClasses, cardPadding } from "@/lib/ui/cardClasses";

/** Pillar accent colour (theme-aware): light values in light mode, brighter in dark. */
const accentVar = (n: number) => `var(--ftf-pillar-${n})`;
/** Soft tint of a pillar accent for chip backgrounds. */
const accentTint = (n: number, pct = 14) =>
  `color-mix(in srgb, var(--ftf-pillar-${n}) ${pct}%, transparent)`;

/** A pillar's programmes, grouped server-side (icon is non-serialisable). */
interface PillarGroup {
  pillarId: string;
  programmes: PillarProgramme[];
}

export default function OurWorkClient({
  pillars = [],
  grouped = [],
}: {
  pillars?: Omit<PillarData, "icon">[];
  grouped?: PillarGroup[];
}) {
  const { ghana, nigeria } = siteConfig.regions;
  // Icons are re-derived from static pillar copy by id (DB slugs mirror static).
  const iconFor = (id: string) => staticPillars.find((p) => p.id === id)?.icon ?? Sparkles;
  const pillarById = new Map(pillars.map((p) => [p.id, p] as const));

  return (
    <>
      {/* ===== a. HERO (split) ===== */}
      <section className="relative overflow-hidden bg-cream">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,color-mix(in_srgb,var(--ftf-accent)_12%,transparent),transparent_55%)]"
        />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-28">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block text-xs font-semibold uppercase tracking-[0.3em] text-accent-text">
              Our Work
            </span>
            <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-bold leading-[1.1] text-text-primary sm:text-5xl lg:text-6xl">
              Five pillars. One pathway. From disadvantage to opportunity.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-text-secondary">
              {siteConfig.positioning}
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a
                href="#pillars"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-3.5 text-base font-semibold text-text-on-primary shadow-lg shadow-primary/20 transition-all hover:bg-primary-hover hover:scale-[1.02]"
              >
                Explore the pillars
                <ArrowDown className="h-4 w-4" aria-hidden="true" />
              </a>
              <Link
                href="/donate"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-cta px-7 py-3.5 text-base font-semibold text-on-cta shadow-lg shadow-accent/20 transition-all hover:bg-cta-hover hover:scale-[1.02]"
              >
                <Heart className="h-5 w-5" aria-hidden="true" />
                Give Now
              </Link>
            </div>
          </motion.div>

          {/* Right: pillar-accent visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="relative"
          >
            {/* Shot brief: warm, natural-light photograph of children and an FTF
                volunteer engaged in a community learning session in Greater Accra,
                Ghana - candid and dignity-first, never staged "poverty" imagery. */}
            <div className="overflow-hidden rounded-3xl border border-border shadow-2xl shadow-primary/10">
              <Image
                src={img("/images/page-heroes/initiatives-hero.jpg")}
                alt="Children and an FTF volunteer taking part in a community learning session in Greater Accra, Ghana."
                width={900}
                height={700}
                className="h-full w-full object-cover"
                priority
                unoptimized
              />
            </div>
            {/* Floating five-pillar legend */}
            <div className="absolute -bottom-6 left-4 right-4 rounded-2xl border border-border bg-surface/95 p-4 shadow-xl backdrop-blur sm:left-6 sm:right-6">
              <ul className="grid gap-2 sm:grid-cols-2">
                {pillars.map((pillar) => (
                  <li key={pillar.id} className="flex items-center gap-2.5 text-xs font-medium text-text-secondary">
                    <span
                      aria-hidden="true"
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: accentVar(pillar.number) }}
                    />
                    <span className="truncate">
                      <span className="font-semibold text-text-primary">{pillar.number}.</span> {pillar.title}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
        {/* Spacer so the floating legend never overlaps the next section on mobile */}
        <div className="h-10 sm:h-12" aria-hidden="true" />
      </section>

      {/* ===== b. DEVELOPMENT PATHWAY INTRO ===== */}
      <SectionWrapper background="sand">
        <div className="mx-auto max-w-3xl text-center">
          <SectionHeader
            overline="How our work fits together"
            title="One coherent development pathway"
            description="Every programme FTF runs sits within one of five pillars - and the pillars are not separate projects. They connect into a single journey that carries a child from access to school, through learning, dignity and future-ready skills, to mentorship, work and leadership. Support anywhere on the pathway reinforces the whole of it."
          />
          <a
            href="#journey"
            className="inline-flex items-center gap-2 rounded-full border-2 border-border px-7 py-3 text-sm font-semibold text-text-secondary transition-all hover:border-accent hover:text-accent-text"
          >
            See how FTF changes a future
            <ArrowDown className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </SectionWrapper>

      {/* ===== c. JOURNEY ===== */}
      <SectionWrapper background="white" id="journey" className="scroll-mt-24">
        <SectionHeader
          overline="Our theory of change"
          title="How FTF changes a future"
          description="Seven connected stages, each delivered primarily by one of the five pillars - from staying in school to giving back as a mentor and leader."
        />
        <JourneyStepper />
      </SectionWrapper>

      {/* ===== d. FIVE PILLARS GRID ===== */}
      <SectionWrapper background="cream" id="pillars" className="scroll-mt-24">
        <SectionHeader
          overline="The five pillars"
          title="Our five programme pillars"
          description="Each pillar addresses a distinct part of a child's journey. Explore a pillar to see the challenge, what we do, and the programmes delivering it."
        />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {pillars.map((pillar, i) => {
            const Icon = iconFor(pillar.id);
            return (
            <motion.div
              key={pillar.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
            >
              <Link
                href={`/our-work/${pillar.id}`}
                className={`${cardClasses} group relative flex h-full flex-col overflow-hidden border-t-4 ${cardPadding.compact}`}
                style={{ borderTopColor: accentVar(pillar.number) }}
              >
                {/* Ghost number - decorative */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-1 -top-3 font-[family-name:var(--font-display)] text-6xl font-bold opacity-[0.08]"
                  style={{ color: accentVar(pillar.number) }}
                >
                  {pillar.number}
                </span>
                <div
                  className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl"
                  style={{ backgroundColor: accentTint(pillar.number) }}
                >
                  <Icon
                    aria-hidden="true"
                    className="h-5 w-5"
                    style={{ color: accentVar(pillar.number) }}
                  />
                </div>
                <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-text-tertiary">
                  Pillar {pillar.number}
                </span>
                <h3 className="mt-1 text-base font-bold leading-snug text-text-primary">
                  {pillar.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-text-tertiary">
                  {pillar.summary}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-accent-text transition-all group-hover:gap-2">
                  Explore pillar <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
              </Link>
            </motion.div>
            );
          })}
        </div>
      </SectionWrapper>

      {/* ===== e. PROGRAMMES OVERVIEW (sectioned by pillar) ===== */}
      {grouped.map(({ pillarId, programmes }, index) => {
        const pillar = pillarById.get(pillarId);
        if (!pillar) return null;
        const Icon = iconFor(pillarId);
        return (
        <SectionWrapper
          key={pillarId}
          background={index % 2 === 0 ? "warm" : "white"}
          id={`programmes-${pillarId}`}
          className="scroll-mt-24"
        >
          {/* Left-aligned section header */}
          <div className="mb-10 flex flex-col gap-4 border-l-4 pl-5 sm:flex-row sm:items-center sm:gap-6 sm:pl-6" style={{ borderColor: accentVar(pillar.number) }}>
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl"
              style={{ backgroundColor: accentTint(pillar.number, 18) }}
            >
              <Icon aria-hidden="true" className="h-6 w-6" style={{ color: accentVar(pillar.number) }} />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-text">
                Pillar {pillar.number}
              </span>
              <h2 className="mt-1 font-[family-name:var(--font-display)] text-2xl font-bold text-text-primary sm:text-3xl">
                {pillar.title}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-text-tertiary">
                {pillar.summary}
              </p>
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {programmes.map((programme) => (
              <ProgrammeCard key={programme.slug} programme={programme} pillarId={pillarId} />
            ))}
          </div>
        </SectionWrapper>
        );
      })}

      {/* ===== f. WHERE WE WORK ===== */}
      <SectionWrapper background="sand">
        <SectionHeader
          overline="Where we work"
          title="Programme delivery in two countries"
          description="FTF delivers programmes in Ghana and Nigeria. Our US 501(c)(3) is a funding vehicle that supports this work - not a third programme country."
        />
        <div className="grid gap-6 md:grid-cols-2">
          <div className={`${cardClasses} ${cardPadding.default}`}>
            <div className="flex items-center gap-3">
              <MapPin aria-hidden="true" className="h-5 w-5 text-accent-text" />
              <h3 className="font-[family-name:var(--font-display)] text-xl font-bold text-text-primary">Ghana</h3>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-text-secondary">
              Greater Accra is our core, with regional outreach across {ghana.length} regions.
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {ghana.map((region) => (
                <li key={region} className="rounded-full border border-border px-3 py-1 text-xs font-medium text-text-secondary">
                  {region}
                </li>
              ))}
            </ul>
          </div>
          <div className={`${cardClasses} ${cardPadding.default}`}>
            <div className="flex items-center gap-3">
              <MapPin aria-hidden="true" className="h-5 w-5 text-accent-text" />
              <h3 className="font-[family-name:var(--font-display)] text-xl font-bold text-text-primary">Nigeria</h3>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-text-secondary">
              Programming is based in Ibadan, Oyo State, delivered with local partners.
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {nigeria.map((region) => (
                <li key={region} className="rounded-full border border-border px-3 py-1 text-xs font-medium text-text-secondary">
                  {region}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </SectionWrapper>

      {/* ===== g. CTA (mirrors homepage Closing CTA) ===== */}
      <section className="relative overflow-hidden bg-primary py-20 md:py-24">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,color-mix(in_srgb,var(--ftf-accent)_18%,transparent),transparent_55%)]"
        />
        <div className="relative mx-auto max-w-3xl px-6 text-center lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold leading-tight text-text-on-primary md:text-5xl">
              Support the work that matters most to you
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-text-on-primary/70">
              Whether you give, volunteer or partner, your support reaches a
              specific pillar - and a specific child's journey.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/donate"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-cta px-8 py-4 text-base font-semibold text-on-cta shadow-lg shadow-accent/20 transition-all hover:bg-cta-hover hover:scale-[1.02] sm:w-auto"
              >
                <Heart className="h-5 w-5" aria-hidden="true" />
                Give Now
              </Link>
              <Link
                href="/volunteer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-text-on-primary/25 px-8 py-4 text-base font-semibold text-text-on-primary transition-all hover:bg-text-on-primary/10 sm:w-auto"
              >
                <Users className="h-5 w-5" aria-hidden="true" />
                Volunteer
              </Link>
              <Link
                href="/partners"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-text-on-primary/25 px-8 py-4 text-base font-semibold text-text-on-primary transition-all hover:bg-text-on-primary/10 sm:w-auto"
              >
                <Handshake className="h-5 w-5" aria-hidden="true" />
                Partner With FTF
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
