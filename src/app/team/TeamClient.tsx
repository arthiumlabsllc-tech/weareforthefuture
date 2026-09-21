"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Users, MapPin, Heart, User } from "lucide-react";
import SectionWrapper, { SectionHeader } from "@/components/ui/SectionWrapper";
import { img } from "@/lib/imageUrl";

interface Member {
  name: string;
  role: string;
  country: string;
  category: "leadership" | "ghana" | "nigeria" | "us";
  bio?: string;
  image?: string;
}

const tabs = [
  { key: "leadership", label: "Leadership", icon: Users },
  { key: "ghana", label: "Ghana", icon: MapPin },
  { key: "nigeria", label: "Nigeria", icon: MapPin },
  { key: "us", label: "United States", icon: MapPin },
];

export default function TeamClient({ initialMembers = [] }: { initialMembers?: Member[] }) {
  const teamMembers = initialMembers;
  const [activeTab, setActiveTab] = useState("leadership");

  const filteredMembers = teamMembers.filter(
    (m) => m.category === activeTab
  );

  const leadership = teamMembers.filter((m) => m.category === "leadership");

  return (
    <>
      {/* ===== HERO ===== */}
      <section className="relative min-h-[50vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={img("/images/page-heroes/team-hero.png")}
            alt="Our Team"
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
            <span className="inline-block text-xs font-semibold uppercase tracking-[0.3em] text-accent-text mb-4">
              Our People
            </span>
            <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold leading-[1.1] text-text-on-primary sm:text-5xl md:text-6xl">
              The Passionate People Behind the Mission
            </h1>
            <p className="mt-6 max-w-xl text-lg text-text-on-primary/70 leading-relaxed">
              Meet the dedicated team of young changemakers driving FTF&apos;s
              mission across Ghana, Nigeria, and the United States.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ===== LEADERSHIP ===== */}
      <SectionWrapper background="white">
        <SectionHeader
          overline="Leadership"
          title="Meet Our Leaders"
          description="The visionary leaders guiding For The Future Organization's mission and growth."
        />
        <div className="grid gap-8 md:grid-cols-3">
          {leadership.map((member, i) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className="group text-center"
            >
              <div className="relative mx-auto mb-6 h-48 w-48 overflow-hidden rounded-2xl bg-gradient-to-br from-bg-tertiary to-border transition-transform group-hover:scale-[1.02]">
                {member.image ? (
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-surface/80">
                      <User className="h-10 w-10 text-text-muted" />
                    </div>
                  </div>
                )}
                {i === 0 && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-accent/90 to-transparent p-3">
                    <span className="text-xs font-semibold text-text-primary">Founder</span>
                  </div>
                )}
              </div>
              <h3 className="text-xl font-bold text-text-primary">{member.name}</h3>
              <p className="text-sm font-medium text-accent-text mb-2">{member.role}</p>
              <p className="text-sm text-text-tertiary flex items-center justify-center gap-1">
                <MapPin className="h-3 w-3" />
                {member.country}
              </p>
              {member.bio && (
                <p className="mt-3 text-sm text-text-secondary leading-relaxed">
                  {member.bio}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      {/* ===== COUNTRY TEAMS ===== */}
      <SectionWrapper background="warm">
        <SectionHeader
          overline="Country Teams"
          title="Our Global Team"
          description="Passionate individuals making a difference in their communities."
        />

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? "bg-primary text-text-on-primary shadow-lg shadow-primary/5"
                  : "bg-surface text-text-secondary border border-border-strong hover:border-border"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Members Grid */}
        <motion.div
          layout
          className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
        >
          {filteredMembers.map((member, i) => (
            <motion.div
              key={member.name}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03, duration: 0.3 }}
              className="group rounded-xl border border-border bg-surface p-5 transition-all hover:shadow-lg hover:border-accent hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-bg-tertiary text-text-muted transition-colors group-hover:bg-accent-subtle group-hover:text-accent-text">
                  <User className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-text-primary truncate">
                    {member.name}
                  </h3>
                  <p className="text-xs text-text-tertiary truncate">{member.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </SectionWrapper>

      {/* ===== JOIN THE TEAM ===== */}
      <section className="relative overflow-hidden bg-gradient-to-r from-primary via-primary to-primary py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(212,168,67,0.1),transparent_50%)]" />
        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Heart className="h-12 w-12 text-accent-text mx-auto mb-4" />
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold text-text-on-primary md:text-4xl">
              Join Our Team
            </h2>
            <p className="mt-4 text-lg text-text-on-primary/60 max-w-2xl mx-auto">
              We&apos;re always looking for passionate individuals who want to
              make a difference. Whether you&apos;re in Ghana, Nigeria, or the
              US - there&apos;s a place for you at FTF.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row justify-center">
              <Link
                href="/volunteer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-cta px-8 py-4 text-base font-semibold text-on-cta shadow-2xl shadow-accent/20 transition-all hover:bg-cta-hover hover:scale-[1.02]"
              >
                Apply to Volunteer
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/20 px-8 py-4 text-base font-semibold text-text-on-primary transition-all hover:bg-surface/10"
              >
                Get in Touch
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
