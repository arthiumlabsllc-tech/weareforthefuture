"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  HeartHandshake,
  Sparkles,
  GraduationCap,
  Building2,
  ArrowRight,
  ShieldCheck,
  ClipboardCheck,
  UserCheck,
  Users,
} from "lucide-react";
import SectionWrapper, { SectionHeader } from "@/components/ui/SectionWrapper";
import { siteConfig } from "@/data/site";

const pathways = [
  {
    href: "/get-involved/volunteer",
    icon: HeartHandshake,
    title: "Volunteer",
    blurb:
      "Give your time and skills - teaching, tech, health, creative arts, fundraising and more. On-site across Ghana and Nigeria, or remote.",
    cta: "Explore volunteering",
  },
  {
    href: "/get-involved/fellowship",
    icon: Sparkles,
    title: "FTF Fellowship",
    blurb:
      "A structured pathway for young changemakers to lead community projects, build skills and grow into the next generation of FTF leaders.",
    cta: "Join the Fellowship",
  },
  {
    href: "/get-involved/mentor",
    icon: GraduationCap,
    title: "Mentor",
    blurb:
      "Share your professional or lived experience with a young person - academic guidance, career pathways, digital skills and leadership.",
    cta: "Become a mentor",
  },
  {
    href: "/partners",
    icon: Building2,
    title: "Partner",
    blurb:
      "Corporate, institutional and implementation partnerships - grants, CSR/CSV, ESG, in-kind, employee volunteering and multi-year programmes.",
    cta: "Explore partnership",
  },
];

const onboarding = [
  {
    icon: ClipboardCheck,
    step: "01",
    title: "Apply",
    body: "Submit the short application for your chosen pathway. Tell us your skills, availability and motivation.",
  },
  {
    icon: ShieldCheck,
    step: "02",
    title: "Safeguarding & references",
    body: "Everyone working with children completes our safeguarding expectations, code of conduct and reference checks.",
  },
  {
    icon: UserCheck,
    step: "03",
    title: "Onboarding & training",
    body: "We brief you on our programmes, communities and child-protection standards before you start.",
  },
  {
    icon: Users,
    step: "04",
    title: "Placed & supported",
    body: "You're matched to a role or cohort and supported by our team throughout your time with FTF.",
  },
];

export default function GetInvolvedClient() {
  const { stats, positioning } = siteConfig;

  const statStrip = [
    { value: stats.beneficiaries.toLocaleString(), suffix: "+", label: "Children & young people reached" },
    { value: stats.volunteers.toLocaleString(), suffix: "+", label: "Volunteers & changemakers" },
    { value: String(stats.countries), suffix: "", label: "Countries - Ghana & Nigeria" },
    { value: String(stats.yearsOfFoundation), suffix: " yrs", label: "Community-rooted delivery" },
  ];

  return (
    <>
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden bg-primary text-text-on-primary">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(212,168,67,0.16),transparent_55%)]" />
        <div className="relative z-10 mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-accent-text">
              <HeartHandshake className="h-3.5 w-3.5" />
              Get involved
            </span>
            <h1 className="mt-5 font-[family-name:var(--font-display)] text-4xl font-bold leading-[1.08] sm:text-5xl md:text-6xl">
              There&apos;s a role for you.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-text-on-primary/75">
              {positioning}
            </p>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-text-on-primary/60">
              Whether you give an hour a week, a season of mentorship, or an
              institutional partnership - every route helps a young person move
              from disadvantage to opportunity.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/get-involved/volunteer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-cta px-7 py-3.5 text-sm font-semibold text-on-cta shadow-lg shadow-accent/20 transition-all hover:bg-cta-hover hover:scale-[1.02]"
              >
                <HeartHandshake className="h-4 w-4" />
                Become a volunteer
              </Link>
              <Link
                href="/give"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-7 py-3.5 text-sm font-semibold text-white transition-all hover:bg-white/10"
              >
                Explore giving
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== PATHWAYS ===== */}
      <SectionWrapper background="warm">
        <SectionHeader
          overline="Four ways to get involved"
          title="Choose your path"
          description="Pick the route that fits your time, skills and intent. You can always move between them."
        />
        <div className="grid gap-5 sm:grid-cols-2">
          {pathways.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.07, duration: 0.45 }}
            >
              <Link
                href={p.href}
                className="group flex h-full flex-col rounded-2xl border border-border bg-surface p-7 transition-all hover:-translate-y-1 hover:border-accent/50 hover:shadow-xl hover:shadow-primary/5"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-subtle text-accent-text">
                  <p.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 font-[family-name:var(--font-display)] text-2xl font-bold text-text-primary">
                  {p.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-text-secondary">{p.blurb}</p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-accent-hover">
                  {p.cta}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      {/* ===== ONBOARDING + SAFEGUARDING ===== */}
      <SectionWrapper background="white">
        <SectionHeader
          overline="How it works"
          title="A safe, supported onboarding"
          description="Everyone who works with children and young people follows the same four steps - safeguarding is non-negotiable."
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {onboarding.map((o, i) => (
            <motion.div
              key={o.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.06, duration: 0.45 }}
              className="relative rounded-2xl border border-border bg-surface p-6"
            >
              <span className="absolute right-5 top-4 font-[family-name:var(--font-display)] text-3xl font-bold text-bg-tertiary">
                {o.step}
              </span>
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-subtle text-accent-text">
                <o.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-base font-bold text-text-primary">{o.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">{o.body}</p>
            </motion.div>
          ))}
        </div>
        <div className="mx-auto mt-8 max-w-3xl rounded-2xl border border-border bg-surface p-6 text-center">
          <p className="flex items-start justify-center gap-2.5 text-sm leading-relaxed text-text-secondary">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" />
            <span>
              Child protection is at the centre of everything we do. Read our full{" "}
              <Link href="/about/safeguarding" className="font-semibold text-accent-hover hover:underline">
                safeguarding policy
              </Link>{" "}
              before applying.
            </span>
          </p>
        </div>
      </SectionWrapper>

      {/* ===== CREDIBILITY STRIP ===== */}
      <section className="relative overflow-hidden bg-primary py-16 text-text-on-primary">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(212,168,67,0.12),transparent_55%)]" />
        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
          <dl className="grid grid-cols-2 gap-8 text-center lg:grid-cols-4">
            {statStrip.map((s) => (
              <div key={s.label}>
                <dt className="sr-only">{s.label}</dt>
                <dd>
                  <span className="block font-[family-name:var(--font-display)] text-4xl font-bold text-accent-text md:text-5xl">
                    {s.value}
                    {s.suffix}
                  </span>
                  <span className="mt-2 block text-sm text-text-on-primary/70">{s.label}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <SectionWrapper background="gradient">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold text-text-primary md:text-4xl">
              Not sure where to start?
            </h2>
            <p className="mt-4 text-lg text-text-secondary">
              Tell us a little about yourself and we&apos;ll point you to the
              right pathway - or you can support the work directly with a gift.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-text-on-primary transition-all hover:scale-[1.02]"
              >
                Talk to our team
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/give"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-7 py-3.5 text-sm font-semibold text-text-primary transition-all hover:border-accent/50"
              >
                <HeartHandshake className="h-4 w-4" />
                Give instead
              </Link>
            </div>
          </motion.div>
        </div>
      </SectionWrapper>
    </>
  );
}
