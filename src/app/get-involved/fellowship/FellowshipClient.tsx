"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Users,
  Lightbulb,
  Target,
  GraduationCap,
  HeartHandshake,
  Check,
} from "lucide-react";
import SectionWrapper, { SectionHeader } from "@/components/ui/SectionWrapper";
import VolunteerApplicationForm from "@/components/get-involved/VolunteerApplicationForm";

const pillarsOfFellowship = [
  {
    icon: Lightbulb,
    title: "Lead a real project",
    body: "Fellows design and run a community project — from a learning club to a health or digital-skills drive — with FTF support behind them.",
  },
  {
    icon: GraduationCap,
    title: "Build skills that last",
    body: "Training in leadership, project management, communication and safeguarding that serves fellows long after the cohort ends.",
  },
  {
    icon: Users,
    title: "Learn with mentors",
    body: "Each fellow is paired with a mentor and joins a peer network of young changemakers across Ghana and Nigeria.",
  },
  {
    icon: HeartHandshake,
    title: "Give back & lead",
    body: "Graduates return to mentor and train the next cohort — the cycle that keeps the Fellowship rooted in the community it serves.",
  },
];

const steps = [
  { step: "01", title: "Express interest", body: "Submit the form below and tell us about the change you want to drive in your community." },
  { step: "02", title: "Conversation & selection", body: "Our team meets shortlisted applicants to understand their motivation, availability and ideas." },
  { step: "03", title: "Training & project design", body: "Fellows complete onboarding and safeguarding, then shape a project with a mentor's guidance." },
  { step: "04", title: "Deliver & give back", body: "Fellows run their project, reflect on impact, and join the alumni who mentor the next cohort." },
];

const fellowshipInterests = [
  { value: "fellowship-community-project", label: "Community project leadership" },
  { value: "fellowship-education", label: "Education & learning" },
  { value: "fellowship-girls-health", label: "Girls' empowerment & health" },
  { value: "fellowship-digital-creative", label: "Digital & creative skills" },
  { value: "fellowship-advocacy", label: "Advocacy & storytelling" },
  { value: "fellowship-enterprise", label: "Entrepreneurship" },
  { value: "fellowship-not-sure", label: "Not sure yet — advise me" },
];

export default function FellowshipClient() {
  return (
    <>
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden bg-primary text-text-on-primary">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_18%,rgba(212,168,67,0.16),transparent_55%)]" />
        <div className="relative z-10 mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
          <Link
            href="/get-involved"
            className="inline-flex items-center gap-1.5 text-sm text-text-on-primary/70 transition-colors hover:text-accent-bright"
          >
            <ArrowLeft className="h-4 w-4" />
            All ways to get involved
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="mt-6 max-w-3xl"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-accent-text">
              <Sparkles className="h-3.5 w-3.5" />
              Young Changemakers
            </span>
            <h1 className="mt-5 font-[family-name:var(--font-display)] text-4xl font-bold leading-[1.1] sm:text-5xl">
              The FTF Fellowship
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-text-on-primary/75">
              A structured pathway for young leaders — including graduates of our
              own programmes — to lead community projects, build real skills and
              give back by mentoring the next cohort.
            </p>
            <Link
              href="#apply"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-cta px-7 py-3.5 text-sm font-semibold text-on-cta shadow-lg shadow-accent/20 transition-all hover:bg-cta-hover hover:scale-[1.02]"
            >
              Express your interest
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ===== WHAT THE FELLOWSHIP OFFERS ===== */}
      <SectionWrapper background="warm">
        <SectionHeader
          overline="What the Fellowship is"
          title="Leadership, grounded in community"
          description="The Fellowship turns energy and ideas into supported action — and asks fellows to lift others as they rise."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {pillarsOfFellowship.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.06, duration: 0.45 }}
              className="rounded-2xl border border-border bg-surface p-6"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-subtle text-accent-text">
                <p.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-base font-bold text-text-primary">{p.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">{p.body}</p>
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      {/* ===== WHO IT'S FOR + HOW IT WORKS ===== */}
      <SectionWrapper background="white">
        <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-14">
          <div>
            <SectionHeader align="left" overline="Who it's for" title="Is the Fellowship right for you?" />
            <p className="mt-5 text-sm leading-relaxed text-text-secondary">
              The Fellowship is for young people who want to lead change in their
              community — whether you&apos;re a student, a recent graduate, an
              alumnus of an FTF programme, or a young professional with an idea
              worth backing.
            </p>
            <ul className="mt-5 space-y-3">
              {[
                "You care about a specific issue — education, health, girls' empowerment, skills or the environment.",
                "You can commit time across the cohort to design and deliver a project.",
                "You want mentorship, training and a peer network, not just a certificate.",
                "You're willing to uphold our safeguarding standards and give back to the next cohort.",
              ].map((line) => (
                <li key={line} className="flex items-start gap-2.5 text-sm text-text-secondary">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  {line}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex items-start gap-2.5 rounded-2xl border border-border bg-surface p-5 text-sm text-text-secondary">
              <Target className="mt-0.5 h-4 w-4 shrink-0 text-accent-hover" />
              <span>
                Cohort size, timeline and format are set with each intake and
                announced to applicants.{" "}
                <Link href="/contact" className="font-semibold text-accent-hover hover:underline">
                  Ask our team
                </Link>{" "}
                about the next round.
              </span>
            </div>
          </div>

          <div>
            <SectionHeader align="left" overline="How it works" title="The Fellowship journey" />
            <ol className="mt-6 space-y-4">
              {steps.map((s, i) => (
                <motion.li
                  key={s.step}
                  initial={{ opacity: 0, x: 16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ delay: i * 0.07, duration: 0.45 }}
                  className="flex gap-4 rounded-2xl border border-border bg-surface p-5"
                >
                  <span className="font-[family-name:var(--font-display)] text-2xl font-bold text-accent-text">
                    {s.step}
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-text-primary">{s.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-text-secondary">{s.body}</p>
                  </div>
                </motion.li>
              ))}
            </ol>
          </div>
        </div>
      </SectionWrapper>

      {/* ===== EXPRESS INTEREST ===== */}
      <SectionWrapper background="warm" id="apply">
        <div className="mx-auto max-w-2xl">
          <VolunteerApplicationForm
            interestOptions={fellowshipInterests}
            defaultInterest="fellowship-community-project"
            title="Express your interest"
            description="Tell us about the change you want to drive. Our team will be in touch within 48 hours about the next Fellowship round."
            submitLabel="Submit interest"
            successTitle="Interest received"
            successBody="Thank you for your interest in the FTF Fellowship. Our team will contact you within 48 hours with details on the next cohort."
            footnote="Applications are reviewed each intake. Safeguarding checks apply to all fellows."
          />
        </div>
      </SectionWrapper>
    </>
  );
}
