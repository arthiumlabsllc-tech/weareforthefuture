"use client";

import { motion } from "framer-motion";
import type { DecadeMilestone } from "@/data/milestones";

/**
 * Reusable decade timeline — horizontal rail on desktop, vertical rail on
 * mobile/tablet. Extracted from /about/our-story (Phase 4) so /impact/ftf-at-10
 * renders the same component instead of duplicating the markup. Renders only
 * the rails; callers supply the surrounding SectionWrapper / SectionHeader.
 */
export default function Timeline({ milestones }: { milestones: DecadeMilestone[] }) {
  return (
    <>
      {/* Horizontal rail — desktop */}
      <div className="hidden lg:block">
        <div className="relative overflow-x-auto pb-4">
          <div className="absolute left-0 right-0 top-[7px] h-px bg-border-strong" />
          <div className="flex min-w-max gap-6">
            {milestones.map((m, i) => (
              <motion.div
                key={`${m.year}-${m.title}`}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="relative w-[220px] shrink-0 pt-8"
              >
                <span className="absolute left-0 top-0 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-accent ring-4 ring-surface" />
                <span className="font-[family-name:var(--font-display)] text-lg font-bold text-accent-text">
                  {m.year}
                </span>
                <h3 className="mt-1 text-base font-semibold text-text-primary">{m.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">{m.blurb}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Vertical rail — mobile / tablet */}
      <div className="relative lg:hidden">
        <div className="absolute left-[7px] top-0 bottom-0 w-px bg-border-strong" />
        <div className="space-y-8">
          {milestones.map((m, i) => (
            <motion.div
              key={`${m.year}-${m.title}`}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: i * 0.04 }}
              className="relative pl-8"
            >
              <span className="absolute left-0 top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-accent ring-4 ring-surface" />
              <span className="font-[family-name:var(--font-display)] text-lg font-bold text-accent-text">
                {m.year}
              </span>
              <h3 className="mt-0.5 text-base font-semibold text-text-primary">{m.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">{m.blurb}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </>
  );
}
