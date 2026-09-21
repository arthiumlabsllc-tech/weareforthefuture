"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { img } from "@/lib/imageUrl";
import { ArrowRight, Heart, Play, ShieldCheck, Sparkles } from "lucide-react";
import SectionWrapper, { SectionHeader } from "@/components/ui/SectionWrapper";
import StatDisplay from "@/components/ui/StatDisplay";
import Timeline from "@/components/ui/Timeline";
import { decadeMilestones } from "@/data/milestones";
import { successStories } from "@/data/impact";
import { siteConfig } from "@/data/site";

/**
 * /impact/ftf-at-10 - a permanent milestone page (Phase 4).
 *
 * This is not ephemeral anniversary content: it frames the first decade
 * (2016 → 2026) as a standing part of FTF's story and reuses the shared
 * <Timeline> component and `decadeMilestones` data from /about/our-story rather
 * than duplicating the markup. Beneficiary journeys use only safeguarding-
 * approved stories; the documentary block is an honest placeholder until the
 * film is ready. All numbers are static (no count-up).
 */

/* Curated decade highlights - real, mapped assets only (no invented photos). */
const highlights = [
  {
    year: "2016",
    title: "A first outreach in Ashaiman",
    image: img("/images/about/ftf-tamale-1.jpg"),
    caption: "Where it began - students showing up for children in their own community.",
  },
  {
    year: "2021",
    title: "The FTF Village concept",
    image: img("/images/about/ftf-village-1.jpg"),
    caption: "A long-term vision of housing, learning and belonging takes shape.",
  },
  {
    year: "2022",
    title: "Chess in Slums",
    image: img("/images/initiatives/chess-in-slums.jpg"),
    caption: "A partnership brings chess-based learning, focus and mentorship to new communities.",
  },
  {
    year: "2023",
    title: "Empower Her, Period",
    image: img("/images/initiatives/empower-her.jpg"),
    caption: "Girls' dignity and retention programming launches alongside Saturday learning clubs.",
  },
  {
    year: "2024",
    title: "Click4Change",
    image: img("/images/initiatives/click-4-change.jpg"),
    caption: "Digital inclusion puts future-ready skills in young people's hands.",
  },
  {
    year: "2025",
    title: "Nigeria + 501(c)(3)",
    image: img("/images/news/board-of-trustees.jpg"),
    caption: "Operations begin in Ibadan and a US vehicle is established to steward partnerships.",
  },
];

export default function FTFat10Client() {
  const { yearsOfFoundation, beneficiaries, volunteers, campaigns } = siteConfig.stats;

  return (
    <>
      {/* ===== HERO ===== */}
      <section className="relative flex min-h-[60vh] items-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={img("/images/stories/hero-bg.jpg")}
            alt="For The Future Organization at ten years"
            fill
            className="object-cover"
            priority
            unoptimized
          />
          <div className="absolute inset-0 bg-primary/75" />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/50 to-primary/75" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-32 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-accent-text">
              <Sparkles className="h-4 w-4" aria-hidden="true" /> 2016 → 2026
            </span>
            <h1 className="mt-5 font-[family-name:var(--font-display)] text-5xl font-bold leading-[1.05] text-text-on-primary sm:text-6xl md:text-7xl">
              FTF at 10
            </h1>
            <p className="mt-5 font-[family-name:var(--font-display)] text-2xl font-semibold text-accent-bright sm:text-3xl">
              It takes all of us.
            </p>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-text-on-primary/75">
              Ten years of community-rooted work - from a first outreach in
              Ashaiman to a five-pillar model across Ghana and Nigeria. This page
              stays as a permanent record of the decade and the commitment behind
              the next one.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ===== A DECADE IN NUMBERS (static - no count-up) ===== */}
      <SectionWrapper background="white">
        <SectionHeader
          overline="A decade in numbers"
          title="Ten years, measured"
          description="Verified organisational figures for 2016 → 2026."
        />
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <StatDisplay value={`${yearsOfFoundation}`} label="Years of continuous impact" />
          <StatDisplay
            value={beneficiaries.toLocaleString()}
            suffix="+"
            label="Children and young people reached"
          />
          <StatDisplay value={`${volunteers}`} suffix="+" label="Volunteers mobilised" />
          <StatDisplay value={`${campaigns}`} suffix="+" label="Campaigns and activities" />
        </div>
      </SectionWrapper>

      {/* ===== TIMELINE (reused component - not duplicated) ===== */}
      <SectionWrapper background="gradient">
        <SectionHeader
          overline="2016 → 2026"
          title="The road so far"
          description="The moments that shaped who we are and how we work today - the same timeline told in Our Story."
        />
        <Timeline milestones={decadeMilestones} />
        <div className="mt-10 text-center">
          <Link
            href="/about/our-story"
            className="inline-flex items-center gap-2 text-sm font-semibold text-accent-text hover:underline"
          >
            Read the full story <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </SectionWrapper>

      {/* ===== KEY MILESTONES + PHOTOS ===== */}
      <SectionWrapper background="warm">
        <SectionHeader
          overline="Key milestones"
          title="Moments that made the decade"
          description="A selection of the programmes, partnerships and firsts that define ten years of work."
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {highlights.map((h, i) => (
            <motion.article
              key={`${h.year}-${h.title}`}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.5 }}
              className="group overflow-hidden rounded-2xl border border-border bg-surface"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={h.image}
                  alt={h.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  unoptimized
                />
                <span className="absolute left-3 top-3 rounded-full bg-primary/85 px-3 py-1 text-xs font-bold text-text-on-primary tabular-nums">
                  {h.year}
                </span>
              </div>
              <div className="p-6">
                <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-text-primary">
                  {h.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">{h.caption}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </SectionWrapper>

      {/* ===== BENEFICIARY JOURNEYS (safeguarding-approved only) ===== */}
      <SectionWrapper background="white">
        <SectionHeader
          overline="Beneficiary journeys"
          title="Ten years, in their own steps"
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
              className="rounded-2xl border border-border bg-bg-primary p-8"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent-subtle text-accent-text">
                <Heart className="h-6 w-6" aria-hidden="true" />
              </div>
              <p className="mb-6 italic leading-relaxed text-text-secondary">
                &ldquo;{story.story}&rdquo;
              </p>
              <div className="border-t border-border pt-4">
                <div className="font-semibold text-text-primary">{story.name}</div>
                <div className="text-sm text-text-tertiary">{story.location}</div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-success-bg px-3 py-1 text-xs font-medium text-success-text">
                    {story.program}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-bg-tertiary px-3 py-1 text-xs font-medium text-text-secondary">
                    <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" /> Safeguarding-approved
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      {/* ===== DOCUMENTARY / FILM (placeholder until ready) ===== */}
      <SectionWrapper background="warm">
        <div className="mx-auto max-w-4xl">
          <SectionHeader
            overline="Film"
            title="The first decade, on film"
            description="A short documentary capturing ten years of work and the people behind it."
          />
          <div className="relative aspect-video overflow-hidden rounded-2xl border border-border bg-primary">
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
              <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-cta text-on-cta shadow-lg shadow-accent/30">
                <Play className="h-7 w-7" aria-hidden="true" />
              </span>
              <p className="font-[family-name:var(--font-display)] text-xl font-bold text-text-on-primary">
                Documentary coming soon
              </p>
              <p className="max-w-md text-sm leading-relaxed text-text-on-primary/70">
                The trailer and full film will premiere here once production is
                complete. Until then, the timeline and milestones above tell the
                story of the decade.
              </p>
            </div>
          </div>
        </div>
      </SectionWrapper>

      {/* ===== CTA - BUILD THE NEXT DECADE ===== */}
      <SectionWrapper background="navy">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold text-text-on-primary md:text-4xl">
            Build the next decade with us
          </h2>
          <p className="mt-4 text-lg text-text-on-primary/70">
            The first ten years taught us what works. The next is about scale,
            depth and staying true to the children we serve. It takes all of us.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/donate"
              className="inline-flex items-center gap-2 rounded-full bg-cta px-7 py-3.5 text-sm font-semibold text-on-cta shadow-lg shadow-accent/20 transition-all hover:bg-cta-hover hover:scale-[1.02]"
            >
              Give Now <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/our-work"
              className="inline-flex items-center gap-2 rounded-full border border-border-strong bg-surface/10 px-7 py-3.5 text-sm font-semibold text-text-on-primary transition-all hover:border-accent hover:text-accent-bright"
            >
              See our work
            </Link>
          </div>
        </div>
      </SectionWrapper>
    </>
  );
}
