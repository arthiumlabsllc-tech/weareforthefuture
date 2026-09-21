"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  MapPin,
  ArrowRight,
  ArrowUpRight,
  Calendar,
  Users,
  Heart,
  Globe,
  BookOpen,
} from "lucide-react";
import SectionWrapper, { SectionHeader } from "@/components/ui/SectionWrapper";
import { img } from "@/lib/imageUrl";
import { pillars } from "@/data/pillars";
import { executiveBoard } from "@/data/executiveBoard";
import { siteConfig } from "@/data/site";

/**
 * FTF Nigeria context page (brief §10.9). Every figure on this page is verified
 * against a data source - initiatives.ts (programme facts), executiveBoard.ts
 * (Nigeria-led governance), milestones/site.ts (2025 start, Ibadan base). We do
 * NOT invent cumulative country totals: where a number is organisation-wide it
 * is labelled as such, and Nigeria-specific stories stay an honest empty state
 * until safeguarding-approved consent is in place.
 */

interface NigeriaProgramme {
  name: string;
  pillarSlug: string;
  href: string;
  image: string;
  blurb: string;
  highlights: string[];
  /** Verified programme figure (null when none is separately published). */
  participants: number | null;
  participantsNote?: string;
}

/* The two programmes FTF Nigeria runs in Ibadan (brief §10.9), grounded in
   src/data/initiatives.ts. Pillar mapping follows the canonical
   scripts/seed-pillars.ts PROGRAM_PILLAR that powers the live /our-work tree,
   so each card links to a pillar route that is guaranteed to exist. */
const NIGERIA_PROGRAMMES: NigeriaProgramme[] = [
  {
    name: "Student Training & Education Project (STEP)",
    pillarSlug: "foundational-education",
    href: "/our-work/foundational-education",
    image: img("/images/initiatives/smart-start.jpg"),
    blurb:
      "FTF's flagship education sponsorship - tuition, learning materials, mentorship and career guidance so children enrol, stay in school and progress with confidence.",
    highlights: [
      "Tuition sponsorship",
      "Learning materials",
      "Career guidance",
      "Leadership development",
    ],
    participants: null,
  },
  {
    name: "Project Momentum",
    pillarSlug: "future-ready-skills",
    href: "/our-work/future-ready-skills",
    image: img("/images/initiatives/project-momentum.jpg"),
    blurb:
      "The official launch initiative of FTF Nigeria - academic support, career mentorship and leadership development for secondary school students in Ibadan, Oyo State.",
    highlights: [
      "Academic tutoring",
      "Career mentorship",
      "Leadership workshops",
      "University preparation",
    ],
    participants: 350,
    participantsNote: "2025 launch cohort",
  },
];

/* Nigeria-led governance - verified count from src/data/executiveBoard.ts. */
const nigeriaBoardCount = executiveBoard.filter((m) => m.country === "Nigeria").length;

/* Pillars active in Ibadan = the Nigeria programmes' pillars, unioned with the
   pillars whose canonical whereItWorks copy (src/data/pillars.ts) names Nigeria
   or Ibadan. Data-driven, so it stays honest as the pillar copy evolves. */
const activePillarIds = new Set<string>([
  ...NIGERIA_PROGRAMMES.map((p) => p.pillarSlug),
  ...pillars.filter((p) => /nigeria|ibadan/i.test(p.whereItWorks)).map((p) => p.id),
]);

const nigeriaRegions = siteConfig.regions.nigeria;

export default function NigeriaClient() {
  return (
    <>
      {/* ===== HERO ===== */}
      <section className="relative flex min-h-[60vh] items-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={img("/images/initiatives/project-momentum.jpg")}
            alt="FTF Nigeria programming in Ibadan, Oyo State"
            fill
            className="object-cover"
            priority
            unoptimized
          />
          <div className="absolute inset-0 bg-primary/75" />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/50 to-primary/70" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-32 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <span className="mb-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-accent-text">
              <Globe className="h-4 w-4" aria-hidden="true" />
              FTF Nigeria
            </span>
            <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold leading-[1.1] text-text-on-primary sm:text-5xl md:text-6xl">
              FTF Nigeria · Ibadan, Oyo State
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-text-on-primary/75">
              Community-embedded education, mentorship and future-ready skills -
              delivered in Ibadan within the same five-pillar framework we use
              across Ghana. One model, deep roots, local leadership.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/give"
                className="inline-flex items-center gap-2 rounded-full bg-cta px-7 py-3.5 text-sm font-semibold text-on-cta shadow-lg shadow-accent/20 transition-all hover:bg-cta-hover hover:scale-[1.02]"
              >
                Give to Nigeria programmes
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/partners"
                className="inline-flex items-center gap-2 rounded-full border border-text-on-primary/30 bg-text-on-primary/5 px-7 py-3.5 text-sm font-semibold text-text-on-primary transition-all hover:border-accent hover:text-accent-text"
              >
                Partner locally
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== INTRO + VERIFIED SNAPSHOT ===== */}
      <SectionWrapper background="white">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <SectionHeader
              align="left"
              overline="Operating in Ibadan since 2025"
              title="A decade of community-rooted work, now in Nigeria"
            />
            <div className="-mt-6 space-y-4 leading-relaxed text-text-secondary">
              <p>
                For The Future (FTF) Nigeria extends ten years of community-rooted
                programming from Ghana into Nigeria. Operations began in 2025 in
                Ibadan, Oyo State, with two programmes - the Student Training &amp;
                Education Project (STEP) and Project Momentum.
              </p>
              <p>
                The approach is the same one that guides our work everywhere: meet
                children and young people where they are, work alongside schools,
                families and local partners rather than replacing them, and grow
                under a Nigeria-led executive board that keeps decisions close to
                the community.
              </p>
            </div>
          </motion.div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { value: "2025", label: "Operations began", sub: "Ibadan, Oyo State", icon: Calendar },
              { value: String(NIGERIA_PROGRAMMES.length), label: "Programmes running", sub: "STEP · Project Momentum", icon: BookOpen },
              { value: String(nigeriaBoardCount), label: "Nigeria-led board", sub: "Local governance", icon: Users },
              { value: "1", label: "Delivery state", sub: "Oyo State (Ibadan core)", icon: MapPin },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                className="rounded-2xl border border-border bg-surface p-6"
              >
                <s.icon className="h-5 w-5 text-accent-text" aria-hidden="true" />
                <div className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold text-text-primary">
                  {s.value}
                </div>
                <div className="mt-1 text-sm font-semibold text-text-primary">{s.label}</div>
                <div className="mt-0.5 text-xs text-text-muted">{s.sub}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </SectionWrapper>

      {/* ===== PROGRAMMES IN NIGERIA ===== */}
      <SectionWrapper background="warm">
        <SectionHeader
          overline="What we run in Ibadan"
          title="Our programmes in Nigeria"
          description="Two programmes, one framework - each linked to the pillar it primarily delivers under."
        />
        <div className="grid gap-8 md:grid-cols-2">
          {NIGERIA_PROGRAMMES.map((programme, i) => {
            const pillar = pillars.find((p) => p.id === programme.pillarSlug);
            return (
              <motion.article
                key={programme.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5"
              >
                <div className="relative aspect-[16/9] overflow-hidden bg-bg-tertiary">
                  <Image
                    src={programme.image}
                    alt={programme.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    unoptimized
                  />
                  {programme.participants !== null && (
                    <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-navy-900/85 px-3 py-1 text-xs font-semibold text-white">
                      <Users className="h-3.5 w-3.5" aria-hidden="true" />
                      {programme.participants} participants
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-7">
                  {pillar && (
                    <Link
                      href={programme.href}
                      className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-accent-subtle px-3 py-1 text-xs font-semibold text-accent-text transition-colors hover:bg-accent/20"
                    >
                      Pillar {pillar.number} · {pillar.title}
                      <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                  )}
                  <h3 className="font-[family-name:var(--font-display)] text-xl font-bold text-text-primary">
                    {programme.name}
                  </h3>
                  {programme.participantsNote && (
                    <p className="mt-1 text-xs font-medium text-text-muted">
                      {programme.participantsNote}
                    </p>
                  )}
                  <p className="mt-3 leading-relaxed text-text-secondary">{programme.blurb}</p>
                  <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                    {programme.highlights.map((h) => (
                      <li key={h} className="flex items-start gap-2 text-sm text-text-secondary">
                        <span
                          className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
                          aria-hidden="true"
                        />
                        {h}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={programme.href}
                    className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-accent-text transition-colors hover:text-accent-hover"
                  >
                    Explore the pillar
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              </motion.article>
            );
          })}
        </div>
      </SectionWrapper>

      {/* ===== UNIFIED FIVE-PILLAR FRAMEWORK ===== */}
      <SectionWrapper background="white">
        <SectionHeader
          overline="One framework"
          title="The same five pillars, everywhere we work"
          description="FTF Nigeria is not a separate model. A child in Ibadan and a child in Greater Accra are supported by one coherent theory of change - the five programme pillars."
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {pillars.map((pillar, i) => {
            const active = activePillarIds.has(pillar.id);
            const Icon = pillar.icon;
            return (
              <motion.div
                key={pillar.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.06 }}
                className={`flex flex-col rounded-2xl border p-6 transition-colors ${
                  active
                    ? "border-accent bg-accent-subtle"
                    : "border-border bg-surface"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-bg-tertiary text-text-secondary">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <span className="font-[family-name:var(--font-display)] text-sm font-bold text-text-muted">
                    0{pillar.number}
                  </span>
                </div>
                <h3 className="mt-4 font-[family-name:var(--font-display)] text-lg font-bold text-text-primary">
                  {pillar.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-text-secondary">
                  {pillar.summary}
                </p>
                <div className="mt-4 flex items-center justify-between gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                      active
                        ? "bg-cta text-on-cta"
                        : "bg-bg-tertiary text-text-muted"
                    }`}
                  >
                    {active ? (
                      <>
                        <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                        Active in Ibadan
                      </>
                    ) : (
                      "Shared framework"
                    )}
                  </span>
                  <Link
                    href={`/our-work/${pillar.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-accent-text transition-colors hover:text-accent-hover"
                  >
                    Pillar
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </SectionWrapper>

      {/* ===== WHERE WE WORK IN NIGERIA ===== */}
      <SectionWrapper background="gradient">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <SectionHeader
              align="left"
              overline="Where we work"
              title="Ibadan core, growing with the community"
            />
            <div className="-mt-6 space-y-4 leading-relaxed text-text-secondary">
              <p>
                Our presence in Nigeria is deep rather than wide. Ibadan, in Oyo
                State, is the current core of operations - a focused footprint that
                lets us know the children, families and schools we serve by name,
                and grow deliberately alongside local partners.
              </p>
              <ul className="flex flex-wrap gap-2 pt-1">
                {nigeriaRegions.map((region) => (
                  <li
                    key={region}
                    className="inline-flex items-center gap-1.5 rounded-full bg-primary-subtle px-3.5 py-1.5 text-sm font-medium text-primary"
                  >
                    <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                    {region}
                  </li>
                ))}
              </ul>
              <Link
                href="/about/where-we-work"
                className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-accent-text transition-colors hover:text-accent-hover"
              >
                See where we work
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.12 }}
            className="rounded-2xl border border-border bg-surface p-8"
          >
            <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-text-primary">
              Nigeria-led governance
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">
              FTF Nigeria is stewarded by a dedicated executive board of{" "}
              {nigeriaBoardCount} members based in Nigeria - an Executive Director,
              programmes, finance, research, monitoring &amp; evaluation,
              curriculum, volunteers and community engagement leads - so decisions
              stay accountable to the community they serve.
            </p>
            <Link
              href="/about/team#governance"
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-accent-text transition-colors hover:text-accent-hover"
            >
              Meet the team &amp; governance
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </motion.div>
        </div>
      </SectionWrapper>

      {/* ===== IMPACT IN NIGERIA (VERIFIED FIGURES ONLY) ===== */}
      <SectionWrapper background="white">
        <SectionHeader
          overline="Impact in Nigeria"
          title="Verified figures only"
          description="We publish what we can verify. As FTF Nigeria scales, cumulative country totals are being consolidated with the same monitoring and safeguarding rigour we apply across the organisation."
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { value: "2025", label: "Operations began", sub: "Ibadan, Oyo State" },
            { value: "350", label: "Project Momentum participants", sub: "2025 launch cohort" },
            { value: String(nigeriaBoardCount), label: "Nigeria-led board members", sub: "Local governance" },
            { value: String(NIGERIA_PROGRAMMES.length), label: "Programmes running", sub: "STEP · Project Momentum" },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              className="rounded-2xl border border-border bg-surface p-7 text-center"
            >
              <div className="font-[family-name:var(--font-display)] text-4xl font-bold text-accent-text">
                {s.value}
              </div>
              <div className="mt-2 font-semibold text-text-primary">{s.label}</div>
              <div className="mt-1 text-sm text-text-muted">{s.sub}</div>
            </motion.div>
          ))}
        </div>
        <p className="mx-auto mt-8 max-w-3xl text-center text-sm leading-relaxed text-text-secondary">
          Organisation-wide, FTF has reached{" "}
          <span className="font-semibold text-text-primary">
            {siteConfig.stats.beneficiaries.toLocaleString()}+
          </span>{" "}
          children and young people across Ghana and Nigeria over ten years of
          community-rooted programming. This is a whole-organisation figure, not a
          Nigeria-only total.
        </p>
      </SectionWrapper>

      {/* ===== STORIES FROM NIGERIA (SAFEGUARDING-GATED) ===== */}
      <SectionWrapper background="warm">
        <SectionHeader
          overline="Stories from Nigeria"
          title="Published only with consent"
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl rounded-2xl border border-dashed border-border bg-surface p-10 text-center"
        >
          <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-subtle text-accent-text">
            <Heart className="h-7 w-7" aria-hidden="true" />
          </span>
          <h3 className="mt-4 font-[family-name:var(--font-display)] text-xl font-bold text-text-primary">
            Nigeria stories are being gathered with safeguarding approval
          </h3>
          <p className="mt-3 leading-relaxed text-text-secondary">
            We publish a young person&apos;s story only with informed,
            safeguarding-approved consent - never before. Approved stories from
            across FTF appear on Stories of Change; Nigeria stories will join them
            as consent and safeguarding review are completed.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/impact-stories"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-text-on-primary transition-all hover:scale-[1.02]"
            >
              Read Stories of Change
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/about/safeguarding"
              className="inline-flex items-center gap-2 rounded-full border border-border-strong bg-surface px-6 py-3 text-sm font-semibold text-text-primary transition-all hover:border-accent hover:text-accent-text"
            >
              Our safeguarding commitment
            </Link>
          </div>
        </motion.div>
      </SectionWrapper>

      {/* ===== CTA ===== */}
      <SectionWrapper background="navy">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold text-text-on-primary md:text-4xl">
            Support the work in Nigeria
          </h2>
          <p className="mt-4 text-lg text-text-on-primary/70">
            Back STEP and Project Momentum in Ibadan, or partner with FTF Nigeria to
            reach more children and young people across Oyo State.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/give"
              className="inline-flex items-center gap-2 rounded-full bg-cta px-7 py-3.5 text-sm font-semibold text-on-cta shadow-lg shadow-accent/20 transition-all hover:bg-cta-hover hover:scale-[1.02]"
            >
              Give to Nigeria programmes
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/partners"
              className="inline-flex items-center gap-2 rounded-full border border-text-on-primary/30 bg-text-on-primary/5 px-7 py-3.5 text-sm font-semibold text-text-on-primary transition-all hover:border-accent hover:text-accent-text"
            >
              Partner locally
            </Link>
          </div>
        </div>
      </SectionWrapper>
    </>
  );
}
