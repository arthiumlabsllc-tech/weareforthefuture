"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  GraduationCap,
  BookOpen,
  Briefcase,
  Laptop,
  Compass,
  Sprout,
  ShieldCheck,
  Clock,
  Check,
} from "lucide-react";
import SectionWrapper, { SectionHeader } from "@/components/ui/SectionWrapper";
import PageHero from "@/components/ui/PageHero";
import VolunteerApplicationForm from "@/components/get-involved/VolunteerApplicationForm";

const mentorTracks = [
  { icon: BookOpen, title: "Academic guidance", body: "Support study habits, subject confidence and staying in school through to completion." },
  { icon: Briefcase, title: "Career pathways", body: "Open doors to professions, apprenticeships, TVET and the world of work." },
  { icon: Laptop, title: "Digital & technical skills", body: "Coach young people in digital literacy, coding, design or a trade you practise." },
  { icon: Compass, title: "Leadership & life skills", body: "Build confidence, decision-making, values and resilience for everyday life." },
  { icon: Sprout, title: "Entrepreneurship", body: "Guide a young person turning an idea into a small, sustainable enterprise." },
  { icon: GraduationCap, title: "Role modelling", body: "Simply being a consistent, encouraging adult presence makes a measurable difference." },
];

const commitment = [
  "A regular, predictable cadence - typically a scheduled check-in with your mentee.",
  "An agreed commitment window so the young person can rely on the relationship.",
  "Completion of our safeguarding briefing and reference/background checks.",
  "Clear boundaries: mentorship is supportive and structured, never a private or personal relationship.",
];

const mentorInterests = [
  { value: "mentorship-academic", label: "Academic guidance" },
  { value: "mentorship-career", label: "Career pathways" },
  { value: "mentorship-digital", label: "Digital & technical skills" },
  { value: "mentorship-leadership", label: "Leadership & life skills" },
  { value: "mentorship-enterprise", label: "Entrepreneurship" },
  { value: "mentorship-role-model", label: "General role modelling" },
  { value: "mentorship-other", label: "Something else" },
];

export default function MentorClient() {
  return (
    <>
      {/* ===== HERO ===== */}
      <PageHero
        eyebrow="Mentor pathway"
        eyebrowIcon={GraduationCap}
        title="Be the person someone needed"
        backLink={{ href: "/get-involved", label: "All ways to get involved" }}
        description="Mentors connect children and young people with guidance, role models and real-world experience. A consistent, encouraging adult can change the direction of a young life - and it starts with showing up."
        meta={
          <>
            <span className="inline-flex items-center gap-2">
              <Clock className="h-4 w-4 text-accent-text" /> Regular, flexible cadence
            </span>
            <span className="inline-flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-accent-text" /> Safeguarding-checked
            </span>
            <span className="inline-flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-accent-text" /> Trained &amp; supported
            </span>
          </>
        }
        image="/images/about/ftf-tamale-3.jpg"
        imageAlt="A mentor guiding a young person during a community session."
        actions={
          <Link
            href="#apply"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-cta px-7 py-3.5 text-sm font-semibold text-on-cta shadow-lg shadow-accent/20 transition-all hover:bg-cta-hover hover:scale-[1.02]"
          >
            Become a mentor
            <ArrowRight className="h-4 w-4" />
          </Link>
        }
      />

      {/* ===== TRACKS ===== */}
      <SectionWrapper background="warm">
        <SectionHeader
          overline="Where mentors help"
          title="Mentorship tracks"
          description="Choose the track closest to your experience. You'll be matched with a young person whose goals align with it."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mentorTracks.map((t, i) => (
            <motion.div
              key={t.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.05, duration: 0.45 }}
              className="rounded-2xl border border-border bg-surface p-6"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-subtle text-accent-text">
                <t.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-base font-bold text-text-primary">{t.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">{t.body}</p>
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      {/* ===== COMMITMENT + SAFEGUARDING ===== */}
      <SectionWrapper background="white">
        <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-14">
          <div>
            <SectionHeader align="left" overline="The commitment" title="What we ask of mentors" />
            <p className="mt-5 text-sm leading-relaxed text-text-secondary">
              Mentorship works through consistency, not intensity. We ask mentors
              to be dependable, prepared and patient - and we equip you with
              training, a matching process and ongoing support from our team.
            </p>
            <ul className="mt-5 space-y-3">
              {commitment.map((line) => (
                <li key={line} className="flex items-start gap-2.5 text-sm text-text-secondary">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  {line}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-7">
            <h2 className="flex items-center gap-2 font-[family-name:var(--font-display)] text-xl font-bold text-text-primary">
              <ShieldCheck className="h-5 w-5 text-success" />
              Safeguarding first
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">
              Because mentors work directly with young people, every mentor
              completes our child-protection standards before being matched.
            </p>
            <ul className="mt-5 space-y-3">
              {[
                "Safeguarding briefing and signed code of conduct.",
                "Reference and, where required, background checks.",
                "Structured, supervised matching - no unsupervised private contact.",
                "A named safeguarding lead to raise any concern with, at any time.",
              ].map((line) => (
                <li key={line} className="flex items-start gap-2.5 text-sm text-text-secondary">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  {line}
                </li>
              ))}
            </ul>
            <Link
              href="/about/safeguarding"
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-accent-hover hover:underline"
            >
              Read the full safeguarding policy
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </SectionWrapper>

      {/* ===== EXPRESS INTEREST ===== */}
      <SectionWrapper background="warm" id="apply">
        <div className="mx-auto max-w-2xl">
          <VolunteerApplicationForm
            interestOptions={mentorInterests}
            defaultInterest="mentorship-academic"
            title="Become a mentor"
            description="Tell us about your experience and the track you'd like to mentor in. Our team will be in touch within 48 hours."
            submitLabel="Submit interest"
            successTitle="Interest received"
            successBody="Thank you for offering to mentor with For The Future Organization. Our team will contact you within 48 hours about matching and safeguarding."
            footnote="All mentors complete safeguarding checks before being matched with a young person."
          />
        </div>
      </SectionWrapper>
    </>
  );
}
