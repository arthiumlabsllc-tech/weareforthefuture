"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  HeartPulse,
  Laptop,
  GraduationCap,
  Palette,
  Megaphone,
  Code2,
  ClipboardList,
  ShieldCheck,
  Clock,
  MapPin,
  Check,
} from "lucide-react";
import SectionWrapper, { SectionHeader } from "@/components/ui/SectionWrapper";
import VolunteerApplicationForm from "@/components/get-involved/VolunteerApplicationForm";

const roles = [
  { icon: BookOpen, title: "Teaching & learning support", body: "Tutoring, reading clubs and life-skills sessions that keep children learning." },
  { icon: HeartPulse, title: "Girls' empowerment & health", body: "Menstrual health education, dignity kits and safe-space facilitation." },
  { icon: Laptop, title: "Digital & future-ready skills", body: "Digital literacy, coding and entrepreneurship workshops for young people." },
  { icon: GraduationCap, title: "Mentorship & leadership", body: "Guide a young person through academic, career and leadership pathways." },
  { icon: Palette, title: "Creative arts & sports", body: "Photography, art, music and sport programmes that build confidence." },
  { icon: Megaphone, title: "Fundraising & communications", body: "Campaigns, storytelling, social media and donor engagement — mostly remote." },
  { icon: Code2, title: "Tech & data", body: "Web, systems, monitoring & evaluation and data support — remote-friendly." },
  { icon: ClipboardList, title: "Operations & logistics", body: "Programme coordination, events, procurement and community liaison." },
];

const expectations = [
  "Complete our safeguarding briefing and agree to the code of conduct before you start.",
  "Consent to reference and, where required, background checks.",
  "Never request, share or publish a child's personal details, photos or location.",
  "Follow the two-adult rule and report any concern to the safeguarding lead immediately.",
  "Commit to your agreed schedule so programmes and children can rely on you.",
];

const volunteerInterests = [
  { value: "teaching", label: "Teaching & learning support" },
  { value: "girls-empowerment-health", label: "Girls' empowerment & health" },
  { value: "digital-skills", label: "Digital & future-ready skills" },
  { value: "mentorship", label: "Mentorship & leadership" },
  { value: "creative-arts", label: "Creative arts & sports" },
  { value: "fundraising-communications", label: "Fundraising & communications" },
  { value: "tech-data", label: "Tech & data" },
  { value: "operations", label: "Operations & logistics" },
  { value: "other", label: "Something else" },
];

export default function VolunteerPageClient() {
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
              Volunteer
            </span>
            <h1 className="mt-5 font-[family-name:var(--font-display)] text-4xl font-bold leading-[1.1] sm:text-5xl">
              Give your time and skills
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-text-on-primary/75">
              Volunteers are the hands and heart of our programmes. Whether you
              can join on-site in Ghana or Nigeria, or contribute remotely, there
              is a role that fits your skills and availability.
            </p>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-text-on-primary/70">
              <span className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4 text-accent-text" /> Ghana &amp; Nigeria, or remote
              </span>
              <span className="inline-flex items-center gap-2">
                <Clock className="h-4 w-4 text-accent-text" /> Flexible commitment
              </span>
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-accent-text" /> Safeguarding-first
              </span>
            </div>
            <Link
              href="#apply"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-accent to-accent-hover px-7 py-3.5 text-sm font-semibold text-navy-900 shadow-lg shadow-accent/20 transition-all hover:scale-[1.02]"
            >
              Apply to volunteer
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ===== ROLES ===== */}
      <SectionWrapper background="warm">
        <SectionHeader
          overline="Where you can help"
          title="Volunteer roles"
          description="Our roles map to the five programme pillars plus the teams that keep them running."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {roles.map((r, i) => (
            <motion.div
              key={r.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.05, duration: 0.45 }}
              className="rounded-2xl border border-border bg-surface p-6"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-subtle text-accent-text">
                <r.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-base font-bold text-text-primary">{r.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">{r.body}</p>
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      {/* ===== MODEL + SAFEGUARDING ===== */}
      <SectionWrapper background="white">
        <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-14">
          <div>
            <SectionHeader
              align="left"
              overline="The volunteer model"
              title="How volunteering works"
            />
            <div className="mt-6 space-y-4 text-sm leading-relaxed text-text-secondary">
              <p>
                We match volunteers to real programme needs — not the other way
                round. After you apply, our team reviews your skills and
                availability, completes safeguarding checks, and places you with a
                programme, school or community team where you can add the most
                value.
              </p>
              <p>
                Commitments are flexible: some volunteers give a few hours a week
                on-site, others contribute a professional skill remotely, and many
                join a specific campaign or event. Whatever the shape, you&apos;ll
                be briefed, supported and never left to figure it out alone.
              </p>
            </div>
            <ul className="mt-6 space-y-3">
              {[
                "On-site roles across Greater Accra and other regions of Ghana, and Ibadan, Nigeria.",
                "Remote roles in tech, data, fundraising, communications and design.",
                "Short-term campaign help and ongoing skilled placements.",
              ].map((line) => (
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
              Safeguarding expectations
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">
              Everyone who works with children and young people must read and
              agree to these before starting. They are non-negotiable.
            </p>
            <ul className="mt-5 space-y-3">
              {expectations.map((e) => (
                <li key={e} className="flex items-start gap-2.5 text-sm text-text-secondary">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  {e}
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

      {/* ===== APPLICATION ===== */}
      <SectionWrapper background="warm" id="apply">
        <div className="mx-auto max-w-2xl">
          <VolunteerApplicationForm
            interestOptions={volunteerInterests}
            title="Volunteer application"
            description="Submit your details and our team will be in touch within 48 hours about next steps and safeguarding."
            submitLabel="Submit application"
            successTitle="Application received"
            successBody="Thank you for offering your time to For The Future Organization. Our team will review your application and contact you within 48 hours."
            footnote="By applying you agree to our safeguarding expectations and code of conduct."
          />
        </div>
      </SectionWrapper>
    </>
  );
}
