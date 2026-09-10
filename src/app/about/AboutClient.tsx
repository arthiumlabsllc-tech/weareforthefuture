"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Heart,
  ArrowRight,
  Target,
  Eye,
  Compass,
  Globe,
  MapPin,
  Calendar,
  Users,
  Award,
  BookOpen,
  HandHeart,
} from "lucide-react";
import SectionWrapper, { SectionHeader } from "@/components/ui/SectionWrapper";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import { siteConfig } from "@/data/site";
import { timeline, sdgGoals } from "@/data/content";

export default function AboutPageClient() {
  return (
    <>
      {/* ===== HERO ===== */}
      <section className="relative min-h-[60vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/page-heroes/about-hero.png"
            alt="Our Story"
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
              Our Story
            </span>
            <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold leading-[1.1] text-white sm:text-5xl md:text-6xl">
              From a Small Act of Kindness to a Global Movement
            </h1>
            <p className="mt-6 max-w-xl text-lg text-white/70 leading-relaxed">
              What began in a small Ghanaian community in 2016 has become a
              powerful, youth-led movement transforming the lives of
              underprivileged children across Ghana, Nigeria, and the United States.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <SectionWrapper background="white">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <AnimatedCounter end={siteConfig.stats.beneficiaries} suffix="+" label="Lives Impacted" />
          <AnimatedCounter end={siteConfig.stats.volunteers} suffix="+" label="Volunteers" />
          <AnimatedCounter end={siteConfig.stats.initiatives} suffix="+" label="Initiatives" />
          <AnimatedCounter end={siteConfig.stats.countries} label="Countries" />
        </div>
      </SectionWrapper>

      {/* ===== TIMELINE ===== */}
      <SectionWrapper background="gradient">
        <SectionHeader
          overline="Our Journey"
          title="A Decade of Impact"
          description="From our first outreach in Jamestown to becoming a 501(c)(3) organization - every step has been driven by purpose."
        />
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-4 top-0 bottom-0 w-px bg-navy-200 md:left-1/2 md:-translate-x-px" />

          <div className="space-y-12">
            {timeline.map((event, i) => (
              <motion.div
                key={event.year}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className={`relative flex flex-col md:flex-row ${
                  i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                } items-start md:items-center gap-8`}
              >
                {/* Dot */}
                <div className="absolute left-4 md:left-1/2 -translate-x-1/2 z-10">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold-400 shadow-lg shadow-gold-400/30">
                    <div className="h-3 w-3 rounded-full bg-white" />
                  </div>
                </div>

                {/* Content */}
                <div className={`ml-16 md:ml-0 md:w-1/2 ${i % 2 === 0 ? "md:pr-16 md:text-right" : "md:pl-16"}`}>
                  <span className="inline-flex items-center gap-2 rounded-full bg-gold-50 px-4 py-1.5 text-sm font-bold text-gold-700 mb-3">
                    <Calendar className="h-3.5 w-3.5" />
                    {event.year}
                  </span>
                  <h3 className="text-xl font-bold text-navy-900 mb-2">
                    {event.title}
                  </h3>
                  <p className="text-navy-600 leading-relaxed mb-4">
                    {event.description}
                  </p>
                  <div className={`flex flex-wrap gap-2 ${i % 2 === 0 ? "md:justify-end" : ""}`}>
                    {event.highlights.map((h) => (
                      <span
                        key={h}
                        className="inline-flex items-center rounded-full bg-navy-50 px-3 py-1 text-xs font-medium text-navy-600"
                      >
                        {h}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Spacer for other side */}
                <div className="hidden md:block md:w-1/2" />
              </motion.div>
            ))}
          </div>
        </div>
      </SectionWrapper>

      {/* ===== VISION / MISSION / VALUES ===== */}
      <SectionWrapper background="white">
        <div className="grid gap-8 md:grid-cols-3">
          {[
            {
              icon: Eye,
              title: "Our Vision",
              description:
                "A world where every child, regardless of their background, has the opportunity to grow in dignity, receive support, and build a meaningful future - free from extreme poverty, inequality, and lack of opportunity.",
              color: "gold",
            },
            {
              icon: Target,
              title: "Our Mission",
              description:
                "To empower underprivileged children by providing access to holistic education, healthcare, mentorship, and sustainable opportunities, ensuring they have the chance to live a decent childhood and build a brighter future.",
              color: "emerald",
            },
            {
              icon: Compass,
              title: "Our Values",
              description:
                "Empowerment, compassion, inclusion, and volunteerism guide everything we do. We believe in nurturing ethical leaders who will create lasting change in their communities and beyond.",
              color: "coral",
            },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className="rounded-2xl border border-navy-100 p-8 transition-all hover:shadow-xl hover:shadow-navy-900/5"
            >
              <div
                className={`mb-5 inline-flex h-14 w-14 items-center justify-center rounded-xl ${
                  item.color === "gold"
                    ? "bg-gold-50 text-gold-600"
                    : item.color === "emerald"
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-coral-50 text-coral-500"
                }`}
              >
                <item.icon className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-navy-900 mb-3">{item.title}</h3>
              <p className="text-navy-600 leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      {/* ===== SDG GOALS ===== */}
      <SectionWrapper background="warm">
        <SectionHeader
          overline="Global Goals"
          title="Our Commitment to a Sustainable Future"
          description="We work towards achieving these Sustainable Development Goals, addressing the major development challenges in Ghana and beyond."
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {sdgGoals.map((goal, i) => (
            <motion.div
              key={goal.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="group rounded-2xl bg-white border border-navy-100 p-6 text-center transition-all hover:shadow-lg hover:-translate-y-1"
            >
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-navy-900 to-navy-700 text-white font-bold text-xl transition-transform group-hover:scale-110">
                SDG {goal.number}
              </div>
              <h3 className="font-bold text-navy-900 mb-2">{goal.title}</h3>
              <p className="text-xs text-navy-500 leading-relaxed">
                {goal.description}
              </p>
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      {/* ===== FELLOWSHIP PROGRAMME ===== */}
      <SectionWrapper background="white">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
              Volunteer Program
            </span>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold text-navy-900 md:text-4xl leading-tight">
              FTF Fellowship Programme
            </h2>
            <p className="mt-6 text-lg text-navy-600 leading-relaxed">
              A transformative 6–10 week volunteer opportunity for passionate
              university students in Ghana. Blending training, mentorship, and
              hands-on community service, this initiative equips participants
              with real-world skills in leadership, project management, and civic
              engagement.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Leadership & project management training",
                "Hands-on community service experience",
                "Mentorship from nonprofit professionals",
                "Network of youth changemakers",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  </div>
                  <span className="text-navy-600">{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex gap-4">
              <Link
                href="/volunteer"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-gold-400 to-gold-500 px-6 py-3 text-sm font-semibold text-navy-900 shadow-lg shadow-gold-400/20 transition-all hover:scale-[1.02]"
              >
                Join Now
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: BookOpen, label: "Training", color: "bg-gold-50 text-gold-600" },
                { icon: Users, label: "Mentorship", color: "bg-emerald-50 text-emerald-600" },
                { icon: HandHeart, label: "Service", color: "bg-coral-50 text-coral-500" },
                { icon: Award, label: "Leadership", color: "bg-navy-50 text-navy-600" },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
                  className={`rounded-2xl border border-navy-100 p-8 text-center ${item.color.split(" ")[0]}`}
                >
                  <item.icon className={`h-10 w-10 mx-auto mb-3 ${item.color.split(" ")[1]}`} />
                  <p className="font-bold text-navy-900">{item.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </SectionWrapper>

      {/* ===== START A CHAPTER ===== */}
      <section className="relative overflow-hidden bg-gradient-to-r from-navy-900 via-navy-800 to-navy-900 py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(212,168,67,0.1),transparent_50%)]" />
        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold text-white md:text-4xl">
              Start a Chapter in Your Country
            </h2>
            <p className="mt-4 text-lg text-white/60 max-w-2xl mx-auto">
              Our mission is spreading fast - from streets to classrooms, from
              neighborhoods to nations. Join our global community of young
              changemakers.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              {["Ghana", "Nigeria", "United States"].map((country) => (
                <div
                  key={country}
                  className="flex items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 text-sm font-medium text-white border border-white/10"
                >
                  <MapPin className="h-4 w-4 text-gold-400" />
                  {country}
                </div>
              ))}
            </div>
            <div className="mt-8">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-gold-400 to-gold-500 px-8 py-4 text-base font-semibold text-navy-900 shadow-2xl shadow-gold-400/20 transition-all hover:scale-[1.02]"
              >
                Start a Chapter
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
