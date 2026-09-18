"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Initiative } from "@/data/initiatives";
import { pillars, primaryPillar, pillarsForTags } from "@/data/pillars";
import ProgrammeArtwork from "@/components/ui/ProgrammeArtwork";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { img } from "@/lib/imageUrl";
import {
  ArrowRight,
  Heart,
  MapPin,
  Calendar,
  Users,
  Check,
} from "lucide-react";

function InitiativeCard({ initiative }: { initiative: Initiative }) {
  return (
    <div className="group h-full overflow-hidden rounded-2xl border border-border bg-surface transition-all hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1">
      {/* Image / artwork */}
      <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-bg-tertiary to-border">
        <ProgrammeArtwork image={initiative.image} title={initiative.title} />
        {/* Status badge */}
        <div className="absolute top-4 left-4">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium backdrop-blur-sm ${
              initiative.status === "active"
                ? "bg-success/90 text-on-success"
                : initiative.status === "upcoming"
                ? "bg-accent/90 text-navy-900"
                : "bg-text-tertiary/90 text-text-on-primary"
            }`}
          >
            <div
              className={`h-1.5 w-1.5 rounded-full ${
                initiative.status === "active" ? "bg-surface" : "bg-primary"
              }`}
            />
            {initiative.status === "active"
              ? "Active"
              : initiative.status === "upcoming"
              ? "Upcoming"
              : "Completed"}
          </span>
        </div>
        {/* Category badge */}
        <div className="absolute top-4 right-4">
          <span className="inline-flex items-center rounded-full bg-surface/90 px-3 py-1 text-xs font-medium text-text-secondary backdrop-blur-sm">
            {initiative.category}
          </span>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-text-primary group-hover:text-accent-text transition-colors mb-2">
          {initiative.title}
        </h3>
        {pillarsForTags(initiative.pillars).length > 1 && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {pillarsForTags(initiative.pillars).map((pillar) => (
              <span key={pillar.id} className="rounded-full bg-accent-subtle px-2.5 py-0.5 text-[11px] font-semibold text-accent-text">
                Pillar {pillar.number}
              </span>
            ))}
          </div>
        )}
        <p className="text-sm text-text-secondary leading-relaxed mb-4">
          {initiative.shortDescription}
        </p>

        {/* Highlights */}
        <div className="space-y-2 mb-4">
          {initiative.highlights.slice(0, 3).map((h) => (
            <div key={h} className="flex items-center gap-2">
              <Check className="h-3.5 w-3.5 text-success shrink-0" />
              <span className="text-xs text-text-tertiary">{h}</span>
            </div>
          ))}
        </div>

        {/* Meta */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-xs text-text-muted">
              <MapPin className="h-3 w-3" />
              {initiative.country}
            </span>
            {initiative.beneficiaries !== null && (
              <span className="flex items-center gap-1 text-xs text-text-muted">
                <Users className="h-3 w-3" />
                {initiative.beneficiaries.toLocaleString()}+
              </span>
            )}
          </div>
          <span className="flex items-center gap-1 text-xs text-text-muted">
            <Calendar className="h-3 w-3" />
            {initiative.year}
          </span>
        </div>
        {initiative.href && (
          <Link
            href={initiative.href}
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-accent-hover underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            Explore {initiative.title}
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        )}
      </div>
    </div>
  );
}

export default function InitiativesClient({ initialInitiatives = [] }: { initialInitiatives?: Initiative[] }) {
  const initiatives = initialInitiatives;
  const router = useRouter();

  useEffect(() => {
    const followLegacyLink = () => {
      if (window.location.hash === "#project-future-ready" || window.location.hash === "#future-pathways") {
        router.replace("/initiatives/future-pathways");
      }
    };
    followLegacyLink();
    window.addEventListener("hashchange", followLegacyLink);
    return () => window.removeEventListener("hashchange", followLegacyLink);
  }, [router]);

  const grouped = pillars.map((pillar) => ({
    pillar,
    items: initiatives.filter((i) => primaryPillar(i.pillars)?.id === pillar.id),
  }));
  const groupedSlugs = new Set(grouped.flatMap((g) => g.items.map((i) => i.slug)));
  const ungrouped = initiatives.filter((i) => !groupedSlugs.has(i.slug));

  return (
    <>
      {/* ===== HERO ===== */}
      <section className="relative min-h-[50vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={img("/images/page-heroes/initiatives-hero.jpg")}
            alt="Our Work"
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
            <span className="inline-block text-xs font-semibold uppercase tracking-[0.3em] text-white mb-4">
              Our Work
            </span>
            <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold leading-[1.1] text-text-on-primary sm:text-5xl md:text-6xl">
              Five Pillars of Lasting Change
            </h1>
            <p className="mt-6 max-w-xl text-lg text-text-on-primary/70 leading-relaxed">
              Every FTF initiative sits under one of five strategic pillars - from
              foundational education to community and family support - so every
              child is supported as a whole, from the classroom to the future of work.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ===== PILLAR JUMP NAV ===== */}
      <div className="sticky top-16 z-30 border-b border-border bg-surface/90 backdrop-blur-xl">
        <nav aria-label="Pillars" className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-6 py-3 lg:px-8">
          {grouped.map(({ pillar, items }) => (
            <a
              key={pillar.id}
              href={`#pillar-${pillar.id}`}
              className="inline-flex shrink-0 items-center gap-2 rounded-full border border-border-strong bg-surface px-4 py-2 text-xs font-semibold text-text-secondary transition-colors hover:border-accent hover:text-accent-text"
            >
              <pillar.icon aria-hidden="true" className="h-3.5 w-3.5 text-accent-text" />
              <span className="text-text-muted">{pillar.number}.</span>
              {pillar.title}
              <span className="rounded-full bg-bg-tertiary px-1.5 text-[10px] font-bold text-text-tertiary">
                {items.length}
              </span>
            </a>
          ))}
        </nav>
      </div>

      {/* ===== PILLAR SECTIONS ===== */}
      {grouped.map(({ pillar, items }, index) => (
        <section
          key={pillar.id}
          id={`pillar-${pillar.id}`}
          aria-labelledby={`pillar-${pillar.id}-heading`}
          className={`scroll-mt-32 py-16 sm:py-20 ${index % 2 === 0 ? "bg-bg-primary" : "bg-bg-secondary"}`}
        >
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5 }}
              className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:gap-6"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-text-on-primary shadow-lg shadow-primary/20">
                <pillar.icon aria-hidden="true" className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.25em] text-accent-hover">
                  Pillar {pillar.number}
                </span>
                <h2 id={`pillar-${pillar.id}-heading`} className="mt-1 font-[family-name:var(--font-display)] text-2xl font-bold text-text-primary sm:text-3xl">
                  {pillar.title}
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-text-tertiary">
                  {pillar.summary}
                </p>
              </div>
            </motion.div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((initiative) => (
                <motion.div
                  key={initiative.slug}
                  id={initiative.slug}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.4 }}
                  className="scroll-mt-40"
                >
                  <InitiativeCard initiative={initiative} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* ===== UNGROUPED (future programmes without pillar tags) ===== */}
      {ungrouped.length > 0 && (
        <section className="bg-bg-primary py-16 sm:py-20" aria-labelledby="more-initiatives-heading">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <h2 id="more-initiatives-heading" className="mb-10 font-[family-name:var(--font-display)] text-2xl font-bold text-text-primary sm:text-3xl">
              More Initiatives
            </h2>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {ungrouped.map((initiative) => (
                <InitiativeCard key={initiative.slug} initiative={initiative} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== CTA ===== */}
      <section className="relative overflow-hidden bg-gradient-to-r from-primary via-primary to-primary py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(76,182,77,0.15),transparent_50%)]" />
        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold text-text-on-primary md:text-4xl">
              Want to Support Our Work?
            </h2>
            <p className="mt-4 text-lg text-text-on-primary/60 max-w-2xl mx-auto">
              Your donation directly funds these programs, helping us reach more
              children and create lasting impact.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row justify-center">
              <Link
                href="/donate"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-accent to-accent-hover px-8 py-4 text-base font-semibold text-navy-900 shadow-2xl shadow-accent/20 transition-all hover:scale-[1.02]"
              >
                <Heart className="h-5 w-5" />
                Donate Now
              </Link>
              <Link
                href="/volunteer"
                className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/20 px-8 py-4 text-base font-semibold text-text-on-primary transition-all hover:bg-surface/10"
              >
                Become a Volunteer
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
