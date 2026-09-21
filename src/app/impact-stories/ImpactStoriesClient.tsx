"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, ArrowRight, Quote, BookOpen } from "lucide-react";
import SectionWrapper, { SectionHeader } from "@/components/ui/SectionWrapper";
import ImpactGallery from "@/components/ui/ImpactGallery";
import type { GalleryImage } from "@/lib/gallery";
import { img } from "@/lib/imageUrl";
import { storyStats } from "@/data/impact";

interface Story {
  name: string;
  title: string;
  story: string;
  image: string;
  program: string;
}

/* ===== INLINE STAT (static — brief bans count-up animations) ===== */
function StatCounter({ value, suffix, label }: { value: string; suffix: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-4xl md:text-5xl font-bold text-accent-text tabular-nums">
        {value}{suffix}
      </div>
      <div className="text-xs text-text-on-primary/50 mt-2 uppercase tracking-wider">{label}</div>
    </div>
  );
}

/* Need to import hooks - already imported above */

export default function ImpactStoriesClient({ initialStories = [], galleryImages = [] }: { initialStories?: Story[]; galleryImages?: GalleryImage[] }) {
  const impactStories = initialStories;

  return (
    <>
      {/* ===== HERO WITH BACKGROUND IMAGE ===== */}
      <section className="relative min-h-[60vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={img("/images/stories/hero-bg.jpg")}
            alt="Impact Stories"
            fill
            className="object-cover"
            priority
            unoptimized
          />
          <div className="absolute inset-0 bg-primary/75" />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/50 to-primary/70" />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-6 py-28 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-accent/10 border border-accent/20 px-5 py-2 text-xs font-semibold text-accent-text uppercase tracking-wider mb-6 backdrop-blur-sm">
              <Heart className="h-3.5 w-3.5" />
              Real Lives Changed
            </span>
            <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold text-text-on-primary sm:text-5xl lg:text-6xl">
              Impact Stories
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-text-on-primary/70">
              See How Your Support is Transforming Lives.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ===== STATS BAR ===== */}
      <div className="bg-primary border-y border-white/5">
        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {storyStats.map((stat) => (
              <StatCounter
                key={stat.label}
                value={stat.value}
                suffix={stat.suffix}
                label={stat.label}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ===== STORIES ===== */}
      <SectionWrapper background="warm">
        <SectionHeader
          overline="Transformed Lives"
          title="Stories of Hope & Resilience"
          description="Every child deserves a chance to dream. These are the stories of children who, with your support, are turning their dreams into reality."
        />

        <div className="grid gap-16 lg:gap-20">
          {impactStories.map((story, index) => (
            <motion.div
              key={story.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`flex flex-col gap-8 lg:gap-14 items-center ${
                index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
              }`}
            >
              {/* Image */}
              <div className="relative flex-1 w-full">
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-bg-tertiary shadow-2xl">
                  <Image
                    src={story.image}
                    alt={story.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/30 via-transparent to-transparent" />
                </div>
                {/* Decorative quote badge */}
                <div className="absolute -top-4 -left-4 h-14 w-14 rounded-full bg-accent flex items-center justify-center shadow-lg shadow-accent/30">
                  <Quote className="h-5 w-5 text-navy-900" />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 w-full">
                <div className="mb-4">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-success-bg px-3.5 py-1.5 text-xs font-semibold text-success-text border border-success/20">
                    <BookOpen className="h-3 w-3" />
                    {story.program}
                  </span>
                </div>
                <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold text-text-primary sm:text-4xl">
                  {story.name}
                </h2>
                <p className="text-base font-medium text-accent-text mt-2">
                  {story.title}
                </p>
                <p className="mt-5 text-base leading-relaxed text-text-secondary">
                  {story.story}
                </p>
                <div className="mt-8">
                  <Link
                    href="/donate"
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-text-on-primary transition-all hover:bg-primary-hover hover:scale-[1.02] shadow-lg shadow-primary/20"
                  >
                    <Heart className="h-4 w-4 text-accent-text" />
                    Be Part of {story.name}&apos;s Journey
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      {/* ===== PHOTO GALLERY (Phase 8.10: reusable accessible <ImpactGallery />) ===== */}
      {galleryImages.length > 0 && (
        <SectionWrapper background="white">
          <SectionHeader
            overline="Gallery"
            title="Moments of Impact"
            description="A visual journey through the lives we've touched and the communities we've served."
          />
          <ImpactGallery images={galleryImages} />
        </SectionWrapper>
      )}

      {/* ===== CTA ===== */}
      <SectionWrapper background="navy">
        <div className="mx-auto max-w-3xl text-center">
          <Heart className="mx-auto h-10 w-10 text-accent-text mb-4" />
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold text-text-on-primary sm:text-4xl">
            Help Us Write More Success Stories
          </h2>
          <p className="mt-4 text-lg text-text-on-primary/60">
            Every donation, every volunteer hour, every share brings hope to
            another child. Join us in transforming lives across Africa.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/donate"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-cta px-8 py-3.5 text-sm font-semibold text-on-cta shadow-lg transition-all hover:bg-cta-hover hover:shadow-xl hover:scale-[1.02]"
            >
              <Heart className="h-4 w-4" />
              Support a Child
            </Link>
            <Link
              href="/volunteer"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-8 py-3.5 text-sm font-semibold text-text-on-primary transition-all hover:bg-surface/10"
            >
              Become a Volunteer
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </SectionWrapper>
    </>
  );
}
