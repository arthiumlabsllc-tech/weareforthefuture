"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Heart } from "lucide-react";
import { siteConfig } from "@/data/site";
import { cardClasses, cardPadding } from "@/lib/ui/cardClasses";

/**
 * A live donation appeal surfaced on the homepage. Populated server-side from
 * the CMS `DonationCampaign` model and already filtered to published, non-
 * deleted, in-window campaigns (auto-expire) - see src/app/page.tsx.
 */
export interface Priority {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  goalAmount: number; // pesewas
  raisedAmount: number; // pesewas
  endDate: string | null; // ISO, serialised across the server/client boundary
}

const currency = siteConfig.donation.villageCurrency;
const toUnits = (pesewas: number) => Math.round(pesewas / 100);

function stripRichText(html: string | null): string {
  if (!html) return "";
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export default function CurrentPriorities({ priorities }: { priorities: Priority[] }) {
  // No live appeal: fall back to a single evergreen, time-bound card so the
  // "Current Priorities" slot always has substance (brief Section 6.8) instead
  // of rendering an empty or generic section. Mirrors the campaign-card visual
  // language so it reads as intentional, not broken.
  if (priorities.length === 0) {
    const goal = siteConfig.donation.villageGoal;
    const raised = siteConfig.donation.villageRaised;
    const pct = goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0;
    return (
      <motion.article
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5 }}
        className="mx-auto flex w-full max-w-md flex-col rounded-2xl border border-border bg-surface p-6"
      >
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-bold leading-snug text-text-primary">
            Support FTF Village Phase One
          </h3>
          <span className="shrink-0 rounded-full bg-status-campaign/10 px-2.5 py-1 text-[11px] font-semibold text-status-campaign">
            Ongoing appeal
          </span>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-text-secondary">
          Help fund the first phase of For The Future Village - a place of
          safety, learning and belonging for vulnerable children and young
          people in Ghana.
        </p>
        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-semibold text-text-primary">
              {currency}{raised.toLocaleString()} <span className="font-normal text-text-tertiary">raised</span>
            </span>
            <span className="text-text-tertiary">{pct}%</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-journey-track">
            <motion.div
              className="h-full rounded-full bg-journey-fill"
              initial={{ width: 0 }}
              whileInView={{ width: `${pct}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
          <p className="mt-2 text-xs text-text-muted">Goal: {currency}{goal.toLocaleString()}</p>
        </div>
        <Link
          href="/donate"
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-contrast transition-all hover:bg-primary-hover"
        >
          <Heart className="h-4 w-4" aria-hidden="true" />
          Give Now
        </Link>
      </motion.article>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {priorities.map((priority, i) => {
        const goal = toUnits(priority.goalAmount);
        const raised = toUnits(priority.raisedAmount);
        const pct = goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0;
        const summary = stripRichText(priority.description);

        return (
          <motion.article
            key={priority.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className={`${cardClasses} flex flex-col ${cardPadding.compact}`}
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-lg font-bold leading-snug text-text-primary">{priority.name}</h3>
              {priority.endDate && (
                <span className="shrink-0 rounded-full bg-status-campaign/10 px-2.5 py-1 text-[11px] font-semibold text-status-campaign">
                  Closes {new Date(priority.endDate).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                </span>
              )}
            </div>

            {summary && (
              <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-text-secondary">{summary}</p>
            )}

            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-semibold text-text-primary">
                  {currency}{raised.toLocaleString()} <span className="font-normal text-text-tertiary">raised</span>
                </span>
                <span className="text-text-tertiary">{pct}%</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-journey-track">
                <motion.div
                  className="h-full rounded-full bg-journey-fill"
                  initial={{ width: 0 }}
                  whileInView={{ width: `${pct}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
              <p className="mt-2 text-xs text-text-muted">Goal: {currency}{goal.toLocaleString()}</p>
            </div>

            <Link
              href="/donate"
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-contrast transition-all hover:bg-primary-hover"
            >
              Give Now
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </motion.article>
        );
      })}
    </div>
  );
}
