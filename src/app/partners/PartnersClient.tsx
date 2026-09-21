"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { img } from "@/lib/imageUrl";
import {
  ArrowRight,
  Handshake,
  Building2,
  Globe,
  Users,
  Check,
  Coins,
  Leaf,
  School,
  Package,
  BookOpen,
  GraduationCap,
  Compass,
  FileDown,
  ShieldCheck,
  MapPin,
  TrendingUp,
  Sprout,
  CalendarCheck,
  Network,
  Mail,
} from "lucide-react";
import SectionWrapper, { SectionHeader } from "@/components/ui/SectionWrapper";
import PartnerInquiryForm from "@/components/partners/PartnerInquiryForm";
import { siteConfig, partnerLogos } from "@/data/site";
import type { ReportDocument } from "@/lib/documents";

interface Partner {
  name: string;
  logo: string;
  type: string;
  tier: string;
}

interface PartnersClientProps {
  initialPartners?: Partner[];
  deckDocs?: ReportDocument[];
}

const routes = [
  { icon: Coins, title: "Programme grants", body: "Fund a specific programme or pillar with clear outcomes and honest reporting." },
  { icon: Building2, title: "CSR / CSV", body: "Align corporate social - or shared - value goals with measurable community impact." },
  { icon: Leaf, title: "ESG & impact reporting", body: "Verified contribution data for the social pillar of your ESG commitments." },
  { icon: Handshake, title: "Implementation partner", body: "We deliver on the ground as your credible local implementation partner." },
  { icon: School, title: "School & community", body: "Partner through the schools and community structures where we already work." },
  { icon: Users, title: "Employee volunteering", body: "Give your teams meaningful, safeguarded volunteering placements." },
  { icon: Package, title: "In-kind support", body: "Contribute goods, services, technology or professional time." },
  { icon: BookOpen, title: "Research & learning", body: "Co-produce evidence, evaluations and learning alongside our programmes." },
  { icon: GraduationCap, title: "Internships & fellowships", body: "Host or fund interns and young changemakers through the FTF Fellowship." },
  { icon: Compass, title: "Multi-year strategic alliance", body: "A sustained partnership spanning several pillars and shared goals." },
];

const credibility = [
  { icon: CalendarCheck, title: "Ten-year history", body: "Founded in 2016 - a decade of continuous, community-rooted delivery." },
  { icon: Sprout, title: "Youth leadership", body: "Youth-led: young people from the communities we serve shape our priorities and programmes." },
  { icon: MapPin, title: "Local reach", body: "Deep roots across seven regions of Ghana and in Ibadan, Nigeria." },
  { icon: Network, title: "Growing systems", body: "We invest in the safeguarding, operations and data systems that let us scale responsibly." },
  { icon: TrendingUp, title: "Delivery capacity", body: "A track record of turning funding into measurable outcomes for children and young people." },
];

const whyPartner = [
  "Youth-led and community-rooted - decisions are shaped by the people we serve.",
  "A decade of continuous delivery since 2016, through changing contexts.",
  "Deep local reach across Ghana and Nigeria, with trusted community relationships.",
  "Five integrated programme pillars - education, girls' empowerment, future-ready skills, mentorship & wellbeing, and community support.",
  "Safeguarding-first standards embedded in every programme and partnership.",
  "Transparent, honest reporting with reviewed impact figures - no inflated claims.",
  "Growing systems and delivery capacity, built to scale responsibly.",
  "Flexible partnership models, from a single-programme grant to a multi-year alliance.",
];

export default function PartnersClient({ initialPartners = [], deckDocs = [] }: PartnersClientProps) {
  const { stats } = siteConfig;

  // Logo wall is driven by partnerLogos (which carry real image assets). Any DB
  // partner not already represented is appended as a text chip so nothing is lost.
  const logoNames = new Set(partnerLogos.map((l) => l.name.toLowerCase()));
  const extraNames = initialPartners
    .map((p) => p.name)
    .filter((n) => n && !logoNames.has(n.toLowerCase()));

  const statStrip = [
    { value: String(stats.yearsOfFoundation), suffix: " yrs", label: "Of continuous delivery" },
    { value: stats.beneficiaries.toLocaleString(), suffix: "+", label: "Children & young people reached" },
    { value: String(stats.programmes), suffix: "", label: "Programme pillars" },
    { value: String(stats.regions), suffix: "", label: "Regions across Ghana & Nigeria" },
  ];

  return (
    <>
      {/* ===== HERO ===== */}
      <section className="relative flex min-h-[52vh] items-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={img("/images/page-heroes/partners-hero.png")}
            alt=""
            fill
            className="object-cover"
            priority
            unoptimized
          />
          <div className="absolute inset-0 bg-primary/80" />
          <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/70 to-primary/85" />
        </div>
        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-28 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-accent-text">
              <Handshake className="h-3.5 w-3.5" />
              Partnerships
            </span>
            <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold leading-[1.08] text-text-on-primary sm:text-5xl md:text-6xl">
              Looking for a credible local implementation partner?
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-text-on-primary/75">
              For The Future Organization is youth-led and community-rooted, with
              a decade of delivery across Ghana and Nigeria. We help
              institutions, foundations and companies turn intent into measurable
              impact - safely, transparently and locally.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="#contact"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-cta px-7 py-3.5 text-sm font-semibold text-on-cta shadow-lg shadow-accent/20 transition-all hover:bg-cta-hover hover:scale-[1.02]"
              >
                <Mail className="h-4 w-4" />
                Discuss a partnership
              </Link>
              <Link
                href="#deck"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 px-7 py-3.5 text-sm font-semibold text-white transition-all hover:bg-white/10"
              >
                <FileDown className="h-4 w-4" />
                Corporate deck
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== CREDIBILITY ===== */}
      <SectionWrapper background="cream">
        <SectionHeader
          overline="Why institutions choose FTF"
          title="A credible partner on the ground"
          description="Five things make FTF a dependable implementation and funding partner."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {credibility.map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.06, duration: 0.45 }}
              className="rounded-2xl border border-border bg-surface p-6"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-subtle text-accent-text">
                <c.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-base font-bold text-text-primary">{c.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">{c.body}</p>
            </motion.div>
          ))}
        </div>

        <dl className="mt-10 grid grid-cols-2 gap-6 rounded-2xl border border-border bg-surface p-8 text-center lg:grid-cols-4">
          {statStrip.map((s) => (
            <div key={s.label}>
              <dt className="sr-only">{s.label}</dt>
              <dd>
                <span className="block font-[family-name:var(--font-display)] text-3xl font-bold text-accent-text md:text-4xl">
                  {s.value}
                  {s.suffix}
                </span>
                <span className="mt-1.5 block text-xs text-text-secondary md:text-sm">{s.label}</span>
              </dd>
            </div>
          ))}
        </dl>
      </SectionWrapper>

      {/* ===== PARTNERSHIP ROUTES ===== */}
      <SectionWrapper background="sand">
        <SectionHeader
          overline="How we can work together"
          title="Partnership routes"
          description="Ten ways to partner - pick the model that fits your goals, or combine several."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {routes.map((r, i) => (
            <motion.div
              key={r.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: (i % 5) * 0.05, duration: 0.4 }}
              className="flex h-full flex-col rounded-2xl border border-border bg-surface p-5"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-subtle text-accent-text">
                <r.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-3.5 text-sm font-bold text-text-primary">{r.title}</h3>
              <p className="mt-1.5 flex-1 text-sm leading-relaxed text-text-secondary">{r.body}</p>
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      {/* ===== WHY PARTNER WITH FTF ===== */}
      <section className="relative overflow-hidden bg-primary py-20 text-text-on-primary">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(212,168,67,0.14),transparent_55%)]" />
        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid items-start gap-12 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-accent-text">
                <ShieldCheck className="h-3.5 w-3.5" />
                The case for FTF
              </span>
              <h2 className="mt-5 font-[family-name:var(--font-display)] text-3xl font-bold leading-tight md:text-4xl">
                Why partner with FTF?
              </h2>
              <p className="mt-4 max-w-md text-text-on-primary/70">
                We combine local legitimacy with the systems and honesty that
                institutional partners need to commit with confidence.
              </p>
              <Link
                href="/impact/reports"
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-accent-text hover:underline"
              >
                See our reports &amp; transparency
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <ul className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
              {whyPartner.map((b, i) => (
                <motion.li
                  key={b}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ delay: i * 0.05, duration: 0.4 }}
                  className="flex items-start gap-3 text-sm leading-relaxed text-text-on-primary/85"
                >
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent-text" />
                  {b}
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ===== LOGO WALL ===== */}
      <SectionWrapper background="cream">
        <SectionHeader
          overline="In good company"
          title="Current partners"
          description="A selection of the corporate, institutional, school and community partners we work alongside."
        />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {partnerLogos.map((logo, i) => (
            <motion.div
              key={logo.name}
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: (i % 8) * 0.04, duration: 0.35 }}
              className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-surface p-6"
            >
              <Image
                src={logo.image}
                alt={logo.name}
                width={120}
                height={64}
                className="h-14 w-auto max-w-[130px] object-contain"
                unoptimized
              />
              <span className="text-center text-xs font-medium text-text-secondary">{logo.name}</span>
            </motion.div>
          ))}
        </div>
        {extraNames.length > 0 && (
          <p className="mt-8 text-center text-sm text-text-muted">
            Also working with{" "}
            <span className="text-text-secondary">{extraNames.join(" · ")}</span>
          </p>
        )}
      </SectionWrapper>

      {/* ===== CORPORATE DECK + INQUIRY ===== */}
      <SectionWrapper background="sand" id="deck">
        <div className="grid items-start gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
          {/* Deck */}
          <div className="min-w-0 rounded-2xl border border-border bg-surface p-7">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-subtle text-accent-text">
              <FileDown className="h-6 w-6" />
            </span>
            <h2 className="mt-5 font-[family-name:var(--font-display)] text-2xl font-bold text-text-primary">
              Corporate deck
            </h2>
            {deckDocs.length > 0 ? (
              <>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                  Download our partnership deck for programme detail, case studies
                  and giving options.
                </p>
                <div className="mt-5 space-y-3">
                  {deckDocs.map((doc) => (
                    <a
                      key={doc.id}
                      href={`/api/documents/${doc.id}/download`}
                      className="flex items-center justify-between gap-3 rounded-xl border border-border px-4 py-3 transition-colors hover:border-accent/50"
                    >
                      <span>
                        <span className="block text-sm font-semibold text-text-primary">
                          {doc.title}
                        </span>
                        {doc.year && (
                          <span className="block text-xs text-text-muted">{doc.year}</span>
                        )}
                      </span>
                      <FileDown className="h-4 w-4 shrink-0 text-accent-hover" />
                    </a>
                  ))}
                </div>
              </>
            ) : (
              <>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                  Our full partnership deck is available on request. Tell us a
                  little about your organisation and we&apos;ll send it straight
                  to your inbox.
                </p>
                <Link
                  href="#contact"
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-text-on-primary transition-all hover:scale-[1.02]"
                >
                  Request the deck
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </>
            )}
            <div className="mt-6 border-t border-border pt-5">
              <p className="flex items-start gap-2.5 text-sm leading-relaxed text-text-secondary">
                <Globe className="mt-0.5 h-4 w-4 shrink-0 text-accent-hover" />
                Prefer email? Reach our partnerships team at{" "}
                <a
                  href={`mailto:${siteConfig.contact.emails[0]}`}
                  className="min-w-0 font-semibold text-accent-hover hover:underline [overflow-wrap:anywhere]"
                >
                  {siteConfig.contact.emails[0]}
                </a>
                .
              </p>
            </div>
          </div>

          {/* Inquiry form */}
          <div id="contact" className="min-w-0 scroll-mt-28">
            <PartnerInquiryForm />
          </div>
        </div>
      </SectionWrapper>
    </>
  );
}
