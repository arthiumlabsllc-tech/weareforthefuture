"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  HeartHandshake,
  Repeat,
  BookOpen,
  Megaphone,
  Sparkles,
  Building2,
  ArrowRight,
  ShieldCheck,
  FileText,
  PieChart,
  CalendarClock,
} from "lucide-react";
import SectionWrapper, { SectionHeader } from "@/components/ui/SectionWrapper";
import { siteConfig } from "@/data/site";
import { fundAllocation } from "@/data/impact";
import { cardClasses, cardPadding } from "@/lib/ui/cardClasses";
import type { ProgrammeIndicator } from "@/lib/pillars";
import type { GivingCampaign } from "@/lib/give";

interface GiveClientProps {
  programmes?: ProgrammeIndicator[];
  campaigns?: GivingCampaign[];
}

const routes = [
  {
    href: "/give/where-most-needed",
    title: "Give where it's needed most",
    blurb:
      "Unrestricted giving. We direct your gift to the highest-priority need across our five programme pillars.",
    cta: "Give now",
    icon: HeartHandshake,
    recommended: true,
  },
  {
    href: "/give/monthly",
    title: "Monthly giving",
    blurb:
      "Recurring support that gives programmes predictable funding to plan, staff and sustain their work.",
    cta: "Give monthly",
    icon: Repeat,
  },
  {
    href: "#programmes",
    title: "Programme support",
    blurb:
      "Back a specific pillar or programme - from foundational learning to future-ready skills.",
    cta: "Choose a programme",
    icon: BookOpen,
  },
  {
    href: "#campaigns",
    title: "Campaign support",
    blurb:
      "Time-bound appeals such as the FTF Village build and our 10th anniversary.",
    cta: "See campaigns",
    icon: Megaphone,
  },
  {
    href: "/give/support-a-future",
    title: "Support a Future",
    blurb:
      "Privacy-safe, FTF-administered giving toward a child's learning, dignity and wellbeing.",
    cta: "Support a Future",
    icon: Sparkles,
  },
  {
    href: "/partners",
    title: "Partnership",
    blurb:
      "Corporate, institutional and implementation partnerships with FTF.",
    cta: "Explore partnership",
    icon: Building2,
  },
];

function pesewasToGhs(pesewas: number): number {
  return Math.round(pesewas / 100);
}

export default function GiveClient({ programmes = [], campaigns = [] }: GiveClientProps) {
  const { legal, stats } = siteConfig;

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
              Ways to give
            </span>
            <h1 className="mt-5 font-[family-name:var(--font-display)] text-4xl font-bold leading-[1.08] sm:text-5xl md:text-6xl">
              Give where it matters.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-text-on-primary/75">
              {siteConfig.positioning}
            </p>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-text-on-primary/60">
              Choose the route that fits how you want to help. Every gift is
              secure, tax-deductible and reported with the same honesty we bring
              to our programmes.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ===== TWO-COLUMN: ROUTES + TRUST ===== */}
      <SectionWrapper background="cream">
        <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:gap-14">
          {/* LEFT - giving routes */}
          <div>
            <SectionHeader
              align="left"
              overline="Six ways to give"
              title="Pick the route that fits"
              description="Whether one-off or ongoing, restricted or unrestricted, there is a way to give that matches your intent."
            />
            <div className="grid gap-4 sm:grid-cols-2">
              {routes.map((route, i) => (
                <motion.div
                  key={route.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ delay: i * 0.06, duration: 0.45 }}
                >
                  <Link
                    href={route.href}
                    className={`${cardClasses} group flex h-full flex-col ${cardPadding.default}`}
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-subtle text-accent-text">
                        <route.icon className="h-5 w-5" />
                      </span>
                      {route.recommended && (
                        <span className="rounded-full bg-success-bg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-success-text">
                          Most effective
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-text-primary">{route.title}</h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-text-secondary">
                      {route.blurb}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-accent-hover">
                      {route.cta}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          {/* RIGHT - trust signals */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm md:p-8">
              <h2 className="flex items-center gap-2 font-[family-name:var(--font-display)] text-xl font-bold text-text-primary">
                <ShieldCheck className="h-5 w-5 text-success" />
                Your gift, accounted for
              </h2>

              <dl className="mt-6 space-y-4 text-sm">
                <div>
                  <dt className="font-semibold text-text-primary">Legal status</dt>
                  <dd className="mt-0.5 text-text-secondary">{legal.status}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-text-primary">NGO registration</dt>
                  <dd className="mt-0.5 text-text-secondary">
                    {legal.ngoRegistration ?? (
                      <span className="inline-flex items-center gap-1.5 text-text-muted">
                        <FileText className="h-3.5 w-3.5" /> Details being published
                      </span>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-text-primary">US 501(c)(3) EIN</dt>
                  <dd className="mt-0.5 text-text-secondary">
                    {legal.us501c3Ein ?? (
                      <span className="inline-flex items-center gap-1.5 text-text-muted">
                        <FileText className="h-3.5 w-3.5" /> Details being published
                      </span>
                    )}
                  </dd>
                </div>
              </dl>

              {/* Fund allocation summary */}
              <div className="mt-7 border-t border-border pt-6">
                <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-text-muted">
                  <PieChart className="h-3.5 w-3.5" />
                  Where funds go
                </h3>
                <ul className="mt-4 space-y-3">
                  {fundAllocation.map((f) => (
                    <li key={f.category}>
                      <div className="flex items-baseline justify-between gap-3 text-sm">
                        <span className="text-text-secondary">{f.category}</span>
                        <span className="font-semibold tabular-nums text-text-primary">
                          {f.percentage}%
                        </span>
                      </div>
                      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-bg-tertiary">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${f.percentage}%`, backgroundColor: f.hex }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-xs leading-relaxed text-text-muted">
                  {siteConfig.donation.allocationNote} Figures reviewed each
                  reporting cycle.
                </p>
              </div>

              <p className="mt-6 flex items-center gap-2 border-t border-border pt-5 text-xs text-text-muted">
                <CalendarClock className="h-3.5 w-3.5 shrink-0" />
                Last updated: {stats.lastUpdated}
              </p>
              <p className="mt-3 text-xs leading-relaxed text-text-muted">
                {legal.taxNote}
              </p>
              <Link
                href="/impact/reports"
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-accent-hover hover:underline"
              >
                Reports &amp; Transparency
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </aside>
        </div>
      </SectionWrapper>

      {/* ===== PROGRAMME CHOOSER ===== */}
      <SectionWrapper background="sand" id="programmes">
        <SectionHeader
          overline="Programme support"
          title="Give to a specific programme"
          description="Direct your gift to the pillar or programme closest to what you care about."
        />
        {programmes.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {programmes.map((p, i) => (
              <motion.div
                key={p.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: i * 0.05, duration: 0.45 }}
              >
                <Link
                  href={`/give/${p.slug}`}
                  className={`${cardClasses} group flex h-full flex-col ${cardPadding.default}`}
                >
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-accent-hover">
                    {p.pillarTitle}
                  </span>
                  <h3 className="mt-2 text-lg font-bold text-text-primary">{p.name}</h3>
                  {typeof p.beneficiaries === "number" && (
                    <p className="mt-2 text-sm text-text-secondary">
                      {p.beneficiaries.toLocaleString()}+ reached
                    </p>
                  )}
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-accent-hover">
                    Support this programme
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="mx-auto max-w-md text-center text-text-secondary">
            Programme pages are loaded from our CMS. If none appear, please{" "}
            <Link href="/contact" className="font-semibold text-accent-hover hover:underline">
              contact us
            </Link>{" "}
            and we will point you to the right fund.
          </p>
        )}
      </SectionWrapper>

      {/* ===== CAMPAIGNS ===== */}
      <SectionWrapper background="cream" id="campaigns">
        <SectionHeader
          overline="Campaign support"
          title="Time-bound appeals"
          description="Focused campaigns with a clear goal and deadline."
        />
        {campaigns.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {campaigns.map((c, i) => {
              const goal = pesewasToGhs(c.goalAmount);
              const raised = pesewasToGhs(c.raisedAmount);
              const pct = goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0;
              return (
                <motion.div
                  key={c.slug}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ delay: i * 0.08, duration: 0.45 }}
                  className="rounded-2xl border border-border bg-surface p-6"
                >
                  <h3 className="text-xl font-bold text-text-primary">{c.name}</h3>
                  {c.description && (
                    <p className="mt-2 text-sm leading-relaxed text-text-secondary">{c.description}</p>
                  )}
                  <div className="mt-5">
                    <div className="flex items-baseline justify-between text-sm">
                      <span className="font-semibold text-text-primary">
                        GH₵{raised.toLocaleString()}
                      </span>
                      <span className="text-text-muted">of GH₵{goal.toLocaleString()}</span>
                    </div>
                    <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-bg-tertiary">
                      <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="mt-1.5 text-xs text-text-muted">{pct}% funded</p>
                  </div>
                  <Link
                    href={`/give/${c.slug}`}
                    className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-cta px-5 py-2.5 text-sm font-semibold text-on-cta transition-all hover:bg-cta-hover hover:scale-[1.02]"
                  >
                    Support this campaign
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="mx-auto max-w-lg rounded-2xl border border-dashed border-border bg-surface p-8 text-center">
            <Megaphone className="mx-auto h-8 w-8 text-accent-text" />
            <h3 className="mt-3 text-lg font-bold text-text-primary">
              Campaigns are being prepared for publication
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">
              Two appeals are close to our hearts right now: the FTF Village build
              and our 10th anniversary. You can already support both.
            </p>
            <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/give/ftf-village-project"
                className="inline-flex items-center justify-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-text-on-primary transition-all hover:scale-[1.02]"
              >
                Support FTF Village
              </Link>
              <Link
                href="/impact/ftf-at-10"
                className="inline-flex items-center justify-center gap-1.5 rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-text-primary transition-all hover:border-accent/50"
              >
                FTF at 10
              </Link>
            </div>
          </div>
        )}
      </SectionWrapper>

      {/* ===== CTA ===== */}
      <section className="relative overflow-hidden bg-primary py-20 text-text-on-primary">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(212,168,67,0.12),transparent_55%)]" />
        <div className="relative z-10 mx-auto max-w-3xl px-6 text-center lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold md:text-4xl">
              It takes all of us.
            </h2>
            <p className="mt-4 text-lg text-text-on-primary/70">
              Not ready to give yet? Volunteer your skills or partner with us -
              every route helps a child move from disadvantage to opportunity.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/give/where-most-needed"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-cta px-8 py-3.5 text-sm font-semibold text-on-cta shadow-lg shadow-accent/20 transition-all hover:bg-cta-hover hover:scale-[1.02]"
              >
                <HeartHandshake className="h-4 w-4" />
                Give now
              </Link>
              <Link
                href="/get-involved"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-8 py-3.5 text-sm font-semibold text-white transition-all hover:bg-white/10"
              >
                Get involved
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
