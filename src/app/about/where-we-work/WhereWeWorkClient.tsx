"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Building2, Globe, MapPin } from "lucide-react";
import SectionWrapper, { SectionHeader } from "@/components/ui/SectionWrapper";
import { siteConfig } from "@/data/site";

/* Programme delivery happens in exactly two countries. The United States is our
   501(c)(3) vehicle (partnerships + giving) and is deliberately NOT presented as
   a delivery country - see the brief's positioning rules. */
const GHANA_CORE = "Greater Accra";

export default function WhereWeWorkClient() {
  const ghanaRegions = siteConfig.regions.ghana;
  const nigeriaRegions = siteConfig.regions.nigeria;

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
            <Globe className="h-4 w-4" aria-hidden="true" /> Where We Work
          </span>
          <h1 className="mt-5 font-[family-name:var(--font-display)] text-4xl font-bold leading-[1.1] text-text-on-primary sm:text-5xl">
            Programme delivery in two countries
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-text-on-primary/70">
            We work where children already are - in the schools and communities of
            Ghana and Nigeria. Our presence is deep rather than wide, so every
            programme stays close to the people it serves.
          </p>
        </motion.div>
      </SectionWrapper>

      {/* ===== TWO COLUMNS ===== */}
      <SectionWrapper background="white">
        <div className="grid gap-8 md:grid-cols-2">
          {/* Ghana */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border border-border bg-surface p-8"
          >
            <div className="flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-accent-subtle text-accent-text">
                <MapPin className="h-6 w-6" aria-hidden="true" />
              </span>
              <div>
                <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-text-primary">
                  Ghana
                </h2>
                <p className="text-sm text-text-muted">Founding country · programme hub</p>
              </div>
            </div>
            <p className="mt-5 leading-relaxed text-text-secondary">
              Our work began here in 2016. {GHANA_CORE} remains the core of
              operations, with programmes reaching six further regions and more
              than 500 volunteers nationwide.
            </p>
            <div className="mt-6">
              <div className="text-xs font-semibold uppercase tracking-[0.15em] text-text-muted">
                {ghanaRegions.length} regions
              </div>
              <ul className="mt-3 flex flex-wrap gap-2">
                {ghanaRegions.map((region) => (
                  <li
                    key={region}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium ${
                      region === GHANA_CORE
                        ? "bg-accent-subtle text-accent-text"
                        : "bg-bg-tertiary text-text-secondary"
                    }`}
                  >
                    <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                    {region}
                    {region === GHANA_CORE && (
                      <span className="ml-1 text-[10px] font-bold uppercase tracking-wide">core</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Nigeria */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.12 }}
            className="rounded-2xl border border-border bg-surface p-8"
          >
            <div className="flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary-subtle text-primary">
                <MapPin className="h-6 w-6" aria-hidden="true" />
              </span>
              <div>
                <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-text-primary">
                  Nigeria
                </h2>
                <p className="text-sm text-text-muted">Operations began 2025</p>
              </div>
            </div>
            <p className="mt-5 leading-relaxed text-text-secondary">
              In 2025 we extended the model to Nigeria, starting in Ibadan. The
              focus is the same: community-embedded programmes that meet children
              where they are and grow with local partners.
            </p>
            <div className="mt-6">
              <div className="text-xs font-semibold uppercase tracking-[0.15em] text-text-muted">
                Current base
              </div>
              <ul className="mt-3 flex flex-wrap gap-2">
                {nigeriaRegions.map((region) => (
                  <li
                    key={region}
                    className="inline-flex items-center gap-1.5 rounded-full bg-primary-subtle px-3.5 py-1.5 text-sm font-medium text-primary"
                  >
                    <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                    {region}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>

        {/* US vehicle note - never conflated with delivery */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-8 flex items-start gap-4 rounded-2xl border border-border-strong/50 bg-bg-secondary p-6"
        >
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-bg-tertiary text-text-secondary">
            <Building2 className="h-6 w-6" aria-hidden="true" />
          </span>
          <div>
            <h3 className="font-semibold text-text-primary">United States - 501(c)(3) vehicle</h3>
            <p className="mt-1 text-sm leading-relaxed text-text-secondary">
              Our US entity exists to steward partnerships, governance and
              tax-deductible giving. It is a supporting vehicle, not a
              programme-delivery country: all direct programme work happens in
              Ghana and Nigeria.
            </p>
          </div>
        </motion.div>
      </SectionWrapper>

      {/* ===== REACH AT A GLANCE ===== */}
      <SectionWrapper background="gradient">
        <SectionHeader
          overline="Our reach"
          title="Deep roots, growing reach"
          description="A focused footprint lets us know the children and communities we serve by name."
        />
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            { value: "2", label: "Delivery countries", sub: "Ghana & Nigeria" },
            { value: String(ghanaRegions.length), label: "Ghana regions", sub: `${GHANA_CORE} core` },
            { value: "500+", label: "Volunteers", sub: "Youth-led delivery" },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              className="rounded-2xl border border-border bg-surface p-8 text-center"
            >
              <div className="font-[family-name:var(--font-display)] text-4xl font-bold text-accent-text">
                {s.value}
              </div>
              <div className="mt-2 font-semibold text-text-primary">{s.label}</div>
              <div className="mt-1 text-sm text-text-muted">{s.sub}</div>
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      {/* ===== CTA ===== */}
      <SectionWrapper background="warm">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold text-text-primary md:text-4xl">
            See the work in these communities
          </h2>
          <p className="mt-4 text-lg text-text-secondary">
            Explore the five programme pillars, or find out how to volunteer and
            partner where we work.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/our-work"
              className="inline-flex items-center gap-2 rounded-full bg-cta px-7 py-3.5 text-sm font-semibold text-on-cta shadow-lg shadow-accent/20 transition-all hover:bg-cta-hover hover:scale-[1.02]"
            >
              See our work <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/get-involved"
              className="inline-flex items-center gap-2 rounded-full border border-border-strong bg-surface px-7 py-3.5 text-sm font-semibold text-text-primary transition-all hover:border-accent hover:text-accent-text"
            >
              Get involved
            </Link>
            <Link
              href="/nigeria"
              className="inline-flex items-center gap-2 rounded-full border border-border-strong bg-surface px-7 py-3.5 text-sm font-semibold text-text-primary transition-all hover:border-accent hover:text-accent-text"
            >
              See FTF Nigeria <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </SectionWrapper>
    </>
  );
}
