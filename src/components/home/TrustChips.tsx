"use client";

import { motion } from "framer-motion";
import { BadgeCheck, CalendarClock, FileText, Globe2, HeartHandshake } from "lucide-react";
import { siteConfig } from "@/data/site";

/**
 * Homepage trust strip. A single calm row of credibility signals — no marketing
 * superlatives. Registration identifiers come from `siteConfig.legal` and render
 * as "[pending]" until FTF supplies the real values (see TODO in site.ts).
 */
export default function TrustChips() {
  const { stats, legal, countries } = siteConfig;

  const chips = [
    {
      icon: CalendarClock,
      label: `${stats.yearsOfFoundation} years of continuous impact`,
    },
    {
      icon: BadgeCheck,
      label: legal.status,
    },
    {
      icon: FileText,
      // TODO(legal): shows "[pending]" until siteConfig.legal is populated.
      label: `US EIN: ${legal.us501c3Ein ?? "[pending]"}`,
    },
    {
      icon: Globe2,
      label: `Programmes in ${countries.join(" & ")}`,
    },
    {
      icon: HeartHandshake,
      label: "Youth-led, community-rooted",
    },
  ];

  return (
    <div className="border-y border-trust-border bg-trust-bg">
      <div className="mx-auto max-w-7xl px-6 py-6 lg:px-8">
        <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {chips.map((chip, i) => (
            <motion.li
              key={chip.label}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="flex items-center gap-2 text-sm text-trust-text"
            >
              <chip.icon className="h-4 w-4 shrink-0 text-trust-icon" aria-hidden="true" />
              <span className="font-medium">{chip.label}</span>
            </motion.li>
          ))}
        </ul>
      </div>
    </div>
  );
}
