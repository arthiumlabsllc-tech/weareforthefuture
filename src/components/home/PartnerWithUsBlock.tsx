"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Building2, Landmark, Package, Users } from "lucide-react";
import { partnerLogos } from "@/data/site";

/**
 * "Partner With Us" — reframes the old partner marquee as an invitation with
 * concrete routes in, backed by the real partner tiers in `partnerLogos`.
 */
const routes = [
  {
    icon: Building2,
    title: "Corporate sponsorship",
    description: "Fund a programme, a cohort or a campaign — with transparent reporting on reach and outcomes.",
  },
  {
    icon: Landmark,
    title: "Institutional partners",
    description: "Co-deliver with agencies, foundations and public bodies on education, dignity and skills.",
  },
  {
    icon: Package,
    title: "In-kind & goods",
    description: "Donate learning materials, hygiene products, equipment or professional services.",
  },
  {
    icon: Users,
    title: "Schools & community allies",
    description: "Host programmes, refer children, or volunteer your team's skills and time.",
  },
];

export default function PartnerWithUsBlock() {
  return (
    <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
      {/* Copy + routes */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
      >
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-text">
          Partner With Us
        </span>
        <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold leading-tight text-text-primary md:text-4xl">
          Lasting change is built together
        </h2>
        <p className="mt-4 max-w-xl text-lg leading-relaxed text-text-secondary">
          We work alongside corporates, institutions, schools and community
          allies across Ghana and Nigeria. Whatever your capacity, there is a
          clear, accountable way to partner with FTF.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {routes.map((route) => (
            <div
              key={route.title}
              className="rounded-xl border border-border bg-surface p-5 transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary-subtle text-primary">
                <route.icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="text-sm font-bold text-text-primary">{route.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-text-tertiary">{route.description}</p>
            </div>
          ))}
        </div>

        <Link
          href="/partners"
          className="mt-8 inline-flex items-center gap-2 rounded-full border-2 border-border px-7 py-3.5 text-sm font-semibold text-text-secondary transition-all hover:border-primary hover:bg-bg-tertiary"
        >
          Become a Partner
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </motion.div>

      {/* Logo wall */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="rounded-3xl border border-border bg-bg-primary p-6 sm:p-8"
      >
        <p className="mb-6 text-center text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">
          Partners & allies
        </p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {partnerLogos.map((partner) => (
            <div
              key={partner.name}
              className="flex h-20 items-center justify-center rounded-xl border border-border bg-surface px-3"
              title={`${partner.name} — ${partner.tier} partner`}
            >
              <Image
                src={partner.image}
                alt={partner.name}
                width={120}
                height={48}
                className="max-h-10 w-auto object-contain opacity-70 grayscale transition-all hover:opacity-100 hover:grayscale-0"
                unoptimized
                onError={(e) => {
                  // Hide the whole tile if the logo asset 404s.
                  const tile = e.currentTarget.parentElement;
                  if (tile) tile.style.display = "none";
                }}
              />
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
