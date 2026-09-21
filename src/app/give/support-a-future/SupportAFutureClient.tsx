"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Lock,
  ShieldCheck,
  HeartHandshake,
  BookOpen,
  HeartPulse,
  GraduationCap,
  Users,
  Check,
  Sparkles,
} from "lucide-react";
import SectionWrapper, { SectionHeader } from "@/components/ui/SectionWrapper";
import GivingPanel from "@/components/give/GivingPanel";

const steps = [
  {
    icon: Lock,
    title: "You give to a fund, not a named child",
    body: "Your gift joins the Support a Future fund. We never publish identifiable profiles, photos or case details of individual children.",
  },
  {
    icon: HeartHandshake,
    title: "FTF administers the support",
    body: "Our team directs funds to school fees, learning materials, meals, and health & dignity kits based on assessed need across our programmes.",
  },
  {
    icon: ShieldCheck,
    title: "Safeguarding comes first",
    body: "No direct contact, no sponsorship of a specific child, no personal data shared. Dignity and safety are built into the model.",
  },
  {
    icon: Users,
    title: "You see the collective impact",
    body: "We report back through aggregate stories and transparent reporting - how support changed lives, without exposing anyone.",
  },
];

const supportAreas = [
  {
    icon: BookOpen,
    title: "Learning",
    body: "School fees, uniforms, books and classroom supplies that keep a child in school and ready to learn.",
  },
  {
    icon: HeartPulse,
    title: "Health & dignity",
    body: "Menstrual health kits, nutrition and basic healthcare so no child misses school for want of them.",
  },
  {
    icon: Sparkles,
    title: "Wellbeing & safety",
    body: "Safe learning spaces, mentoring and psychosocial support that help a child feel seen and secure.",
  },
  {
    icon: GraduationCap,
    title: "Pathways & skills",
    body: "Future-ready and digital-skills programmes that turn today's support into tomorrow's opportunity.",
  },
];

export default function SupportAFutureClient() {
  return (
    <>
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden bg-primary text-text-on-primary">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_18%,rgba(212,168,67,0.16),transparent_55%)]" />
        <div className="relative z-10 mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
          <Link
            href="/give"
            className="inline-flex items-center gap-1.5 text-sm text-text-on-primary/70 transition-colors hover:text-accent-bright"
          >
            <ArrowLeft className="h-4 w-4" />
            All giving routes
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="mt-6 max-w-3xl"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-accent-text">
              <Sparkles className="h-3.5 w-3.5" />
              Beneficiary support
            </span>
            <h1 className="mt-5 font-[family-name:var(--font-display)] text-4xl font-bold leading-[1.1] sm:text-5xl">
              Support a Future
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-text-on-primary/75">
              Privacy-safe, FTF-administered giving that backs a child&apos;s
              learning, dignity and wellbeing. You fund the support; we carry the
              responsibility of delivering it safely - no identifiable profiles,
              ever.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ===== HOW IT WORKS + PANEL ===== */}
      <SectionWrapper background="warm">
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_1fr] lg:gap-14">
          {/* LEFT - the privacy-safe model */}
          <div>
            <SectionHeader
              align="left"
              overline="How it works"
              title="A safeguarding-first way to give"
              description="Child sponsorship models can put young people at risk. Support a Future keeps the generosity and removes the exposure."
            />
            <ol className="mt-8 space-y-5">
              {steps.map((s, i) => (
                <motion.li
                  key={s.title}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ delay: i * 0.07, duration: 0.45 }}
                  className="flex gap-4"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-subtle text-accent-text">
                    <s.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-text-primary">{s.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-text-secondary">{s.body}</p>
                  </div>
                </motion.li>
              ))}
            </ol>
            <div className="mt-8 rounded-2xl border border-border bg-surface p-5">
              <p className="flex items-start gap-2.5 text-sm leading-relaxed text-text-secondary">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                <span>
                  Read our full approach in the{" "}
                  <Link href="/about/safeguarding" className="font-semibold text-accent-hover hover:underline">
                    safeguarding policy
                  </Link>
                  . Approved, consent-based stories are shared on our{" "}
                  <Link href="/impact-stories" className="font-semibold text-accent-hover hover:underline">
                    impact stories
                  </Link>{" "}
                  page.
                </span>
              </p>
            </div>
          </div>

          {/* RIGHT - giving panel */}
          <div className="lg:sticky lg:top-28">
            <GivingPanel
              source="support_a_future"
              targetName="Support a Future"
              heading="Support a Future"
            />
          </div>
        </div>
      </SectionWrapper>

      {/* ===== WHAT YOUR SUPPORT FUNDS ===== */}
      <SectionWrapper background="white">
        <SectionHeader
          overline="Where it goes"
          title="What your support funds"
          description="Every gift is pooled and directed by our team to the highest-need areas below."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {supportAreas.map((a, i) => (
            <motion.div
              key={a.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.06, duration: 0.45 }}
              className="rounded-2xl border border-border bg-surface p-6"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-subtle text-accent-text">
                <a.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-lg font-bold text-text-primary">{a.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">{a.body}</p>
            </motion.div>
          ))}
        </div>
        <div className="mx-auto mt-10 flex max-w-2xl flex-col items-center gap-3 rounded-2xl border border-border bg-surface p-6 text-center sm:flex-row sm:text-left">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-success-bg text-success-text">
            <Check className="h-5 w-5" />
          </span>
          <p className="flex-1 text-sm leading-relaxed text-text-secondary">
            Prefer to direct your gift yourself? Choose a{" "}
            <Link href="/give#programmes" className="font-semibold text-accent-hover hover:underline">
              specific programme
            </Link>{" "}
            or{" "}
            <Link href="/give/where-most-needed" className="font-semibold text-accent-hover hover:underline">
              give where it&apos;s needed most
            </Link>
            .
          </p>
          <Link
            href="/give"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-text-primary transition-colors hover:border-accent/50"
          >
            All routes
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </SectionWrapper>
    </>
  );
}
