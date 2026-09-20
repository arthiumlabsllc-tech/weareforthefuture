"use client";

import ValueCard from "@/components/ui/ValueCard";
import { coreValues } from "@/data/site";

/**
 * Canonical layout for FTF's seven core values.
 *
 * Seven items do not divide cleanly into a 4-column grid (the second row leaves
 * a lone gap), so this uses a centred flex-wrap: full width on mobile, halves on
 * small screens, and quarters on large screens with the final row of three
 * centred rather than left-aligned. Each card keeps its brand-semantic colour
 * (accent / primary / charcoal) resolved by ValueCard's colorMap.
 *
 * Staged for the About page "Vision, Mission & Values" section (later phase);
 * the Phase 2 homepage rebuild intentionally does not render the values strip.
 */
export default function ValuesGrid() {
  return (
    <div className="flex flex-wrap justify-center gap-6">
      {coreValues.map((value, i) => (
        <div
          key={value.title}
          className="w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(25%-1.125rem)]"
        >
          <ValueCard
            title={value.title}
            description={value.description}
            iconName={value.icon}
            color={value.color}
            index={i}
          />
        </div>
      ))}
    </div>
  );
}
