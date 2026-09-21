"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Handshake,
  Heart,
  Mail,
  MapPin,
  Quote,
  Sparkles,
  Users,
} from "lucide-react";
import SectionWrapper, { SectionHeader } from "@/components/ui/SectionWrapper";
import ProgrammeArtwork from "@/components/ui/ProgrammeArtwork";
import { pillars as staticPillars } from "@/data/pillars";
import type {
  PillarData,
  ProgrammeDetailData,
  ProgrammePartner,
  ProgrammeStory,
  ProgrammeUpdate,
} from "@/lib/pillars";

/** Pillar accent colour (theme-aware) - uses the always-emitted custom property. */
const accentVar = (n: number) => `var(--ftf-pillar-${n})`;
const accentTint = (n: number, pct = 14) =>
  `color-mix(in srgb, var(--ftf-pillar-${n}) ${pct}%, transparent)`;

/** Pillars where mentoring is the central delivery model. */
const MENTOR_PILLARS = new Set(["foundational-education", "mentorship-leadership"]);

/** Lifecycle status → human label + on-brand tone. */
const STATUS_META: Record<string, { label: string; className: string }> = {
  active: { label: "Active", className: "border-accent/40 bg-accent-subtle text-accent-text" },
  expanding: { label: "Expanding", className: "border-primary/40 bg-primary-subtle text-primary" },
  campaign: { label: "Campaign", className: "border-accent/40 bg-accent-subtle text-accent-text" },
  pilot: { label: "Pilot", className: "border-border-strong bg-bg-tertiary text-text-secondary" },
  future_project: { label: "Future project", className: "border-border-strong bg-bg-tertiary text-text-secondary" },
  archived: { label: "Archived", className: "border-border-strong bg-bg-tertiary text-text-muted" },
};

const statusMeta = (status: string) =>
  STATUS_META[status] ?? { label: status.replace(/_/g, " "), className: "border-border-strong bg-bg-tertiary text-text-secondary" };

interface Props {
  /** Pillar without the (non-serialisable) icon component. */
  pillar: Omit<PillarData, "icon">;
  programme: ProgrammeDetailData;
  /** Plain-text body paragraphs, stripped server-side from Program.description. */
  bodyParagraphs: string[];
  stories: ProgrammeStory[];
  partners: ProgrammePartner[];
  updates: ProgrammeUpdate[];
}

export default function ProgrammeDetailClient({
  pillar,
  programme,
  bodyParagraphs,
  stories,
  partners,
  updates,
}: Props) {
  const n = pillar.number;
  // Re-derive the icon from static pillar copy by id (the DB icon name is not
  // serialisable across the server→client boundary; slugs mirror static data).
  const Icon = staticPillars.find((p) => p.id === pillar.id)?.icon ?? Sparkles;

  const status = statusMeta(programme.status);
  const highlights = programme.metrics.highlights ?? [];
  const beneficiaries = programme.metrics.beneficiaries ?? null;
  const country = programme.metrics.country ?? null;
  const category = programme.metrics.category ?? null;
  const year = programme.metrics.year ?? null;
  const detail = programme.detail;
  const isFuture = programme.status === "future_project";
  const mentorLed = MENTOR_PILLARS.has(pillar.id);
  const sponsorType = /sponsor|step/.test(programme.slug);

  return (
    <>
      {/* ===== a. HERO (pillar-accented) ===== */}
      <section className="relative overflow-hidden bg-primary pt-32 pb-16 text-text-on-primary sm:pt-36">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{ background: `radial-gradient(circle at 82% 8%, color-mix(in srgb, ${accentVar(n)} 34%, transparent), transparent 55%)` }}
        />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="mb-8 flex flex-wrap items-center gap-2 text-sm text-text-on-primary/75">
            <Link href="/" className="hover:underline focus-visible:outline-2 focus-visible:outline-offset-4">Home</Link>
            <span aria-hidden="true">/</span>
            <Link href="/our-work" className="hover:underline focus-visible:outline-2 focus-visible:outline-offset-4">Our Work</Link>
            <span aria-hidden="true">/</span>
            <Link href={`/our-work/${pillar.id}`} className="hover:underline focus-visible:outline-2 focus-visible:outline-offset-4">{pillar.title}</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page" className="text-text-on-primary">{programme.name}</span>
          </nav>

          <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-center">
            <div>
              {/* Status badge + pillar tag chips */}
              <div className="flex flex-wrap items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${status.className}`}>
                  <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />
                  {status.label}
                </span>
                {programme.pillars.map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/our-work/${tag.id}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-text-on-primary/25 px-3 py-1 text-xs font-medium text-text-on-primary/85 transition-colors hover:bg-text-on-primary/10"
                  >
                    <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: accentVar(tag.number) }} />
                    Pillar {tag.number} · {tag.title}
                  </Link>
                ))}
              </div>

              <h1 className="mt-5 font-[family-name:var(--font-display)] text-4xl font-bold leading-[1.08] sm:text-5xl lg:text-[3.4rem]">
                {programme.name}
              </h1>
              {detail?.formerName && (
                <p className="mt-2 text-sm text-text-on-primary/60">Formerly {detail.formerName}</p>
              )}
              <span aria-hidden="true" className="mt-6 block h-1.5 w-24 rounded-full" style={{ backgroundColor: accentVar(n) }} />
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-text-on-primary/80">
                {programme.shortDescription}
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/donate"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-cta px-7 py-3.5 text-base font-semibold text-on-cta shadow-lg shadow-accent/20 transition-all hover:bg-cta-hover hover:scale-[1.02]"
                >
                  <Heart className="h-5 w-5" aria-hidden="true" />
                  {isFuture ? "Support the vision" : "Give Now"}
                </Link>
                <Link
                  href={`/our-work/${pillar.id}`}
                  className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-text-on-primary/25 px-7 py-3.5 text-base font-semibold text-text-on-primary transition-all hover:bg-text-on-primary/10"
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  Back to {pillar.title}
                </Link>
              </div>
            </div>

            {/* Programme artwork panel */}
            <div className="relative">
              <div className="group relative aspect-[4/3] overflow-hidden rounded-3xl border border-white/10 bg-white/5">
                <ProgrammeArtwork image={programme.image} title={programme.name} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== b. IMPACT METRICS STRIP ===== */}
      {(beneficiaries !== null || country || category || year || highlights.length > 0) && (
        <SectionWrapper background="white" className="!py-14 md:!py-16">
          <dl className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {beneficiaries !== null && (
              <div className="rounded-2xl border border-border bg-bg-primary p-6 text-center">
                <dd className="font-[family-name:var(--font-display)] text-3xl font-bold text-text-primary sm:text-4xl">
                  {beneficiaries.toLocaleString()}
                  <span style={{ color: accentVar(n) }}>+</span>
                </dd>
                <dt className="mt-2 text-sm leading-snug text-text-tertiary">People reached</dt>
              </div>
            )}
            {year && (
              <div className="rounded-2xl border border-border bg-bg-primary p-6 text-center">
                <dd className="font-[family-name:var(--font-display)] text-3xl font-bold text-text-primary sm:text-4xl">{year}</dd>
                <dt className="mt-2 text-sm leading-snug text-text-tertiary">Launched</dt>
              </div>
            )}
            {country && (
              <div className="rounded-2xl border border-border bg-bg-primary p-6 text-center">
                <dd className="font-[family-name:var(--font-display)] text-2xl font-bold text-text-primary sm:text-3xl">{country}</dd>
                <dt className="mt-2 text-sm leading-snug text-text-tertiary">Delivery country</dt>
              </div>
            )}
            {category && (
              <div className="rounded-2xl border border-border bg-bg-primary p-6 text-center">
                <dd className="font-[family-name:var(--font-display)] text-2xl font-bold text-text-primary sm:text-3xl">{category}</dd>
                <dt className="mt-2 text-sm leading-snug text-text-tertiary">Focus area</dt>
              </div>
            )}
          </dl>
        </SectionWrapper>
      )}

      {/* ===== c. THE CHALLENGE + WHAT WE DO ===== */}
      <SectionWrapper background="warm">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-text">The challenge</span>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-bold text-text-primary sm:text-3xl">
              Why this programme exists
            </h2>
            <p className="mt-5 leading-relaxed text-text-secondary">
              {detail?.challenge ?? pillar.challenge}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="rounded-2xl border-l-4 bg-surface p-7"
            style={{ borderColor: accentVar(n) }}
          >
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-text">What we do</span>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-bold text-text-primary sm:text-3xl">
              The delivery model
            </h2>
            <p className="mt-5 leading-relaxed text-text-secondary">
              {detail?.evidenceSummary ?? pillar.whatWeDo}
            </p>
            {highlights.length > 0 && (
              <ul className="mt-6 space-y-2.5">
                {highlights.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm leading-relaxed text-text-secondary">
                    <CheckCircle2 aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" style={{ color: accentVar(n) }} />
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        </div>
      </SectionWrapper>

      {/* ===== d. PROGRAMME BODY (rich-text copy) + STAGES ===== */}
      {(bodyParagraphs.length > 0 || detail?.stages?.length) && (
        <SectionWrapper background="white">
          <div className="mx-auto max-w-3xl">
            {bodyParagraphs.length > 0 && (
              <div className="space-y-5">
                {bodyParagraphs.map((para, i) => (
                  <p key={i} className="text-lg leading-relaxed text-text-secondary">{para}</p>
                ))}
              </div>
            )}

            {detail?.stages && detail.stages.length > 0 && (
              <div className="mt-12">
                <h3 className="font-[family-name:var(--font-display)] text-xl font-bold text-text-primary">How it works</h3>
                <ol className="mt-6 space-y-4">
                  {detail.stages.map((stage, i) => (
                    <li key={stage.name} className="flex gap-4 rounded-2xl border border-border bg-bg-primary p-5">
                      <span
                        aria-hidden="true"
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-[family-name:var(--font-display)] text-sm font-bold text-text-on-primary"
                        style={{ backgroundColor: accentVar(n) }}
                      >
                        {i + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-semibold text-text-primary">{stage.name}</h4>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                              stage.status === "running"
                                ? "bg-accent-subtle text-accent-text"
                                : "bg-bg-tertiary text-text-secondary"
                            }`}
                          >
                            {stage.status === "running" ? "Running" : "Seeking partners"}
                          </span>
                        </div>
                        <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">{stage.description}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </SectionWrapper>
      )}

      {/* ===== e. WHO IT SERVES + WHERE IT WORKS ===== */}
      <SectionWrapper background="warm">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-surface p-7">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: accentTint(n) }}>
                <Users aria-hidden="true" className="h-5 w-5" style={{ color: accentVar(n) }} />
              </span>
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-text-primary">Who it serves</h2>
            </div>
            <p className="mt-4 leading-relaxed text-text-secondary">{pillar.whoItServes}</p>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-7">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: accentTint(n) }}>
                <MapPin aria-hidden="true" className="h-5 w-5" style={{ color: accentVar(n) }} />
              </span>
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-text-primary">Where it works</h2>
            </div>
            <p className="mt-4 leading-relaxed text-text-secondary">{pillar.whereItWorks}</p>
          </div>
        </div>
      </SectionWrapper>

      {/* ===== f. EVIDENCE (only when a structured detail set exists) ===== */}
      {detail?.evidence && detail.evidence.length > 0 && (
        <SectionWrapper background="white">
          <SectionHeader
            align="left"
            overline="Evidence"
            title="What backs this work"
          />
          <div className="grid gap-6 md:grid-cols-2">
            {detail.evidence.map((item) => (
              <div key={item.title} className="rounded-2xl border-l-4 bg-bg-primary p-6" style={{ borderColor: accentVar(n) }}>
                <h3 className="font-semibold text-text-primary">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">{item.description}</p>
              </div>
            ))}
          </div>
        </SectionWrapper>
      )}

      {/* ===== g. STORIES (safeguarding-approved, filtered to this programme) ===== */}
      {stories.length > 0 && (
        <SectionWrapper background="warm">
          <SectionHeader
            align="left"
            overline="In their words"
            title="Stories from this programme"
            description="Published with consent and safeguarding approval. Names and identifying details are shared only where approved."
          />
          <div className="grid gap-6 md:grid-cols-2">
            {stories.map((story) => (
              <figure
                key={story.slug}
                className="flex h-full flex-col rounded-2xl border-l-4 bg-surface p-7"
                style={{ borderColor: accentVar(n) }}
              >
                <Quote aria-hidden="true" className="h-6 w-6 text-accent-text" />
                <blockquote className="mt-4 flex-1 leading-relaxed text-text-secondary">
                  {story.pullQuote || story.excerpt || story.title}
                </blockquote>
                <figcaption className="mt-5 border-t border-border pt-4 text-sm">
                  {story.childName && <span className="font-semibold text-text-primary">{story.childName}</span>}
                  {story.location && <span className="text-text-tertiary"> · {story.location}</span>}
                  <span className="mt-1 block text-xs font-medium text-text-primary">{story.title}</span>
                </figcaption>
              </figure>
            ))}
          </div>
          <div className="mt-8">
            <Link
              href="/impact-stories"
              className="inline-flex items-center gap-2 text-sm font-semibold text-accent-text transition-all hover:gap-3"
            >
              Read all impact stories <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </SectionWrapper>
      )}

      {/* ===== h. PARTNERS (filtered to this programme) ===== */}
      {partners.length > 0 && (
        <SectionWrapper background="white">
          <SectionHeader align="left" overline="Partners" title="Who delivers with us" />
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {partners.map((partner) => (
              <li key={partner.name} className="flex items-center gap-4 rounded-2xl border border-border bg-bg-primary p-5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: accentTint(n, 18) }}>
                  <Handshake aria-hidden="true" className="h-5 w-5" style={{ color: accentVar(n) }} />
                </span>
                <div className="min-w-0">
                  {partner.website ? (
                    <a href={partner.website} target="_blank" rel="noopener noreferrer" className="truncate font-semibold text-text-primary hover:text-accent-text">
                      {partner.name}
                    </a>
                  ) : (
                    <span className="block truncate font-semibold text-text-primary">{partner.name}</span>
                  )}
                  <span className="text-xs text-text-tertiary">{partner.type}{partner.tier ? ` · ${partner.tier}` : ""}</span>
                </div>
              </li>
            ))}
          </ul>
        </SectionWrapper>
      )}

      {/* ===== i. UPDATES (chronological; BlogPost has no programme FK, matched by tag) ===== */}
      {updates.length > 0 && (
        <SectionWrapper background="warm">
          <SectionHeader align="left" overline="Updates" title="Latest on this programme" />
          <ol className="space-y-3">
            {updates.map((update) => (
              <li key={update.slug}>
                {/* No /news/[slug] detail route yet - link to the news listing. */}
                <Link href="/news" className="group flex flex-col gap-1 rounded-2xl border border-border bg-surface p-5 transition-all hover:border-accent/50 hover:shadow-md sm:flex-row sm:items-center sm:justify-between">
                  <span className="font-semibold text-text-primary transition-colors group-hover:text-accent-text">{update.title}</span>
                  {update.date && (
                    <time dateTime={update.date} className="shrink-0 text-xs text-text-tertiary">
                      {new Date(update.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </time>
                  )}
                </Link>
              </li>
            ))}
          </ol>
        </SectionWrapper>
      )}

      {/* ===== j. SAFEGUARDING NOTE ===== */}
      {detail?.safeguarding && (
        <SectionWrapper background="white">
          <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-bg-primary p-7">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-text">Safeguarding</span>
            <p className="mt-3 leading-relaxed text-text-secondary">{detail.safeguarding}</p>
          </div>
        </SectionWrapper>
      )}

      {/* ===== k. CTA (contextual by programme type / status) ===== */}
      <section className="relative overflow-hidden bg-primary py-20 md:py-24">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{ background: `radial-gradient(circle at 50% 0%, color-mix(in srgb, ${accentVar(n)} 26%, transparent), transparent 55%)` }}
        />
        <div className="relative mx-auto max-w-3xl px-6 text-center lg:px-8">
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold leading-tight text-text-on-primary md:text-4xl">
            {isFuture ? `Back the ${programme.name} vision` : `Support ${programme.name}`}
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-text-on-primary/70">
            {programme.shortDescription}
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href="/donate"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-cta px-8 py-4 text-base font-semibold text-on-cta shadow-lg shadow-accent/20 transition-all hover:bg-cta-hover hover:scale-[1.02] sm:w-auto"
            >
              <Heart className="h-5 w-5" aria-hidden="true" />
              {isFuture ? "Support the vision" : "Give Now"}
            </Link>

            {!isFuture && (
              <Link
                href={mentorLed || sponsorType ? "/volunteer" : "/partners"}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-text-on-primary/25 px-8 py-4 text-base font-semibold text-text-on-primary transition-all hover:bg-text-on-primary/10 sm:w-auto"
              >
                {mentorLed ? (
                  <>
                    <Handshake className="h-5 w-5" aria-hidden="true" />
                    Volunteer as mentor
                  </>
                ) : sponsorType ? (
                  <>
                    <Users className="h-5 w-5" aria-hidden="true" />
                    Sponsor a child
                  </>
                ) : (
                  <>
                    <Handshake className="h-5 w-5" aria-hidden="true" />
                    Partner with us
                  </>
                )}
              </Link>
            )}

            <Link
              href="/contact"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-text-on-primary/25 px-8 py-4 text-base font-semibold text-text-on-primary transition-all hover:bg-text-on-primary/10 sm:w-auto"
            >
              <Mail className="h-5 w-5" aria-hidden="true" />
              Enquire
            </Link>
          </div>
          <p className="mt-6 text-xs text-text-on-primary/50">
            Delivered under Pillar {pillar.number} · {pillar.title}
          </p>
        </div>
      </section>
    </>
  );
}
