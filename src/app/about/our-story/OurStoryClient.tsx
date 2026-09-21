"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { img } from "@/lib/imageUrl";
import { ArrowRight, Calendar, Quote } from "lucide-react";
import SectionWrapper, { SectionHeader } from "@/components/ui/SectionWrapper";
import Timeline from "@/components/ui/Timeline";
import { siteConfig } from "@/data/site";
import { decadeMilestones } from "@/data/milestones";

const narrative = [
  "For The Future Organization began in 2016, founded by students at Wesley Girls' High School who believed that service should start where you stand. Our first outreach — in Ashaiman — was small: essentials, company and encouragement for children who needed to know someone showed up for them.",
  "What began as a student initiative grew into a youth-led movement. Over a decade, more than 500 volunteers have carried the work into classrooms and communities across Ghana, expanding from Greater Accra into the Eastern, Central, Volta, Bono East, Savannah and Western regions.",
  "In 2025 we began operations in Ibadan, Nigeria, and established a US 501(c)(3) vehicle to support the mission. Programme delivery remains rooted in two countries — Ghana and Nigeria — while the US entity exists to steward partnerships and giving.",
  "In 2026, as we mark ten years, our work is organized under the Future Pathways model: five programme pillars that guide a child from foundational learning through to a productive future. The first decade taught us what works. The next is about scale, depth and staying true to the children we serve.",
];

export default function OurStoryClient() {
  return (
    <>
      {/* ===== HERO ===== */}
      <SectionWrapper background="navy" className="!py-24 md:!py-28">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-accent-bright">
            <Calendar className="h-4 w-4" aria-hidden="true" /> Our Story
          </span>
          <h1 className="mt-5 font-[family-name:var(--font-display)] text-4xl font-bold leading-[1.1] text-text-on-primary sm:text-5xl">
            A decade of learning, in service of the next
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-text-on-primary/70">
            From a first outreach in Ashaiman to a youth-led movement across Ghana
            and Nigeria — this is how For The Future grew, and what ten years
            taught us.
          </p>
        </motion.div>
      </SectionWrapper>

      {/* ===== NARRATIVE ===== */}
      <SectionWrapper background="white">
        <div className="mx-auto max-w-3xl space-y-6">
          {narrative.map((para, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="text-lg leading-relaxed text-text-secondary"
            >
              {para}
            </motion.p>
          ))}
        </div>
      </SectionWrapper>

      {/* ===== TIMELINE ===== */}
      <SectionWrapper background="gradient">
        <SectionHeader
          overline="2016 → 2026"
          title="The road so far"
          description="Eight moments that shaped who we are and how we work today."
        />

        <Timeline milestones={decadeMilestones} />
      </SectionWrapper>

      {/* ===== FOUNDER QUOTE ===== */}
      <SectionWrapper background="white">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto grid max-w-4xl items-center gap-8 md:grid-cols-[auto_1fr]"
        >
          <div className="relative mx-auto h-40 w-40 overflow-hidden rounded-2xl border border-border shadow-lg md:h-48 md:w-48">
            <Image
              src={siteConfig.founder.image}
              alt={siteConfig.founder.name}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <figure>
            <Quote className="h-8 w-8 text-accent" aria-hidden="true" />
            <blockquote className="mt-3 font-[family-name:var(--font-display)] text-xl leading-relaxed text-text-primary md:text-2xl">
              &ldquo;{siteConfig.founder.quote}&rdquo;
            </blockquote>
            <figcaption className="mt-4">
              <span className="block font-semibold text-text-primary">
                {siteConfig.founder.name}
              </span>
              <span className="block text-sm text-text-muted">{siteConfig.founder.title}</span>
            </figcaption>
          </figure>
        </motion.div>
      </SectionWrapper>

      {/* ===== CTA ===== */}
      <SectionWrapper background="warm">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold text-text-primary md:text-4xl">
            The next decade starts now
          </h2>
          <p className="mt-4 text-lg text-text-secondary">
            See the work this story built — or add your chapter to it.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/our-work"
              className="inline-flex items-center gap-2 rounded-full bg-cta px-7 py-3.5 text-sm font-semibold text-on-cta shadow-lg shadow-accent/20 transition-all hover:bg-cta-hover hover:scale-[1.02]"
            >
              See our work <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/get-involved"
              className="inline-flex items-center gap-2 rounded-full border border-border-strong bg-surface px-7 py-3.5 text-sm font-semibold text-text-primary transition-all hover:border-accent hover:text-accent-text"
            >
              Get involved
            </Link>
          </div>
        </div>
      </SectionWrapper>
    </>
  );
}
