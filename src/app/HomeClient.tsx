"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Handshake,
  Heart,
  Quote,
  Users,
} from "lucide-react";
import { img } from "@/lib/imageUrl";
import SectionWrapper, { SectionHeader } from "@/components/ui/SectionWrapper";
import ProgrammeArtwork from "@/components/ui/ProgrammeArtwork";
import TrustChips from "@/components/home/TrustChips";
import JourneyStepper from "@/components/home/JourneyStepper";
import PartnerWithUsBlock from "@/components/home/PartnerWithUsBlock";
import CurrentPriorities, { type Priority } from "@/components/home/CurrentPriorities";
import { siteConfig } from "@/data/site";
import { trackNewsletterSignup } from "@/lib/analytics";
import { pillars } from "@/data/pillars";
import { storyStats, successStories } from "@/data/impact";
import type { FeaturedProgramme } from "@/lib/pillars";

const isDev = process.env.NODE_ENV === "development";

/**
 * Homepage featured work - DB-driven (Phase 3b.2). The server page passes the
 * CMS `isFeatured` set via getFeaturedProgrammes(); each card deep-links into
 * the /our-work/{pillar}/{programme} detail template. The hard-coded launch set
 * below (decision 5B) is retained ONLY as a last-resort fallback if that call
 * returns nothing (e.g. an unreachable DB with no static match), so the four
 * flagship programmes always show.
 */
const FALLBACK_FEATURED: FeaturedProgramme[] = [
  {
    title: "S.T.E.P.",
    pillar: "Pillar 1 · Foundational Education",
    description:
      "The Student Training & Education Project sponsors the holistic education of vulnerable children - tuition, learning materials, mentorship and career guidance.",
    image: img("/images/initiatives/smart-start.jpg"),
    href: "/our-work/foundational-education/step-project",
  },
  {
    title: "Foundational Learning / Learning Clubs",
    pillar: "Pillar 1 · Foundational Education",
    description:
      "Literacy, numeracy and Saturday learning clubs that help children catch up, keep up and stay in school with confidence.",
    image: img("/images/initiatives/smart-start.jpg"),
    href: "/our-work/foundational-education/smart-start-initiative",
  },
  {
    title: "Future Pathways",
    pillar: "Pillar 3 · Future-Ready Skills",
    description:
      "Digital, vocational and entrepreneurship training that prepares young people for a real transition to work and independent income.",
    image: img("/images/initiatives/click-4-change.jpg"),
    href: "/our-work/future-ready-skills/future-pathways",
  },
  {
    title: "Empower Her, Period",
    pillar: "Pillar 2 · Girls' Education & Dignity",
    description:
      "Menstrual health education and free sanitary products, so no girl misses school or loses dignity because of her period.",
    image: img("/images/initiatives/empower-her.jpg"),
    href: "/our-work/girls-education-dignity/empower-her-period",
  },
];

export default function HomeClient({
  initialPriorities,
  featured = [],
}: {
  initialPriorities: Priority[];
  featured?: FeaturedProgramme[];
}) {
  const featuredProgrammes = featured.length > 0 ? featured : FALLBACK_FEATURED;
  const reduceMotion = useReducedMotion();
  const { villageCurrency, villageRaised, villageGoal } = siteConfig.donation;
  const villagePercent = Math.round((villageRaised / villageGoal) * 100);
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [newsletterState, setNewsletterState] = useState<"idle" | "error" | "success">("idle");

  function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    // Consent gate - a subscription without explicit consent is not allowed.
    if (!consent) {
      setNewsletterState("error");
      return;
    }
    // TODO(newsletter): POST to a public subscribe endpoint once one exists
    // (current /api/admin/newsletter is admin-only). For now this is a
    // client-side confirmation of the consent-gated form.
    setNewsletterState("success");
    trackNewsletterSignup();
    setEmail("");
    setConsent(false);
  }

  return (
    <>
      {/* ===== 1. HERO (split editorial: text left, campaign card right) =====
          Craft reference: Givra-style split hero (Phase 12 Step 2 revision) with
          FTF skin only. Left column is LCP-critical and fully static: the H1
          paints in the server-rendered HTML at FCP with no JS/opacity gate (an
          opacity 0→1 fade on the LCP element delays LCP by ~3s on throttled
          mobile - Phase 7.2 audit). The only entrance motion is the campaign
          card reveal, disabled under prefers-reduced-motion per DESIGN.md §8. */}
      <section className="relative overflow-hidden bg-cream">
        {/* Top padding below lg clears the fixed navbar (80px) + the fixed
            ImpactMarquee band (~33px) so the eyebrow is never covered on
            mobile/tablet; at lg the 85vh vertical centering handles it. */}
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 pt-40 pb-[var(--spacing-section)] lg:min-h-[85vh] lg:grid-cols-[3fr_2fr] lg:gap-16 lg:px-8 lg:py-[var(--spacing-section)]">
          <div>
            <span className="inline-flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-text-tertiary">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
              We Are For The Future
            </span>
            <h1 className="mt-7 font-[family-name:var(--font-display)] text-[clamp(2.5rem,6vw,5rem)] font-bold leading-[1.02] tracking-[-0.02em] text-text-primary">
              {siteConfig.tagline}
            </h1>
            <p className="mt-7 max-w-[55ch] text-lg leading-[1.5] text-text-secondary sm:text-xl">
              {siteConfig.description}
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link
                href="/donate"
                className="group inline-flex h-14 items-center justify-center gap-2 rounded-[var(--radius-button)] border-2 border-cta bg-cta px-8 text-base font-semibold text-on-cta shadow-lg shadow-accent/20 transition-all duration-200 hover:scale-[1.02] hover:border-cta-hover hover:bg-cta-hover"
              >
                <Heart className="h-5 w-5 transition-transform group-hover:scale-110" aria-hidden="true" />
                Give Now
              </Link>
              <Link
                href="/initiatives"
                className="inline-flex h-14 items-center justify-center gap-2 rounded-[var(--radius-button)] border-2 border-primary bg-transparent px-8 text-base font-semibold text-primary transition-all duration-200 hover:scale-[1.02] hover:bg-primary/5"
              >
                See Our Work
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Link>
            </div>
            <div className="mt-6 max-w-sm border-t border-border pt-6 sm:max-w-md">
              <p className="text-sm text-text-muted">
                Youth-led · Ghana &amp; Nigeria · Since {siteConfig.founded}
              </p>
            </div>
          </div>

          {/* Campaign card - the hero's only entrance motion (opacity+y, 400ms,
              once). Figures come from siteConfig.donation so the card can never
              drift from the FTF Village section below; the render shows no
              people, so safeguarding consent is not implicated. */}
          <motion.aside
            aria-label="FTF Village Phase One campaign"
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: reduceMotion ? 0 : 0.4, ease: "easeOut" }}
            className="w-full rounded-2xl border border-border bg-surface p-6 shadow-xl shadow-primary/5 sm:p-8"
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-card)] bg-bg-tertiary">
              <Image
                src={img("/images/misc/bento-1.png")}
                alt="Young learners in yellow uniforms seen from behind as a For The Future team member welcomes them - the children FTF Village Phase One will serve"
                fill
                priority
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover"
                data-hero-image="true"
              />
            </div>
            <h2 className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">
              FTF Village · Phase One
            </h2>
            <p className="mt-3 text-sm text-text-secondary">
              <span className="font-[family-name:var(--font-display)] text-3xl font-bold tabular-nums text-text-primary">
                {villageCurrency}
                {villageRaised.toLocaleString()}
              </span>{" "}
              raised of{" "}
              <span className="font-[family-name:var(--font-display)] text-xl font-bold tabular-nums text-text-primary">
                {villageCurrency}
                {villageGoal.toLocaleString()}
              </span>
            </p>
            <div
              role="progressbar"
              aria-valuenow={villagePercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="FTF Village Phase One funding progress"
              className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-journey-track"
            >
              <div
                className="h-full rounded-full bg-accent"
                style={{ width: `${villagePercent}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-text-muted">{villagePercent}% of goal</p>
            <Link
              href="/give/ftf-village-project"
              className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-button)] bg-cta px-6 text-base font-semibold text-on-cta transition-all duration-200 hover:scale-[1.02] hover:bg-cta-hover"
            >
              Support this phase
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </motion.aside>
        </div>
      </section>

      {/* ===== 2. TRUST STRIP ===== */}
      <TrustChips />

      {/* ===== 3. IMPACT STRIP (static - no count-up) ===== */}
      <SectionWrapper background="white" className="!py-14 md:!py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {storyStats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-[family-name:var(--font-display)] text-4xl font-bold tabular-nums text-impact-number md:text-5xl">
                {stat.value}
                {stat.suffix}
              </div>
              <div className="mt-2 text-sm leading-snug text-impact-label">{stat.label}</div>
            </div>
          ))}
        </div>
        <p className="mt-8 text-center text-xs text-impact-meta">
          Verified institutional record · figures last updated {siteConfig.stats.lastUpdated}
        </p>
      </SectionWrapper>

      {/* ===== 4. FIVE PILLARS ===== */}
      <SectionWrapper background="warm">
        <SectionHeader
          overline="How we create change"
          title="Our five pillars"
          description="Every programme sits under one of five strategic pillars, so support reaches every part of a child's journey - from the classroom to the future of work."
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {pillars.map((pillar) => (
            <Link
              key={pillar.id}
              href={`/our-work/${pillar.id}`}
              className="group flex flex-col rounded-2xl border border-border bg-surface p-6 transition-all hover:-translate-y-1 hover:border-accent/50 hover:shadow-xl hover:shadow-primary/5"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-text-on-primary transition-colors group-hover:bg-cta group-hover:text-on-cta">
                  <pillar.icon aria-hidden="true" className="h-5 w-5" />
                </div>
                <span className="font-[family-name:var(--font-display)] text-3xl font-bold text-border-strong">
                  0{pillar.number}
                </span>
              </div>
              <h3 className="mb-2 text-base font-bold text-text-primary">{pillar.title}</h3>
              <p className="flex-1 text-sm leading-relaxed text-text-tertiary">{pillar.summary}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-accent-text">
                Explore
                <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </SectionWrapper>

      {/* ===== 5. JOURNEY - HOW FTF CHANGES A FUTURE ===== */}
      <SectionWrapper background="white">
        <SectionHeader
          overline="Our theory of change"
          title="How FTF changes a future"
          description="Support is not a set of disconnected projects. It is one pathway - from access to school, through learning, dignity and skills, to work and leadership."
        />
        <JourneyStepper />
      </SectionWrapper>

      {/* ===== 6. FEATURED WORK (hard-coded launch set) ===== */}
      <SectionWrapper background="warm">
        <SectionHeader
          overline="Featured work"
          title="Where we're focused right now"
          description="Our launch set of flagship programmes, spanning the five pillars from foundational learning to future-ready skills."
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featuredProgrammes.map((programme, i) => (
            <motion.div
              key={programme.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <Link
                href={programme.href}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-bg-tertiary">
                  <ProgrammeArtwork image={programme.image} title={programme.title} />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-accent-text">
                    {programme.pillar}
                  </span>
                  <h3 className="mt-1.5 text-base font-bold text-text-primary transition-colors group-hover:text-accent-text">
                    {programme.title}
                  </h3>
                  <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-text-secondary">
                    {programme.description}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-accent-text transition-all group-hover:gap-2">
                    Learn more <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link
            href="/our-work"
            className="inline-flex items-center gap-2 rounded-full border-2 border-border px-8 py-3.5 text-sm font-semibold text-text-secondary transition-all hover:border-primary hover:bg-bg-tertiary"
          >
            View all our work
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </SectionWrapper>

      {/* ===== 7. FTF VILLAGE (vision - not operational) ===== */}
      <SectionWrapper background="navy">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-bright">
              Our long-term vision
            </span>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold leading-tight text-text-on-primary md:text-4xl lg:text-5xl">
              For The Future Village
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-text-on-primary/75">
              A vision for a place of safety, learning and belonging - where
              vulnerable children and young people in Ghana can grow in dignity,
              learn, and be part of a community that believes in them.
            </p>
            <p className="mt-4 leading-relaxed text-text-on-primary/55">
              The Village is in the planning and fundraising stage. Phase one
              would provide safe housing, on-site learning, healthcare and
              mentorship. It is a long-term aspiration, not yet an operational
              programme - and we will only build it to the standard children
              deserve.
            </p>

            <div className="mt-8">
              <div className="mb-3 flex items-center justify-between text-sm">
                <span className="font-medium text-text-on-primary/75">
                  {siteConfig.donation.villageCurrency}
                  {siteConfig.donation.villageRaised.toLocaleString()} raised toward phase one
                </span>
                <span className="font-medium text-text-on-primary/55">
                  Goal: {siteConfig.donation.villageCurrency}
                  {siteConfig.donation.villageGoal.toLocaleString()}
                </span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{
                    width: `${(siteConfig.donation.villageRaised / siteConfig.donation.villageGoal) * 100}%`,
                  }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.4, ease: "easeOut" }}
                  className="h-full rounded-full bg-gradient-to-r from-accent to-accent-bright"
                />
              </div>
            </div>

            <Link
              href="/donate"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-cta px-8 py-4 text-base font-semibold text-on-cta shadow-lg shadow-accent/20 transition-all hover:bg-cta-hover hover:scale-[1.02]"
            >
              <Heart className="h-5 w-5" aria-hidden="true" />
              Support the vision
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="relative"
          >
            <div className="relative aspect-square overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/10">
              <Image
                src={img("/images/about/ftf-village-1.jpg")}
                alt="For The Future Village - a vision for safe housing, learning and community in Ghana"
                fill
                className="object-cover opacity-70"
                sizes="(min-width: 1024px) 40vw, 100vw"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/85 via-primary/25 to-transparent" />
              <div className="absolute inset-x-6 bottom-6 flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-[family-name:var(--font-display)] text-xl font-bold text-text-on-primary">
                    For The Future Village
                  </h3>
                  <p className="text-sm text-text-on-primary/60">Ghana, West Africa</p>
                </div>
                <span className="shrink-0 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold text-text-on-primary backdrop-blur-sm">
                  Vision · In planning
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </SectionWrapper>

      {/* ===== 8. STORIES OF CHANGE ===== */}
      <SectionWrapper background="warm">
        <SectionHeader
          overline="Stories of change"
          title="Behind every number, a name"
          description="Shared with consent and safeguarding approval. We protect the identity and dignity of every child and young person."
        />
        <div className="grid gap-6 md:grid-cols-2">
          {successStories.map((story, i) => (
            <motion.article
              key={story.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex min-w-0 flex-col rounded-2xl border border-border bg-story-bg p-8"
            >
              <Quote className="h-9 w-9 text-quote-mark" aria-hidden="true" />
              <p className="mt-4 flex-1 leading-relaxed text-text-secondary">
                {story.story}
              </p>
              <div className="mt-6 flex items-center gap-4 border-t border-border pt-5">
                <span
                  aria-hidden="true"
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent-subtle font-[family-name:var(--font-display)] text-lg font-bold text-accent-text"
                >
                  {story.name.charAt(0)}
                </span>
                <div className="min-w-0">
                  <div className="font-semibold text-text-primary">{story.name}</div>
                  <div className="truncate text-sm text-text-tertiary">
                    {story.location} · {story.program}
                  </div>
                </div>
              </div>
              <span className="mt-4 inline-flex w-fit items-center rounded-full bg-story-tag px-3 py-1 text-xs font-medium text-story-tag-text">
                {story.status}
              </span>
            </motion.article>
          ))}
        </div>
      </SectionWrapper>

      {/* ===== 9. FOUNDER QUOTE ===== */}
      <SectionWrapper background="gradient">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-4xl text-center"
        >
          <Quote className="mx-auto h-12 w-12 text-quote-mark" aria-hidden="true" />
          <blockquote className="mt-6 font-[family-name:var(--font-display)] text-2xl font-bold leading-snug text-text-primary md:text-3xl lg:text-4xl">
            &ldquo;{siteConfig.founder.quote}&rdquo;
          </blockquote>
          <div className="mt-8 flex items-center justify-center gap-4">
            <div className="relative h-14 w-14 overflow-hidden rounded-full border-2 border-accent">
              <Image
                src={siteConfig.founder.image}
                alt={siteConfig.founder.name}
                fill
                className="object-cover"
                sizes="56px"
                unoptimized
              />
            </div>
            <div className="text-left">
              <div className="font-semibold text-text-primary">{siteConfig.founder.name}</div>
              <div className="text-sm text-text-muted">{siteConfig.founder.title}</div>
            </div>
          </div>
        </motion.div>
      </SectionWrapper>

      {/* ===== 10. PARTNER WITH US ===== */}
      <SectionWrapper background="white">
        <PartnerWithUsBlock />
      </SectionWrapper>

      {/* ===== 11. CURRENT PRIORITIES (CMS-driven) ===== */}
      <SectionWrapper background="warm">
        <SectionHeader
          overline="Current priorities"
          title="Where support is needed now"
          description="Live appeals from our team. When a campaign reaches its goal or its end date, it steps aside automatically."
        />
        <CurrentPriorities priorities={initialPriorities} />
      </SectionWrapper>

      {/* ===== 12. CLOSING CTA - "IT TAKES ALL OF US." ===== */}
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
              It takes all of us.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-text-on-primary/70">
              A child&apos;s future is not built by one person or one programme.
              It is built by a community that shows up - consistently, and with
              dignity. Join us.
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

      {/* ===== 13. NEWSLETTER (consent-gated) ===== */}
      <section className="bg-bg-primary py-16 md:py-20">
        <div className="mx-auto max-w-2xl px-6 text-center lg:px-8">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-text-primary md:text-3xl">
            Stay close to the work
          </h2>
          <p className="mt-3 text-text-secondary">
            Occasional updates on programmes, stories and where support is
            needed most. No noise - unsubscribe any time.
          </p>

          {newsletterState === "success" ? (
            <p className="mx-auto mt-8 max-w-md rounded-2xl border border-accent/30 bg-accent-subtle px-6 py-5 text-sm font-medium text-accent-text">
              Thank you - your subscription is confirmed. Please watch your
              inbox for a welcome note.
            </p>
          ) : (
            <form onSubmit={handleSubscribe} className="mt-8" noValidate>
              <div className="flex flex-col gap-3 sm:flex-row">
                <label htmlFor="newsletter-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (newsletterState === "error") setNewsletterState("idle");
                  }}
                  placeholder="Enter your email address"
                  className="flex-1 rounded-full border border-border bg-surface px-6 py-4 text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
                />
                <button
                  type="submit"
                  className="rounded-full bg-primary px-8 py-4 text-sm font-semibold text-primary-contrast transition-all hover:bg-primary-hover hover:scale-[1.02]"
                >
                  Subscribe
                </button>
              </div>

              <div className="mt-4 flex items-start gap-3 text-left">
                <input
                  id="newsletter-consent"
                  type="checkbox"
                  required
                  checked={consent}
                  onChange={(e) => {
                    setConsent(e.target.checked);
                    if (newsletterState === "error") setNewsletterState("idle");
                  }}
                  className="mt-1 h-4 w-4 shrink-0 rounded border-border-strong text-accent focus:ring-accent/40"
                />
                <label htmlFor="newsletter-consent" className="text-xs leading-relaxed text-text-tertiary">
                  I agree to receive updates from For The Future Organization and
                  understand I can unsubscribe at any time. See our{" "}
                  <Link href="/privacy" className="font-medium text-text-link underline hover:text-text-link-hover">
                    privacy policy
                  </Link>
                  .
                </label>
              </div>

              {newsletterState === "error" && (
                <p role="alert" className="mt-3 text-left text-xs font-medium text-error-text">
                  Please accept the privacy consent to subscribe.
                </p>
              )}
            </form>
          )}
        </div>
      </section>
    </>
  );
}
