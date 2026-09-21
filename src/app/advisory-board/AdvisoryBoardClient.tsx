"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, MapPin, Compass, Users } from "lucide-react";
import SectionWrapper, { SectionHeader } from "@/components/ui/SectionWrapper";
import { img } from "@/lib/imageUrl";

interface AdvisoryMember {
  name: string;
  role: string;
  image: string;
  country: string;
}

export default function AdvisoryBoardClient({ initialMembers = [] }: { initialMembers?: AdvisoryMember[] }) {
  const advisoryBoard = initialMembers;
  const advisoryCountries = ["All", ...Array.from(new Set(advisoryBoard.map((m) => m.country).filter(Boolean)))];
  const [activeCountry, setActiveCountry] = useState("All");

  const filtered =
    activeCountry === "All"
      ? advisoryBoard
      : advisoryBoard.filter((m) => m.country === activeCountry);

  const ghanaAdvisory = advisoryBoard.filter((m) => m.country === "Ghana");
  const usAdvisory = advisoryBoard.filter(
    (m) => m.country === "United States"
  );

  return (
    <>
      {/* ===== HERO ===== */}
      <section className="relative min-h-[50vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={img("/images/page-heroes/board-hero.png")}
            alt="Advisory Board"
            fill
            className="object-cover"
            priority
            unoptimized
          />
          <div className="absolute inset-0 bg-primary/75" />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/50 to-primary/70" />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-6 py-24 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-1.5 text-xs font-semibold text-accent-text uppercase tracking-wider mb-6">
              <Compass className="h-3.5 w-3.5" />
              Guidance & Leadership
            </span>
            <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold text-text-on-primary sm:text-5xl lg:text-6xl">
              Advisory Board
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-text-on-primary/70">
              Expert guidance, leadership, and unwavering support to help drive
              our mission forward and create lasting impact for vulnerable
              children.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ===== STATS BAR ===== */}
      <div className="bg-bg-secondary border-y border-white/5">
        <div className="mx-auto max-w-7xl px-6 py-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { label: "Advisory Members", value: advisoryBoard.length },
              { label: "Countries", value: "2" },
              { label: "Ghana Board", value: ghanaAdvisory.length },
              { label: "U.S. Board", value: usAdvisory.length },
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

      {/* ===== MEMBERS ===== */}
      <SectionWrapper background="warm">
        <SectionHeader
          overline="Our Advisors"
          title="Meet the Advisory Board"
          description="Their experience and passion ensure that every step we take creates lasting impact."
        />

        {/* Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {advisoryCountries.map((country) => (
            <button
              key={country}
              onClick={() => setActiveCountry(country)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
                activeCountry === country
                  ? "bg-primary text-text-on-primary shadow-lg"
                  : "bg-surface text-text-secondary hover:bg-bg-tertiary shadow"
              }`}
            >
              {country === "United States" ? "United States" : country}
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
            Interested in advising?
          </h2>
          <p className="mt-4 text-lg text-text-on-primary/60">
            We welcome experienced professionals who share our passion for
            empowering vulnerable children.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-cta px-8 py-3.5 text-sm font-semibold text-on-cta shadow-lg transition-all hover:bg-cta-hover hover:shadow-xl hover:scale-[1.02]"
            >
              Get in Touch
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/volunteer"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-8 py-3.5 text-sm font-semibold text-text-on-primary transition-all hover:bg-surface/10"
            >
              Volunteer With Us
            </Link>
          </div>
        </div>
      </SectionWrapper>
    </>
  );
}
