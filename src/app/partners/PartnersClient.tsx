"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Handshake,
  Building2,
  Globe,
  Users,
  Heart,
  Check,
  Star,
  Award,
} from "lucide-react";
import SectionWrapper, { SectionHeader } from "@/components/ui/SectionWrapper";

interface Partner {
  name: string;
  logo: string;
  type: string;
  tier: string;
}

const partnershipTypes = [
  {
    title: "Corporate Sponsor",
    description: "Fund specific programs or become a flagship partner for maximum visibility and impact.",
    benefits: [
      "Brand visibility across all FTF channels",
      "Impact reports and metrics",
      "Employee volunteer opportunities",
      "CSR alignment and reporting",
    ],
    icon: Award,
    color: "gold",
  },
  {
    title: "Program Partner",
    description: "Co-create and deliver programs together, combining expertise for greater reach.",
    benefits: [
      "Joint program development",
      "Shared resources and expertise",
      "Co-branded communications",
      "Measurable impact data",
    ],
    icon: Handshake,
    color: "emerald",
  },
  {
    title: "In-Kind Partner",
    description: "Contribute goods, services, or technology that supports our programs and operations.",
    benefits: [
      "Product or service donation",
      "Tax deduction benefits",
      "Recognition in annual reports",
      "Media and PR exposure",
    ],
    icon: Heart,
    color: "coral",
  },
];

export default function PartnersClient({ initialPartners = [] }: { initialPartners?: Partner[] }) {
  const partners = initialPartners;

  // Group partners by type
  const grouped: Record<string, Partner[]> = {};
  for (const p of partners) {
    const t = p.type || "Other";
    if (!grouped[t]) grouped[t] = [];
    grouped[t].push(p);
  }

  const typeConfig: Record<string, { title: string; icon: typeof Building2; description: string }> = {
    Corporate: { title: "Corporate Partners", icon: Building2, description: "Leading businesses supporting our mission through CSR programs and sponsorships." },
    NGO: { title: "Institutional Partners", icon: Globe, description: "Organizations and institutions aligned with our vision for children's empowerment." },
    Government: { title: "Government Partners", icon: Users, description: "Government agencies collaborating with us for systemic change." },
    Individual: { title: "Community Partners", icon: Heart, description: "Individual supporters and community groups working alongside us on the ground." },
  };

  return (
    <>
      {/* ===== HERO ===== */}
      <section className="relative min-h-[50vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/page-heroes/partners-hero.png"
            alt="Our Partners"
            fill
            className="object-cover"
            priority
            unoptimized
          />
          <div className="absolute inset-0 bg-primary/75" />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/50 to-primary/70" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 py-32 lg:px-8 w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <span className="inline-block text-xs font-semibold uppercase tracking-[0.3em] text-accent mb-4">
              Our Partners
            </span>
            <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold leading-[1.1] text-text-on-primary sm:text-5xl md:text-6xl">
              Together, We Go Further
            </h1>
            <p className="mt-6 max-w-xl text-lg text-text-on-primary/70 leading-relaxed">
              Our partners are essential to our mission. Together, we create
              opportunities and transform the lives of underprivileged children
              across three countries.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ===== PARTNER CATEGORIES ===== */}
      <SectionWrapper background="white">
        <SectionHeader
          overline="Who We Work With"
          title="Our Partner Ecosystem"
          description="We collaborate with diverse organizations to maximize our impact."
        />
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {Object.entries(grouped).map(([type, members], i) => {
            const config = typeConfig[type] || { title: type, icon: Building2, description: "Partners supporting our mission." };
            return (
              <motion.div
                key={type}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="rounded-2xl border border-border bg-surface p-8"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-accent-subtle text-accent">
                  <config.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-text-primary mb-2">
                  {config.title}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed mb-6">
                  {config.description}
                </p>
                <div className="space-y-3">
                  {members.map((partner) => (
                    <div
                      key={partner.name}
                      className="flex items-center gap-3 rounded-lg bg-bg-tertiary/50 px-4 py-3"
                    >
                      {partner.logo ? (
                        <Image
                          src={partner.logo}
                          alt={partner.name}
                          width={32}
                          height={32}
                          className="h-8 w-8 object-contain"
                          unoptimized
                        />
                      ) : (
                        <div className="h-2 w-2 rounded-full bg-accent" />
                      )}
                      <span className="text-sm font-medium text-text-secondary">
                        {partner.name}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </SectionWrapper>

      {/* ===== BECOME A PARTNER ===== */}
      <SectionWrapper background="warm">
        <SectionHeader
          overline="Partner With Us"
          title="Partnership Opportunities"
          description="Choose the partnership model that aligns with your organization's goals and values."
        />
        <div className="grid gap-8 md:grid-cols-3">
          {partnershipTypes.map((type, i) => (
            <motion.div
              key={type.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className={`group rounded-2xl border-2 p-8 transition-all hover:shadow-xl hover:-translate-y-1 ${
                type.color === "gold"
                  ? "border-accent hover:border-accent bg-surface"
                  : type.color === "emerald"
                  ? "border-success/20 hover:border-success bg-surface"
                  : "border-coral-200 hover:border-coral-400 bg-surface"
              }`}
            >
              <div
                className={`mb-5 flex h-14 w-14 items-center justify-center rounded-xl ${
                  type.color === "gold"
                    ? "bg-accent-subtle text-accent"
                    : type.color === "emerald"
                    ? "bg-success-bg text-success-text"
                    : "bg-coral-50 text-coral-500"
                }`}
              >
                <type.icon className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-3">
                {type.title}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed mb-6">
                {type.description}
              </p>
              <ul className="space-y-3">
                {type.benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-2">
                    <Check className="h-4 w-4 mt-0.5 text-success shrink-0" />
                    <span className="text-sm text-text-secondary">{benefit}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      {/* ===== CTA ===== */}
      <section className="relative overflow-hidden bg-gradient-to-r from-primary via-primary to-primary py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(212,168,67,0.1),transparent_50%)]" />
        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Handshake className="h-12 w-12 text-accent mx-auto mb-4" />
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold text-text-on-primary md:text-4xl">
              Let&apos;s Create Impact Together
            </h2>
            <p className="mt-4 text-lg text-text-on-primary/60 max-w-2xl mx-auto">
              Whether you&apos;re a corporation, foundation, or community
              organization - we&apos;d love to explore how we can work together.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-accent to-accent-hover px-8 py-4 text-base font-semibold text-text-primary shadow-2xl shadow-accent/20 transition-all hover:scale-[1.02]"
              >
                Become a Partner
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/donate"
                className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/20 px-8 py-4 text-base font-semibold text-text-on-primary transition-all hover:bg-surface/10"
              >
                <Heart className="h-5 w-5" />
                Make a Donation
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
