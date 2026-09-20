"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { img } from "@/lib/imageUrl";
import {
  ArrowRight,
  BookOpen,
  Eye,
  Heart,
  MapPin,
  Route,
  ShieldCheck,
  Target,
  Users,
} from "lucide-react";
import SectionWrapper, { SectionHeader } from "@/components/ui/SectionWrapper";
import StatDisplay from "@/components/ui/StatDisplay";
import ValuesGrid from "@/components/ui/ValuesGrid";
import { siteConfig } from "@/data/site";

/* Brand-semantic colour discipline (accent = hope/growth, primary = trust,
   charcoal = structure) — mirrors ValueCard's colorMap so the About surfaces
   stay visually consistent. */
const tone: Record<string, { chip: string; icon: string }> = {
  accent: { chip: "bg-accent-subtle", icon: "text-accent-text" },
  primary: { chip: "bg-primary-subtle", icon: "text-primary" },
  charcoal: { chip: "bg-bg-tertiary", icon: "text-text-secondary" },
};

const overviewCards = [
  {
    href: "/about/our-story",
    icon: BookOpen,
    title: "Our Story",
    blurb:
      "A decade of learning — from a first community outreach to five programme pillars across two countries.",
    color: "accent",
  },
  {
    href: "/about/how-we-work",
    icon: Route,
    title: "How We Work",
    blurb:
      "The six principles behind every programme: youth-led, community-embedded, holistic, partnership-based, safeguarding-led and measured.",
    color: "primary",
  },
  {
    href: "/about/where-we-work",
    icon: MapPin,
    title: "Where We Work",
    blurb:
      "Programme delivery in Ghana and Nigeria, supported by a US 501(c)(3) vehicle.",
    color: "charcoal",
  },
  {
    href: "/about/team",
    icon: Users,
    title: "Team & Governance",
    blurb:
      "Leadership, an independent executive board, an advisory board and a volunteer-powered delivery team.",
    color: "primary",
  },
  {
    href: "/about/safeguarding",
    icon: ShieldCheck,
    title: "Safeguarding & Accountability",
    blurb:
      "How we protect children, handle consent and photography, and report and refer concerns.",
    color: "accent",
  },
];

export default function AboutPageClient() {
  return (
    <>
      {/* ===== SPLIT HERO ===== */}
      <SectionWrapper background="white" className="overflow-hidden">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-accent-text">
              <Heart className="h-4 w-4" aria-hidden="true" /> Our Story
            </span>
            <h1 className="mt-5 font-[family-name:var(--font-display)] text-4xl font-bold leading-[1.1] text-text-primary sm:text-5xl lg:text-6xl">
              Ten years of learning.
              <br />
              <span className="text-accent-text">One decade of impact.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-text-secondary">
              {siteConfig.positioning}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/about/our-story"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-on-success shadow-lg shadow-accent/20 transition-all hover:bg-accent-hover hover:scale-[1.02]"
              >
                Read our story <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/our-work"
                className="inline-flex items-center gap-2 rounded-full border border-border-strong bg-surface px-6 py-3 text-sm font-semibold text-text-primary transition-all hover:border-accent hover:text-accent-text"
              >
                See our work
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="relative"
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-border shadow-xl shadow-primary/5">
              <Image
                src={img("/images/page-heroes/about-hero.png")}
                alt="For The Future volunteers learning with children in a Ghanaian community"
                fill
                className="object-cover"
                priority
                unoptimized
              />
            </div>
            <div className="absolute -bottom-5 left-6 inline-flex items-center gap-3 rounded-2xl border border-border bg-surface/95 px-5 py-3 shadow-lg backdrop-blur">
              <span className="font-[family-name:var(--font-display)] text-2xl font-bold text-accent-text">
                2016 → 2026
              </span>
              <span className="text-sm text-text-muted">A decade of learning</span>
            </div>
          </motion.div>
        </div>
      </SectionWrapper>

      {/* ===== AT-A-GLANCE STATS (static — no count-up) ===== */}
      <SectionWrapper background="gradient" className="!py-14 md:!py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <StatDisplay value={siteConfig.stats.yearsOfFoundation} label="Years of impact" />
          <StatDisplay value={siteConfig.stats.beneficiaries} suffix="+" label="Lives reached" />
          <StatDisplay value={siteConfig.stats.volunteers} suffix="+" label="Volunteers" />
          <StatDisplay value={siteConfig.stats.countries} label="Programme countries" />
        </div>
      </SectionWrapper>

      {/* ===== EXPLORE FTF (overview cards) ===== */}
      <SectionWrapper background="white">
        <SectionHeader
          overline="Explore FTF"
          title="Everything that shapes how we work"
          description="Our story, our operating principles, where we work, who governs and delivers, and how we keep children safe."
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {overviewCards.map((card, i) => {
            const t = tone[card.color] || tone.primary;
            return (
              <motion.div
                key={card.href}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.45, delay: i * 0.06 }}
              >
                <Link
                  href={card.href}
                  className="group flex h-full flex-col rounded-2xl border border-border bg-surface p-7 transition-all hover:-translate-y-1 hover:border-accent/40 hover:shadow-xl hover:shadow-primary/5"
                >
                  <span
                    className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${t.chip} ${t.icon} transition-transform group-hover:scale-110`}
                  >
                    <card.icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 text-lg font-bold text-text-primary">{card.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-text-secondary">
                    {card.blurb}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-accent-text">
                    Explore <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </SectionWrapper>

      {/* ===== VISION + MISSION (exact from siteConfig) ===== */}
      <SectionWrapper background="gradient">
        <div className="grid gap-6 md:grid-cols-2">
          {[
            { icon: Eye, label: "Our Vision", body: siteConfig.vision, color: "accent" },
            { icon: Target, label: "Our Mission", body: siteConfig.mission, color: "primary" },
          ].map((item, i) => {
            const t = tone[item.color] || tone.primary;
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="rounded-2xl border border-border bg-surface p-8"
              >
                <span className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${t.chip} ${t.icon}`}>
                  <item.icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <h3 className="mt-5 font-[family-name:var(--font-display)] text-2xl font-bold text-text-primary">
                  {item.label}
                </h3>
                <p className="mt-3 leading-relaxed text-text-secondary">{item.body}</p>
              </motion.div>
            );
          })}
        </div>
      </SectionWrapper>

      {/* ===== CORE VALUES (7) ===== */}
      <SectionWrapper background="white" id="values">
        <SectionHeader
          overline="What guides us"
          title="Our core values"
          description="Seven commitments that shape every decision we make — for the children and young people we serve, and the communities and partners we work alongside."
        />
        <ValuesGrid />
      </SectionWrapper>

      {/* ===== CLOSING CTA ===== */}
      <SectionWrapper background="warm">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold text-text-primary md:text-4xl">
            Walk with us into the next decade
          </h2>
          <p className="mt-4 text-lg text-text-secondary">
            The first ten years taught us what works. The next ten will scale it —
            with communities, partners and supporters who believe every child
            deserves a future.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/donate"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 text-sm font-semibold text-on-success shadow-lg shadow-accent/20 transition-all hover:bg-accent-hover hover:scale-[1.02]"
            >
              Give Now
            </Link>
            <Link
              href="/get-involved"
              className="inline-flex items-center gap-2 rounded-full border border-border-strong bg-surface px-7 py-3.5 text-sm font-semibold text-text-primary transition-all hover:border-accent hover:text-accent-text"
            >
              Get involved <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </motion.div>
      </SectionWrapper>
    </>
  );
}
