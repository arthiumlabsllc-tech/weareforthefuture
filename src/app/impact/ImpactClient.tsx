"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Users,
  MapPin,
  Calendar,
  BookOpen,
  Heart,
  HandHeart,
  GraduationCap,
  Droplets,
  TreePine,
  Download,
  FileText,
  PieChart,
  BarChart3,
  Target,
  ArrowRight,
} from "lucide-react";
import SectionWrapper, { SectionHeader } from "@/components/ui/SectionWrapper";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import { siteConfig } from "@/data/site";

const impactMetrics = [
  {
    icon: Users,
    value: "100,000+",
    label: "Children Reached",
    description: "Underprivileged children supported through our programs since 2016.",
    color: "gold",
  },
  {
    icon: BookOpen,
    value: "5,000+",
    label: "Students Sponsored",
    description: "Children enrolled in school with full tuition, books, and mentorship.",
    color: "emerald",
  },
  {
    icon: Heart,
    value: "50,000+",
    label: "Health Kits Distributed",
    description: "Hygiene and menstrual health products provided to girls and families.",
    color: "coral",
  },
  {
    icon: MapPin,
    value: "30+",
    label: "Communities Served",
    description: "Underserved communities across Ghana, Nigeria, and the United States.",
    color: "navy",
  },
];

const impactByYear = [
  { year: "2016", children: 50, volunteers: 10, initiatives: 2 },
  { year: "2017", children: 200, volunteers: 50, initiatives: 4 },
  { year: "2018", children: 800, volunteers: 150, initiatives: 6 },
  { year: "2019", children: 2000, volunteers: 400, initiatives: 8 },
  { year: "2020", children: 5000, volunteers: 800, initiatives: 10 },
  { year: "2021", children: 15000, volunteers: 1200, initiatives: 12 },
  { year: "2022", children: 30000, volunteers: 1800, initiatives: 14 },
  { year: "2023", children: 50000, volunteers: 2200, initiatives: 16 },
  { year: "2024", children: 75000, volunteers: 2800, initiatives: 18 },
  { year: "2025", children: 100000, volunteers: 3000, initiatives: 20 },
];

const fundAllocation = [
  { category: "Education Programs", percentage: 40, color: "bg-gold-400" },
  { category: "Healthcare & Hygiene", percentage: 20, color: "bg-emerald-500" },
  { category: "Community Development", percentage: 15, color: "bg-coral-500" },
  { category: "FTF Village Project", percentage: 15, color: "bg-navy-600" },
  { category: "Operations & Admin", percentage: 10, color: "bg-navy-300" },
];

const successStories = [
  {
    name: "Ama, Age 14",
    location: "Jamestown, Ghana",
    story:
      "Through the S.T.E.P program, Ama received full school sponsorship and mentorship. She is now top of her class and dreams of becoming a doctor.",
    program: "S.T.E.P",
  },
  {
    name: "Chidi, Age 16",
    location: "Lagos, Nigeria",
    story:
      "Chidi participated in Project Momentum's leadership workshop. He went on to start a peer tutoring group at his school, helping 30+ students improve their grades.",
    program: "Project Momentum",
  },
  {
    name: "Abena, Age 12",
    location: "Takoradi, Ghana",
    story:
      "The Empower Her, Period program gave Abena access to sanitary products and confidence. She hasn't missed a day of school since.",
    program: "Empower Her, Period",
  },
];

export default function ImpactClient() {
  const maxChildren = Math.max(...impactByYear.map((d) => d.children));

  return (
    <>
      {/* ===== HERO ===== */}
      <section className="relative min-h-[50vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/page-heroes/impact-hero.jpg"
            alt="Our Impact"
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
              Transparency & Impact
            </span>
            <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold leading-[1.1] text-white sm:text-5xl md:text-6xl">
              Measurable Change, Real Lives Transformed
            </h1>
            <p className="mt-6 max-w-xl text-lg text-white/70 leading-relaxed">
              We believe in full transparency. Here&apos;s how your support
              creates real, measurable impact for underprivileged children.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ===== KEY METRICS ===== */}
      <SectionWrapper background="white">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {impactMetrics.map((metric, i) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="rounded-2xl border border-navy-100 bg-white p-8 transition-all hover:shadow-xl hover:shadow-navy-900/5"
            >
              <div
                className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${
                  metric.color === "gold"
                    ? "bg-gold-50 text-gold-600"
                    : metric.color === "emerald"
                    ? "bg-emerald-50 text-emerald-600"
                    : metric.color === "coral"
                    ? "bg-coral-50 text-coral-500"
                    : "bg-navy-50 text-navy-600"
                }`}
              >
                <metric.icon className="h-6 w-6" />
              </div>
              <div className="text-3xl font-bold text-navy-900 mb-1">
                {metric.value}
              </div>
              <div className="text-sm font-semibold text-navy-700 mb-2">
                {metric.label}
              </div>
              <p className="text-sm text-navy-500 leading-relaxed">
                {metric.description}
              </p>
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      {/* ===== GROWTH CHART ===== */}
      <SectionWrapper background="warm">
        <SectionHeader
          overline="Our Growth"
          title="A Decade of Expanding Impact"
          description="Watch how our reach has grown from 50 children in 2016 to over 100,000 today."
        />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl border border-navy-100 bg-white p-8 md:p-12"
        >
          <div className="flex items-end gap-2 h-64 md:h-80">
            {impactByYear.map((data, i) => (
              <div key={data.year} className="flex-1 flex flex-col items-center gap-2">
                <motion.div
                  initial={{ height: 0 }}
                  whileInView={{
                    height: `${(data.children / maxChildren) * 100}%`,
                  }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: i * 0.05 }}
                  className="w-full rounded-t-lg bg-gradient-to-t from-gold-500 to-gold-300 min-h-[4px] relative group cursor-pointer"
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-navy-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    {data.children.toLocaleString()}
                  </div>
                </motion.div>
                <span className="text-[10px] md:text-xs text-navy-500 font-medium">
                  {data.year.slice(2)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-6 flex items-center gap-6 text-sm text-navy-500">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-sm bg-gradient-to-t from-gold-500 to-gold-300" />
              Children Reached
            </div>
          </div>
        </motion.div>
      </SectionWrapper>

      {/* ===== FUND ALLOCATION ===== */}
      <SectionWrapper background="white">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
              Financial Transparency
            </span>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold text-navy-900 md:text-4xl leading-tight">
              Where Your Donations Go
            </h2>
            <p className="mt-4 text-navy-600 leading-relaxed">
              We are committed to ensuring that every dollar makes maximum
              impact. Here&apos;s how funds are allocated across our programs.
            </p>

            <div className="mt-8 space-y-4">
              {fundAllocation.map((item, i) => (
                <motion.div
                  key={item.category}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-navy-700">
                      {item.category}
                    </span>
                    <span className="text-sm font-bold text-navy-900">
                      {item.percentage}%
                    </span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-navy-100">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${item.percentage}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.3 + i * 0.1 }}
                      className={`h-full rounded-full ${item.color}`}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center justify-center"
          >
            {/* Donut chart visual */}
            <div className="relative h-72 w-72 md:h-80 md:w-80">
              <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90">
                {fundAllocation.reduce(
                  (acc, item, i) => {
                    const circumference = 2 * Math.PI * 70;
                    const strokeLength = (item.percentage / 100) * circumference;
                    const strokeOffset = acc.offset;
                    const colors = [
                      "#D4A843",
                      "#10B981",
                      "#F97316",
                      "#263c63",
                      "#8da2c9",
                    ];
                    acc.elements.push(
                      <circle
                        key={item.category}
                        cx="100"
                        cy="100"
                        r="70"
                        fill="none"
                        stroke={colors[i]}
                        strokeWidth="30"
                        strokeDasharray={`${strokeLength} ${circumference - strokeLength}`}
                        strokeDashoffset={-strokeOffset}
                        className="transition-all duration-1000"
                      />
                    );
                    acc.offset += strokeLength;
                    return acc;
                  },
                  { elements: [] as React.ReactNode[], offset: 0 }
                ).elements}
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl font-bold text-navy-900">90%</div>
                  <div className="text-sm text-navy-500">Goes to Programs</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </SectionWrapper>

      {/* ===== SUCCESS STORIES ===== */}
      <SectionWrapper background="warm">
        <SectionHeader
          overline="Real Stories"
          title="Lives We've Touched"
          description="Behind every number is a real child with real dreams. These are some of their stories."
        />
        <div className="grid gap-8 md:grid-cols-3">
          {successStories.map((story, i) => (
            <motion.div
              key={story.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className="rounded-2xl bg-white border border-navy-100 p-8 transition-all hover:shadow-xl hover:shadow-navy-900/5"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gold-50 text-gold-600">
                <Heart className="h-6 w-6" />
              </div>
              <p className="text-navy-600 leading-relaxed mb-6 italic">
                &ldquo;{story.story}&rdquo;
              </p>
              <div className="border-t border-navy-100 pt-4">
                <div className="font-semibold text-navy-900">{story.name}</div>
                <div className="text-sm text-navy-500">{story.location}</div>
                <div className="mt-2 inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                  {story.program}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      {/* ===== ANNUAL REPORTS ===== */}
      <SectionWrapper background="white">
        <SectionHeader
          overline="Reports"
          title="Annual Reports & Documents"
          description="Download our annual reports to see detailed breakdowns of our activities, finances, and impact."
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[2024, 2023, 2022].map((year, i) => (
            <motion.div
              key={year}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="group flex items-center gap-4 rounded-2xl border border-navy-100 bg-white p-6 transition-all hover:shadow-lg hover:border-gold-200"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-navy-50 text-navy-600 transition-colors group-hover:bg-gold-50 group-hover:text-gold-600">
                <FileText className="h-7 w-7" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-navy-900">
                  Annual Report {year}
                </h3>
                <p className="text-sm text-navy-500">PDF Document</p>
              </div>
              <Download className="h-5 w-5 text-navy-400 transition-colors group-hover:text-gold-600" />
            </motion.div>
          ))}
        </div>
      </SectionWrapper>
    </>
  );
}
