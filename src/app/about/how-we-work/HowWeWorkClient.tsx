"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Handshake,
  Layers,
  MapPin,
  ShieldCheck,
  Users,
} from "lucide-react";
import SectionWrapper, { SectionHeader } from "@/components/ui/SectionWrapper";

const principles = [
  {
    icon: Users,
    title: "Youth-led & volunteer-powered",
    body: "Young people lead and deliver our work. More than 500 volunteers across Ghana and Nigeria run programmes, mentor children and keep the organization close to the communities it serves.",
    color: "accent",
  },
  {
    icon: MapPin,
    title: "Community-embedded",
    body: "We work where children already are - in their schools, neighbourhoods and families. Programmes are designed with community input, not dropped in from the outside.",
    color: "primary",
  },
  {
    icon: Layers,
    title: "Holistic, not single-issue",
    body: "A child's needs are connected. We combine education, girls' empowerment, future-ready skills, mentorship, wellbeing and family support rather than treating one problem in isolation.",
    color: "charcoal",
  },
  {
    icon: Handshake,
    title: "Partnership-based",
    body: "Lasting change is built with others. We partner with schools, community groups, and corporate and institutional allies who share our standards and our commitment to children.",
    color: "primary",
  },
  {
    icon: ShieldCheck,
    title: "Safeguarding-led",
    body: "Child protection is a precondition, not an add-on. Consent, safe photography and storytelling, volunteer conduct and clear reporting shape how every programme runs.",
    color: "accent",
  },
  {
    icon: BarChart3,
    title: "Measured & accountable",
    body: "We set targets, collect data and report honestly - to communities, partners and supporters. Where we cannot yet measure something, we say so plainly.",
    color: "charcoal",
  },
];

const tone: Record<string, { chip: string; icon: string; border: string }> = {
  accent: { chip: "bg-accent-subtle", icon: "text-accent-text", border: "border-accent/20" },
  primary: { chip: "bg-primary-subtle", icon: "text-primary", border: "border-primary/20" },
  charcoal: { chip: "bg-bg-tertiary", icon: "text-text-secondary", border: "border-border-strong/40" },
};

export default function HowWeWorkClient() {
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
          <span className="inline-block text-xs font-semibold uppercase tracking-[0.3em] text-accent-bright">
            How We Work
          </span>
          <h1 className="mt-5 font-[family-name:var(--font-display)] text-4xl font-bold leading-[1.1] text-text-on-primary sm:text-5xl">
            Six principles behind every programme
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-text-on-primary/70">
            How we work matters as much as what we do. These six commitments
            shape our design, our partnerships and our accountability to the
            children and communities we serve.
          </p>
        </motion.div>
      </SectionWrapper>

      {/* ===== PRINCIPLES ===== */}
      <SectionWrapper background="cream">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {principles.map((p, i) => {
            const t = tone[p.color] || tone.primary;
            return (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.45, delay: i * 0.06 }}
                className={`group flex h-full flex-col rounded-2xl border ${t.border} bg-surface p-8 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5`}
              >
                <span
                  className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${t.chip} ${t.icon} transition-transform group-hover:scale-110`}
                >
                  <p.icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <div className="mt-5 text-xs font-semibold uppercase tracking-[0.15em] text-text-muted">
                  0{i + 1}
                </div>
                <h2 className="mt-1 text-lg font-bold text-text-primary">{p.title}</h2>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-text-secondary">{p.body}</p>
              </motion.div>
            );
          })}
        </div>
      </SectionWrapper>

      {/* ===== CTA ===== */}
      <SectionWrapper background="sand">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold text-text-primary md:text-4xl">
            See these principles in action
          </h2>
          <p className="mt-4 text-lg text-text-secondary">
            Every programme we run is built on these six commitments. Explore the
            work, or partner with us to extend it.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/our-work"
              className="inline-flex items-center gap-2 rounded-full bg-cta px-7 py-3.5 text-sm font-semibold text-on-cta shadow-lg shadow-accent/20 transition-all hover:bg-cta-hover hover:scale-[1.02]"
            >
              See our work <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/partners"
              className="inline-flex items-center gap-2 rounded-full border border-border-strong bg-surface px-7 py-3.5 text-sm font-semibold text-text-primary transition-all hover:border-accent hover:text-accent-text"
            >
              Partner with us
            </Link>
          </div>
        </div>
      </SectionWrapper>
    </>
  );
}
