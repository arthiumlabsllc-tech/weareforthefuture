"use client";

import { motion } from "framer-motion";
import { journeyStages } from "@/data/pillars";

/**
 * "How FTF changes a future" - the theory of change made visual.
 *
 * Seven stages from `journeyStages`, rendered as a horizontal icon-row with a
 * connecting green progress line on desktop and a vertical stepper on mobile
 * (decision 4A). The fill is a scroll reveal (not a numeric count-up, which the
 * brief bans): it draws once as the section enters the viewport.
 */
export default function JourneyStepper() {
  const total = journeyStages.length;
  // Inset the connecting line so it starts/ends at the first/last node centres.
  const inset = `${100 / (total * 2)}%`;

  return (
    <div>
      {/* ===== Desktop: horizontal icon-row ===== */}
      <div className="relative hidden lg:block">
        <div
          className="absolute top-6 h-1 rounded-full bg-journey-track"
          style={{ left: inset, right: inset }}
          aria-hidden="true"
        />
        <motion.div
          className="absolute top-6 h-1 rounded-full bg-journey-fill"
          style={{ left: inset, right: inset, transformOrigin: "left" }}
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          aria-hidden="true"
        />
        <ol className="relative grid gap-2" style={{ gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))` }}>
          {journeyStages.map((stage, i) => (
            <li key={stage.id} className="flex flex-col items-center text-center">
              <span className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 border-journey-node bg-surface font-[family-name:var(--font-display)] text-lg font-bold text-journey-node shadow-sm">
                {i + 1}
              </span>
              <span className="mt-3 text-sm font-semibold leading-snug text-text-primary">
                {stage.label}
              </span>
              <span className="mt-1 text-xs leading-relaxed text-text-tertiary">
                {stage.description}
              </span>
            </li>
          ))}
        </ol>
      </div>

      {/* ===== Mobile: vertical stepper ===== */}
      <ol className="relative space-y-6 pl-12 lg:hidden">
        <div
          className="absolute bottom-3 left-[17px] top-3 w-0.5 rounded-full bg-journey-track"
          aria-hidden="true"
        />
        <motion.div
          className="absolute bottom-3 left-[17px] top-3 w-0.5 rounded-full bg-journey-fill"
          style={{ transformOrigin: "top" }}
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          aria-hidden="true"
        />
        {journeyStages.map((stage, i) => (
          <li key={stage.id} className="relative">
            <span className="absolute -left-12 top-0 flex h-9 w-9 items-center justify-center rounded-full border-2 border-journey-node bg-surface font-[family-name:var(--font-display)] text-base font-bold text-journey-node">
              {i + 1}
            </span>
            <h3 className="text-sm font-semibold leading-snug text-text-primary">{stage.label}</h3>
            <p className="mt-1 text-xs leading-relaxed text-text-tertiary">{stage.description}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
