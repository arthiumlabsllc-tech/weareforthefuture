"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Clock,
  Download,
  FileText,
  Landmark,
  ScrollText,
  ShieldCheck,
} from "lucide-react";
import SectionWrapper, { SectionHeader } from "@/components/ui/SectionWrapper";
import StatDisplay from "@/components/ui/StatDisplay";
import { fundAllocation } from "@/data/impact";
import { siteConfig } from "@/data/site";
import type { ReportDocument } from "@/lib/documents";

/**
 * /impact/reports — Reports & Transparency (Phase 4).
 *
 * Annual reports are queried from the Document model (category = "Annual
 * Report") in the server page and passed in; the accessor fails soft to [], so
 * this client renders an intentional empty state rather than a broken grid.
 * Registration, auditor and policy files are honest placeholders until legal /
 * finance provide the real documents — nothing here invents a file or a figure.
 * All numbers are static (no count-up).
 */

function formatFileSize(bytes: number | null): string {
  if (bytes == null || bytes <= 0) return "";
  if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(1)} MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${bytes} B`;
}

export default function ReportsClient({
  annualReports = [],
}: {
  annualReports?: ReportDocument[];
}) {
  const { yearsOfFoundation, beneficiaries, programmes, countries, lastUpdated } =
    siteConfig.stats;
  const { legal } = siteConfig;
  const hasReports = annualReports.length > 0;

  return (
    <>
      {/* ===== HERO ===== */}
      <SectionWrapper background="navy" className="!py-24 md:!py-28">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-accent-bright">
            <ScrollText className="h-4 w-4" aria-hidden="true" /> Transparency
          </span>
          <h1 className="mt-5 font-[family-name:var(--font-display)] text-4xl font-bold leading-[1.1] text-text-on-primary sm:text-5xl">
            Reports &amp; Transparency
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-text-on-primary/70">
            We measure, report and learn. This is where our annual reports, fund
            allocation, registration and audit information and institutional
            policies are published as they are finalised.
          </p>
        </motion.div>
      </SectionWrapper>

      {/* ===== AT A GLANCE (static — no count-up) ===== */}
      <SectionWrapper background="white">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <StatDisplay value={`${yearsOfFoundation}`} label="Years of continuous impact" />
          <StatDisplay
            value={beneficiaries.toLocaleString()}
            suffix="+"
            label="Children and young people reached"
          />
          <StatDisplay value={`${programmes}`} label="Programme pillars" />
          <StatDisplay value={`${countries}`} label="Countries of delivery" />
        </div>
        <p className="mt-10 text-center text-sm text-text-muted">
          Last updated: {lastUpdated}
        </p>
      </SectionWrapper>

      {/* ===== ANNUAL REPORTS ===== */}
      <SectionWrapper background="warm">
        <SectionHeader
          overline="Annual reports"
          title="Published reports"
          description="Each fiscal year is documented in an annual report covering programme reach, financial stewardship and lessons learned."
        />

        {hasReports ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {annualReports.map((doc, i) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.5 }}
                className="flex h-full flex-col rounded-2xl border border-border bg-surface p-6"
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-bg-tertiary text-accent-text">
                    <FileText className="h-5 w-5" aria-hidden="true" />
                  </span>
                  {doc.year && (
                    <span className="font-[family-name:var(--font-display)] text-2xl font-bold text-text-primary tabular-nums">
                      {doc.year}
                    </span>
                  )}
                </div>
                <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-text-primary">
                  {doc.title}
                </h3>
                {doc.description && (
                  <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                    {doc.description}
                  </p>
                )}
                <a
                  href={`/api/documents/${doc.id}/download`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto pt-5 inline-flex items-center gap-2 text-sm font-semibold text-accent-text hover:underline"
                >
                  <Download className="h-4 w-4" aria-hidden="true" />
                  Download
                  {formatFileSize(doc.fileSize) && (
                    <span className="font-normal text-text-tertiary">
                      · {formatFileSize(doc.fileSize)}
                    </span>
                  )}
                </a>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-2xl rounded-2xl border border-dashed border-border-strong bg-surface p-10 text-center"
          >
            <span className="mx-auto mb-5 inline-flex h-14 w-14 items-center justify-center rounded-full bg-bg-tertiary text-text-secondary">
              <Clock className="h-7 w-7" aria-hidden="true" />
            </span>
            <h3 className="font-[family-name:var(--font-display)] text-xl font-bold text-text-primary">
              Annual reports are being prepared for publication
            </h3>
            <p className="mt-3 text-text-secondary leading-relaxed">
              For The Future Organization is committed to publishing an annual
              report for every fiscal year. Our reporting cycle is being
              formalised as we complete our first audits under the US
              501(c)(3) vehicle — each report will appear here as it is
              finalised.
            </p>
            <p className="mt-4 text-sm text-text-tertiary">
              Need a specific report in the meantime?{" "}
              <Link href="/contact" className="font-semibold text-accent-text hover:underline">
                Contact our team
              </Link>
              .
            </p>
          </motion.div>
        )}
      </SectionWrapper>

      {/* ===== FINANCIAL SUMMARY ===== */}
      <SectionWrapper background="white">
        <SectionHeader
          overline="Financial summary"
          title="How funds are allocated"
          description="Spending is prioritised across the five programme pillars, with a small reserved share for operations and governance."
        />

        <div className="mx-auto grid max-w-4xl gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-start">
          <div className="space-y-4">
            {fundAllocation.map((item, i) => (
              <motion.div
                key={item.category}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
              >
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-sm font-medium text-text-secondary">{item.category}</span>
                  <span className="text-sm font-bold text-text-primary tabular-nums">
                    {item.percentage}%
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-bg-tertiary">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${item.percentage}%`, backgroundColor: item.hex }}
                  />
                </div>
              </motion.div>
            ))}
          </div>

          <div className="rounded-2xl border border-border bg-bg-primary p-7">
            <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-text-primary">
              Notes on these figures
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-text-secondary">
              <li className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                Percentages reflect current programme-spending priorities and are reviewed each cycle.
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                Audited financial statements will be published alongside each annual report.
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                {siteConfig.donation.allocationNote}
              </li>
            </ul>
          </div>
        </div>
      </SectionWrapper>

      {/* ===== REGISTRATION & AUDIT ===== */}
      <SectionWrapper background="gradient">
        <SectionHeader
          overline="Governance"
          title="Registration &amp; audit"
          description="Our legal standing and independent financial oversight, published as documents are provided."
        />

        <div className="grid gap-6 md:grid-cols-2">
          {/* Registration certificate */}
          <div className="rounded-2xl border border-border bg-surface p-7">
            <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-bg-tertiary text-accent-text">
              <Landmark className="h-6 w-6" aria-hidden="true" />
            </span>
            <h3 className="font-[family-name:var(--font-display)] text-xl font-bold text-text-primary">
              Registration certificate
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-text-secondary">
              For The Future Organization operates as {legal.status}.
            </p>
            <dl className="mt-5 space-y-3 border-t border-border pt-5 text-sm">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-text-tertiary">Ghana NGO registration</dt>
                <dd className="font-semibold text-text-primary tabular-nums">
                  {legal.ngoRegistration ?? "[pending]"}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-text-tertiary">US 501(c)(3) EIN</dt>
                <dd className="font-semibold text-text-primary tabular-nums">
                  {legal.us501c3Ein ?? "[pending]"}
                </dd>
              </div>
            </dl>
            <p className="mt-5 text-xs text-text-muted leading-relaxed">
              {legal.taxNote} Scanned certificates will be published here once
              provided by our legal and compliance team.
            </p>
          </div>

          {/* Auditor statement */}
          <div className="rounded-2xl border border-border bg-surface p-7">
            <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-bg-tertiary text-accent-text">
              <ShieldCheck className="h-6 w-6" aria-hidden="true" />
            </span>
            <h3 className="font-[family-name:var(--font-display)] text-xl font-bold text-text-primary">
              Auditor statement
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-text-secondary">
              Independent financial statements are prepared for each fiscal year.
              The auditor&apos;s statement, opinion and management letter will be
              published here once the current audit cycle is complete.
            </p>
            <span className="mt-5 inline-flex items-center gap-2 rounded-full bg-bg-tertiary px-3 py-1 text-xs font-medium text-text-secondary">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" /> Audit in progress
            </span>
            <p className="mt-5 text-xs text-text-muted leading-relaxed">
              Questions about our financial oversight?{" "}
              <Link href="/contact" className="font-semibold text-accent-text hover:underline">
                Contact us
              </Link>
              .
            </p>
          </div>
        </div>
      </SectionWrapper>

      {/* ===== POLICIES ===== */}
      <SectionWrapper background="white">
        <SectionHeader
          overline="Policies"
          title="Institutional policies"
          description="The standards that govern how we work with children, communities and funds."
        />

        <div className="grid gap-6 md:grid-cols-2">
          {/* Safeguarding policy */}
          <div className="flex h-full flex-col rounded-2xl border border-border bg-surface p-7">
            <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-success-bg text-success-text">
              <ShieldCheck className="h-6 w-6" aria-hidden="true" />
            </span>
            <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-text-primary">
              Safeguarding &amp; Child Protection Policy
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">
              Our commitment to keeping every child and young person safe —
              consent, reporting and conduct standards across all programmes.
            </p>
            <div className="mt-auto flex flex-wrap items-center gap-3 pt-5">
              <Link
                href="/about/safeguarding"
                className="inline-flex items-center gap-2 text-sm font-semibold text-accent-text hover:underline"
              >
                Read our safeguarding commitment
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>

          {/* Financial policy */}
          <div className="flex h-full flex-col rounded-2xl border border-border bg-surface p-7">
            <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-bg-tertiary text-accent-text">
              <FileText className="h-6 w-6" aria-hidden="true" />
            </span>
            <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-text-primary">
              Financial Management Policy
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">
              How contributions are received, allocated, recorded and reported —
              including controls, approvals and review cycles.
            </p>
            <div className="mt-auto pt-5">
              <span
                aria-disabled="true"
                className="inline-flex cursor-not-allowed items-center gap-2 rounded-full border border-border-strong bg-bg-tertiary px-5 py-2.5 text-sm font-semibold text-text-muted"
              >
                <Download className="h-4 w-4" aria-hidden="true" /> PDF being finalised
              </span>
            </div>
          </div>
        </div>
      </SectionWrapper>

      {/* ===== CTA ===== */}
      <SectionWrapper background="navy">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold text-text-on-primary md:text-4xl">
            Institutional profile
          </h2>
          <p className="mt-4 text-lg text-text-on-primary/70">
            A single overview of who we are, what we do and how we are governed —
            for partners, funders and institutions.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4">
            <span
              aria-disabled="true"
              className="inline-flex cursor-not-allowed items-center gap-2 rounded-full bg-surface/10 px-7 py-3.5 text-sm font-semibold text-text-on-primary/60 ring-1 ring-inset ring-border-strong"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Download institutional profile (PDF coming soon)
            </span>
            <Link
              href="/impact"
              className="inline-flex items-center gap-2 text-sm font-semibold text-accent-bright hover:underline"
            >
              Back to Our Impact <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </SectionWrapper>
    </>
  );
}
