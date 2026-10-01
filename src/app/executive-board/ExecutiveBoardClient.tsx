"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, MapPin, Shield, Users } from "lucide-react";
import SectionWrapper, { SectionHeader } from "@/components/ui/SectionWrapper";
import PageHero from "@/components/ui/PageHero";

interface BoardMember {
  name: string;
  role: string;
  image: string;
  country: string;
}

export default function ExecutiveBoardClient({ initialMembers = [] }: { initialMembers?: BoardMember[] }) {
  const executiveBoard = initialMembers;
  const executiveCountries = ["All", ...Array.from(new Set(executiveBoard.map((m) => m.country).filter(Boolean)))];
  const [activeCountry, setActiveCountry] = useState("All");

  const filtered =
    activeCountry === "All"
      ? executiveBoard
      : executiveBoard.filter((m) => m.country === activeCountry);

  const ghanaTeam = executiveBoard.filter((m) => m.country === "Ghana");
  const nigeriaTeam = executiveBoard.filter((m) => m.country === "Nigeria");

  return (
    <>
      {/* ===== HERO ===== */}
      <PageHero
        eyebrow="Leadership"
        eyebrowIcon={Shield}
        title="Executive Board"
        description="Passionate young leaders dedicated to empowering vulnerable children through education, healthcare, mentorship, and community projects."
        image="/images/page-heroes/board-hero.png"
        imageAlt="Executive Board"
      />

      {/* ===== STATS BAR ===== */}
      <div className="bg-bg-secondary border-y border-white/5">
        <div className="mx-auto max-w-7xl px-6 py-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { label: "Executive Members", value: executiveBoard.length },
              { label: "Countries", value: "2" },
              { label: "Ghana Team", value: ghanaTeam.length },
              { label: "Nigeria Team", value: nigeriaTeam.length },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold text-accent-text">
                  {stat.value}
                </div>
                <div className="text-xs text-text-on-primary/50 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== COUNTRY FILTER ===== */}
      <SectionWrapper background="warm">
        <SectionHeader
          overline="Our Leadership"
          title="Meet the Executive Board"
          description="The driving force behind FTF's mission to transform the lives of vulnerable children."
        />

        {/* Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {executiveCountries.map((country) => (
            <button
              key={country}
              onClick={() => setActiveCountry(country)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
                activeCountry === country
                  ? "bg-primary text-text-on-primary shadow-lg"
                  : "bg-surface text-text-secondary hover:bg-bg-tertiary shadow"
              }`}
            >
              {country}
            </button>
          ))}
        </div>

        {/* Members Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCountry}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            {filtered.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="group"
              >
                <div className="relative aspect-square overflow-hidden rounded-2xl bg-gradient-to-br from-bg-tertiary to-bg-tertiary mb-4">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="inline-flex items-center gap-1 rounded-full bg-surface/20 backdrop-blur-sm px-2.5 py-1 text-[10px] font-medium text-text-on-primary">
                      <MapPin className="h-2.5 w-2.5" />
                      {member.country}
                    </span>
                  </div>
                </div>
                <h3 className="text-sm font-bold text-text-primary leading-tight">
                  {member.name}
                </h3>
                <p className="text-xs text-text-tertiary mt-0.5">{member.role}</p>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </SectionWrapper>

      {/* ===== CTA ===== */}
      <SectionWrapper background="navy">
        <div className="mx-auto max-w-3xl text-center">
          <Users className="mx-auto h-10 w-10 text-accent-text mb-4" />
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold text-text-on-primary sm:text-4xl">
            Want to join our team?
          </h2>
          <p className="mt-4 text-lg text-text-on-primary/60">
            We're always looking for passionate individuals to join our mission
            of empowering vulnerable children.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/volunteer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-cta px-8 py-3.5 text-sm font-semibold text-on-cta shadow-lg transition-all hover:bg-cta-hover hover:shadow-xl hover:scale-[1.02]"
            >
              Become a Volunteer
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-8 py-3.5 text-sm font-semibold text-text-on-primary transition-all hover:bg-surface/10"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </SectionWrapper>
    </>
  );
}
