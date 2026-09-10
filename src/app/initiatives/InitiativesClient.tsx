"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Heart,
  MapPin,
  Calendar,
  Users,
  Filter,
  HandHeart,
  Check,
} from "lucide-react";
import SectionWrapper, { SectionHeader } from "@/components/ui/SectionWrapper";
import { initiatives, categories } from "@/data/initiatives";

export default function InitiativesClient() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered =
    activeCategory === "All"
      ? initiatives
      : initiatives.filter((i) => i.category === activeCategory);

  return (
    <>
      {/* ===== HERO ===== */}
      <section className="relative min-h-[50vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/page-heroes/initiatives-hero.jpg"
            alt="Our Initiatives"
            fill
            className="object-cover"
            priority
            unoptimized
          />
          <div className="absolute inset-0 bg-navy-900/70" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-900/90 via-navy-900/40 to-navy-900/70" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 py-32 lg:px-8 w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <span className="inline-block text-xs font-semibold uppercase tracking-[0.3em] text-gold-400 mb-4">
              Our Work
            </span>
            <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold leading-[1.1] text-white sm:text-5xl md:text-6xl">
              Initiatives That Create Lasting Change
            </h1>
            <p className="mt-6 max-w-xl text-lg text-white/70 leading-relaxed">
              From education and mentorship to health and digital empowerment -
              discover the programs transforming the lives of underprivileged
              children across Ghana, Nigeria, and beyond.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ===== FILTER + GRID ===== */}
      <SectionWrapper background="warm">
        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-2 mb-12">
          <div className="flex items-center gap-2 mr-2 text-sm font-medium text-navy-500">
            <Filter className="h-4 w-4" />
            Filter:
          </div>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
                activeCategory === cat
                  ? "bg-navy-900 text-white shadow-lg shadow-navy-900/20"
                  : "bg-white text-navy-600 border border-navy-200 hover:border-navy-400 hover:bg-navy-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Initiatives Grid */}
        <motion.div layout className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((initiative, i) => (
              <motion.div
                key={initiative.slug}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                id={initiative.slug}
              >
                <div className="group h-full overflow-hidden rounded-2xl border border-navy-100 bg-white transition-all hover:shadow-xl hover:shadow-navy-900/5 hover:-translate-y-1">
                  {/* Image placeholder */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-navy-100 to-navy-200">
                    <Image
                      src={initiative.image}
                      alt={initiative.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      unoptimized
                    />
                    {/* Status badge */}
                    <div className="absolute top-4 left-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium backdrop-blur-sm ${
                          initiative.status === "active"
                            ? "bg-emerald-500/90 text-white"
                            : initiative.status === "upcoming"
                            ? "bg-gold-400/90 text-navy-900"
                            : "bg-navy-600/90 text-white"
                        }`}
                      >
                        <div
                          className={`h-1.5 w-1.5 rounded-full ${
                            initiative.status === "active" ? "bg-white" : "bg-navy-900"
                          }`}
                        />
                        {initiative.status === "active"
                          ? "Active"
                          : initiative.status === "upcoming"
                          ? "Upcoming"
                          : "Completed"}
                      </span>
                    </div>
                    {/* Category badge */}
                    <div className="absolute top-4 right-4">
                      <span className="inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-navy-700 backdrop-blur-sm">
                        {initiative.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-navy-900 group-hover:text-gold-600 transition-colors mb-2">
                      {initiative.title}
                    </h3>
                    <p className="text-sm text-navy-600 leading-relaxed mb-4">
                      {initiative.shortDescription}
                    </p>

                    {/* Highlights */}
                    <div className="space-y-2 mb-4">
                      {initiative.highlights.slice(0, 3).map((h) => (
                        <div key={h} className="flex items-center gap-2">
                          <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                          <span className="text-xs text-navy-500">{h}</span>
                        </div>
                      ))}
                    </div>

                    {/* Meta */}
                    <div className="flex items-center justify-between pt-4 border-t border-navy-100">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1 text-xs text-navy-400">
                          <MapPin className="h-3 w-3" />
                          {initiative.country}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-navy-400">
                          <Users className="h-3 w-3" />
                          {initiative.beneficiaries}+
                        </span>
                      </div>
                      <span className="flex items-center gap-1 text-xs text-navy-400">
                        <Calendar className="h-3 w-3" />
                        {initiative.year}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </SectionWrapper>

      {/* ===== CTA ===== */}
      <section className="relative overflow-hidden bg-gradient-to-r from-navy-900 via-navy-800 to-navy-900 py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(212,168,67,0.1),transparent_50%)]" />
        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold text-white md:text-4xl">
              Want to Support Our Initiatives?
            </h2>
            <p className="mt-4 text-lg text-white/60 max-w-2xl mx-auto">
              Your donation directly funds these programs, helping us reach more
              children and create lasting impact.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row justify-center">
              <Link
                href="/donate"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-gold-400 to-gold-500 px-8 py-4 text-base font-semibold text-navy-900 shadow-2xl shadow-gold-400/20 transition-all hover:scale-[1.02]"
              >
                <Heart className="h-5 w-5" />
                Donate Now
              </Link>
              <Link
                href="/volunteer"
                className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/20 px-8 py-4 text-base font-semibold text-white transition-all hover:bg-white/10"
              >
                Become a Volunteer
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
