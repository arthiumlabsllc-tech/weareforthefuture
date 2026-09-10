"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Users, MapPin, Heart, User } from "lucide-react";
import SectionWrapper, { SectionHeader } from "@/components/ui/SectionWrapper";
import { teamMembers } from "@/data/team";

const tabs = [
  { key: "leadership", label: "Leadership", icon: Users },
  { key: "ghana", label: "Ghana", icon: MapPin },
  { key: "nigeria", label: "Nigeria", icon: MapPin },
  { key: "us", label: "United States", icon: MapPin },
];

export default function TeamClient() {
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
            src="/images/page-heroes/team-hero.png"
            alt="Our Team"
            fill
            className="object-cover"
            priority
            unoptimized
          />
          <div className="absolute inset-0 bg-navy-900/75" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-900/90 via-navy-900/50 to-navy-900/70" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 py-32 lg:px-8 w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <span className="inline-block text-xs font-semibold uppercase tracking-[0.3em] text-gold-400 mb-4">
              Our People
            </span>
            <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold leading-[1.1] text-white sm:text-5xl md:text-6xl">
              The Passionate People Behind the Mission
            </h1>
            <p className="mt-6 max-w-xl text-lg text-white/70 leading-relaxed">
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
              <div className="relative mx-auto mb-6 h-48 w-48 overflow-hidden rounded-2xl bg-gradient-to-br from-navy-100 to-navy-200 transition-transform group-hover:scale-[1.02]">
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
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/80">
                      <User className="h-10 w-10 text-navy-400" />
                    </div>
                  </div>
                )}
                {i === 0 && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gold-400/90 to-transparent p-3">
                    <span className="text-xs font-semibold text-navy-900">Founder</span>
                  </div>
                )}
              </div>
              <h3 className="text-xl font-bold text-navy-900">{member.name}</h3>
              <p className="text-sm font-medium text-gold-600 mb-2">{member.role}</p>
              <p className="text-sm text-navy-500 flex items-center justify-center gap-1">
                <MapPin className="h-3 w-3" />
                {member.country}
              </p>
              {member.bio && (
                <p className="mt-3 text-sm text-navy-600 leading-relaxed">
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
                  ? "bg-navy-900 text-white shadow-lg shadow-navy-900/20"
                  : "bg-white text-navy-600 border border-navy-200 hover:border-navy-400"
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
              className="group rounded-xl border border-navy-100 bg-white p-5 transition-all hover:shadow-lg hover:border-gold-200 hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-navy-50 text-navy-400 transition-colors group-hover:bg-gold-50 group-hover:text-gold-600">
                  <User className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-navy-900 truncate">
                    {member.name}
                  </h3>
                  <p className="text-xs text-navy-500 truncate">{member.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </SectionWrapper>

      {/* ===== JOIN THE TEAM ===== */}
      <section className="relative overflow-hidden bg-gradient-to-r from-navy-900 via-navy-800 to-navy-900 py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(212,168,67,0.1),transparent_50%)]" />
        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Heart className="h-12 w-12 text-gold-400 mx-auto mb-4" />
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold text-white md:text-4xl">
              Join Our Team
            </h2>
            <p className="mt-4 text-lg text-white/60 max-w-2xl mx-auto">
              We&apos;re always looking for passionate individuals who want to
              make a difference. Whether you&apos;re in Ghana, Nigeria, or the
              US - there&apos;s a place for you at FTF.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row justify-center">
              <Link
                href="/volunteer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-gold-400 to-gold-500 px-8 py-4 text-base font-semibold text-navy-900 shadow-2xl shadow-gold-400/20 transition-all hover:scale-[1.02]"
              >
                Apply to Volunteer
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/20 px-8 py-4 text-base font-semibold text-white transition-all hover:bg-white/10"
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
