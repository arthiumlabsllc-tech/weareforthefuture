"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { img } from "@/lib/imageUrl";
import { Heart, Download, FileText } from "lucide-react";
import SectionWrapper, { SectionHeader } from "@/components/ui/SectionWrapper";
import {
  impactMetrics,
  impactByYear,
  fundAllocation,
  successStories,
} from "@/data/impact";

export interface ReportDocument {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string;
  year: number | null;
  category: string;
}

export default function ImpactClient({ reports = [] }: { reports?: ReportDocument[] }) {
  const maxChildren = Math.max(...impactByYear.map((d) => d.children));

  return (
    <>
      {/* ===== HERO ===== */}
      <section className="relative min-h-[50vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={img("/images/page-heroes/impact-hero.jpg")}
            alt="Our Impact"
            fill
            className="object-cover"
            priority
            unoptimized
          />
          <div className="absolute inset-0 bg-primary/70" />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/40 to-primary/70" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 py-32 lg:px-8 w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <span className="inline-block text-xs font-semibold uppercase tracking-[0.3em] text-accent-text mb-4">
              Transparency & Impact
            </span>
            <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold leading-[1.1] text-text-on-primary sm:text-5xl md:text-6xl">
              Measurable Change, Real Lives Transformed
            </h1>
            <p className="mt-6 max-w-xl text-lg text-text-on-primary/70 leading-relaxed">
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
              className="rounded-2xl border border-border bg-surface p-8 transition-all hover:shadow-xl hover:shadow-primary/5"
            >
              <div
                className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${
                  metric.color === "gold"
                    ? "bg-accent-subtle text-accent-text"
                    : metric.color === "emerald"
                    ? "bg-success-bg text-success-text"
                    : metric.color === "coral"
                    ? "bg-coral-50 text-coral-500"
                    : "bg-bg-tertiary text-text-secondary"
                }`}
              >
                <metric.icon className="h-6 w-6" />
              </div>
              <div className="text-3xl font-bold text-text-primary mb-1">
                {metric.value}
              </div>
              <div className="text-sm font-semibold text-text-secondary mb-2">
                {metric.label}
              </div>
              <p className="text-sm text-text-tertiary leading-relaxed">
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
          className="rounded-2xl border border-border bg-surface p-8 md:p-12"
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
                  className="w-full rounded-t-lg bg-gradient-to-t from-accent to-accent-hover min-h-[4px] relative group cursor-pointer"
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-primary text-text-on-primary text-xs px-2 py-1 rounded whitespace-nowrap">
                    {data.children.toLocaleString()}
                  </div>
                </motion.div>
                <span className="text-[10px] md:text-xs text-text-tertiary font-medium">
                  {data.year.slice(2)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-6 flex items-center gap-6 text-sm text-text-tertiary">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-sm bg-gradient-to-t from-accent to-accent-hover" />
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
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-text">
              Financial Transparency
            </span>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold text-text-primary md:text-4xl leading-tight">
              Where Your Donations Go
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
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
                    <span className="text-sm font-medium text-text-secondary">
                      {item.category}
                    </span>
                    <span className="text-sm font-bold text-text-primary">
                      {item.percentage}%
                    </span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-bg-tertiary">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${item.percentage}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.3 + i * 0.1 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: item.hex }}
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
                  (acc, item) => {
                    const circumference = 2 * Math.PI * 70;
                    const strokeLength = (item.percentage / 100) * circumference;
                    const strokeOffset = acc.offset;
                    acc.elements.push(
                      <circle
                        key={item.category}
                        cx="100"
                        cy="100"
                        r="70"
                        fill="none"
                        stroke={item.hex}
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
                  <div className="text-3xl font-bold text-text-primary">90%</div>
                  <div className="text-sm text-text-tertiary">Goes to Programs</div>
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
              className="rounded-2xl bg-surface border border-border p-8 transition-all hover:shadow-xl hover:shadow-primary/5"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent-subtle text-accent-text">
                <Heart className="h-6 w-6" />
              </div>
              <p className="text-text-secondary leading-relaxed mb-6 italic">
                &ldquo;{story.story}&rdquo;
              </p>
              <div className="border-t border-border pt-4">
                <div className="font-semibold text-text-primary">{story.name}</div>
                <div className="text-sm text-text-tertiary">{story.location}</div>
                <div className="mt-2 inline-flex items-center rounded-full bg-success-bg px-3 py-1 text-xs font-medium text-success-text">
                  {story.program}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      {/* ===== ANNUAL REPORTS ===== */}
      {reports.length > 0 && (
        <SectionWrapper background="white">
          <SectionHeader
            overline="Reports"
            title="Annual Reports & Documents"
            description="Download our annual reports to see detailed breakdowns of our activities, finances, and impact."
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {reports.map((report, i) => (
              <motion.a
                key={report.id}
                href={`/api/documents/${report.id}/download`}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="group flex items-center gap-4 rounded-2xl border border-border bg-surface p-6 transition-all hover:shadow-lg hover:border-accent"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-bg-tertiary text-text-secondary transition-colors group-hover:bg-accent-subtle group-hover:text-accent-text">
                  <FileText className="h-7 w-7" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-text-primary">
                    {report.title}
                  </h3>
                  <p className="text-sm text-text-tertiary">
                    {report.category}
                    {report.year ? ` · ${report.year}` : ""}
                  </p>
                </div>
                <Download className="h-5 w-5 text-text-muted transition-colors group-hover:text-accent-text" />
              </motion.a>
            ))}
          </div>
        </SectionWrapper>
      )}
    </>
  );
}
