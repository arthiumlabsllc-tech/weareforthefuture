"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { cardClasses, cardPadding } from "@/lib/ui/cardClasses";
import {
  AlertTriangle,
  Camera,
  Database,
  Handshake,
  Mail,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import SectionWrapper, { SectionHeader } from "@/components/ui/SectionWrapper";
import { siteConfig } from "@/data/site";

const reportEmail = siteConfig.contact.emails[0];

const sections = [
  {
    icon: ShieldCheck,
    title: "Our commitment to child protection",
    body: "Every child who takes part in a For The Future programme has the right to be safe. Safeguarding is a precondition of our work - built into programme design, volunteer onboarding and partner agreements. We hold a zero-tolerance position on abuse, exploitation and neglect, and we act on concerns even when doing so is uncomfortable.",
  },
  {
    icon: Camera,
    title: "Consent and safe photography & storytelling",
    body: "We only photograph or share a child's story with informed, documented consent from a parent or guardian, and with the child's own assent where age-appropriate. Stories are told with dignity - never to evoke pity - and consent can be withdrawn at any time. We do not publish identifying details, locations or images that could put a child at risk.",
  },
  {
    icon: UserCheck,
    title: "Volunteer conduct",
    body: "All volunteers are screened and agree to a code of conduct before working with children. This sets out supervision requirements, appropriate boundaries, the avoidance of unsupervised one-to-one contact wherever possible, and a duty to report any concern. Safeguarding training is part of onboarding, not an afterthought.",
  },
  {
    icon: AlertTriangle,
    title: "Incident reporting & referral",
    body: "Any concern about a child's safety is reported immediately to our designated safeguarding lead. We follow a documented process - record, escalate, and where necessary refer to statutory authorities and child-protection partners. We do not investigate allegations ourselves, and we never promise confidentiality that would leave a child at risk.",
  },
  {
    icon: Database,
    title: "Data protection",
    body: "We collect only the personal data needed to deliver and safeguard our programmes, store it securely and restrict access to authorized personnel. Children's data is treated with heightened care and is never sold. We share it only where required to protect a child or to comply with law.",
  },
  {
    icon: Handshake,
    title: "Partner safeguarding expectations",
    body: "Institutions, schools and organizations that partner with FTF are expected to meet equivalent safeguarding standards - covering consent practices, conduct expectations and incident reporting. Safeguarding is assessed as part of our partnership due diligence and ongoing review.",
  },
];

export default function SafeguardingClient() {
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
            <ShieldCheck className="h-4 w-4" aria-hidden="true" /> Safeguarding &amp; Accountability
          </span>
          <h1 className="mt-5 font-[family-name:var(--font-display)] text-4xl font-bold leading-[1.1] text-text-on-primary sm:text-5xl">
            Keeping children safe is the job before the job
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-text-on-primary/70">
            We publish our safeguarding commitments openly so that families,
            volunteers, partners and supporters know exactly what to expect from
            us - and how to hold us to account.
          </p>
        </motion.div>
      </SectionWrapper>

      {/* ===== COMMITMENTS ===== */}
      <SectionWrapper background="cream">
        <SectionHeader
          overline="Our standards"
          title="What we commit to"
          description="Six areas where our safeguarding and accountability standards apply across every programme and partnership."
        />
        <div className="grid gap-6 md:grid-cols-2">
          {sections.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.45, delay: i * 0.05 }}
              className={`${cardClasses} flex h-full flex-col ${cardPadding.feature}`}
            >
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent-subtle text-accent-text">
                <s.icon className="h-6 w-6" aria-hidden="true" />
              </span>
              <h2 className="mt-5 text-lg font-bold text-text-primary">{s.title}</h2>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-text-secondary">{s.body}</p>
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      {/* ===== REPORT A CONCERN ===== */}
      <SectionWrapper background="sand">
        <div className="mx-auto max-w-3xl rounded-3xl border border-border bg-surface p-8 text-center md:p-12">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-subtle text-accent-text">
            <AlertTriangle className="h-7 w-7" aria-hidden="true" />
          </span>
          <h2 className="mt-5 font-[family-name:var(--font-display)] text-2xl font-bold text-text-primary md:text-3xl">
            Report a concern
          </h2>
          <p className="mt-3 text-text-secondary">
            If you have a safeguarding concern about a child or about the conduct
            of a volunteer, partner or member of our team, please tell us. Every
            report is taken seriously and handled by our designated safeguarding
            lead. In an emergency, contact local authorities first.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href={`mailto:${reportEmail}?subject=${encodeURIComponent("Safeguarding concern")}`}
              className="inline-flex items-center gap-2 rounded-full bg-cta px-7 py-3.5 text-sm font-semibold text-on-cta shadow-lg shadow-accent/20 transition-all hover:bg-cta-hover hover:scale-[1.02]"
            >
              <Mail className="h-4 w-4" aria-hidden="true" /> Report a concern
            </a>
            <Link
              href="/partners"
              className="inline-flex items-center gap-2 rounded-full border border-border-strong bg-surface px-7 py-3.5 text-sm font-semibold text-text-primary transition-all hover:border-accent hover:text-accent-text"
            >
              Partner with us
            </Link>
          </div>
          <p className="mt-6 text-xs text-text-muted">
            You can also reach us at{" "}
            <a href={`mailto:${reportEmail}`} className="font-medium text-accent-text hover:underline">
              {reportEmail}
            </a>
            .
          </p>
        </div>
      </SectionWrapper>
    </>
  );
}
