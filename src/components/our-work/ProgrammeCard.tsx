"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ProgrammeArtwork from "@/components/ui/ProgrammeArtwork";
import { cardClasses, cardPadding } from "@/lib/ui/cardClasses";
import type { PillarProgramme } from "@/lib/pillars";

/**
 * Programme card shared by the /our-work overview and the pillar-detail pages.
 * Data is DB-backed (ProgrammeDetailData/PillarProgramme via src/lib/pillars.ts);
 * the "Learn more" target is the real /our-work/{pillar}/{programme} template.
 */
export default function ProgrammeCard({
  programme,
  pillarId,
}: {
  programme: PillarProgramme;
  pillarId: string;
}) {
  // Prefer the ref for the pillar this grid is grouped under, else the primary.
  const ref =
    programme.pillars.find((p) => p.id === pillarId) ??
    programme.pillars.find((p) => p.isPrimary) ??
    programme.pillars[0];
  return (
    <Link
      href={`/our-work/${pillarId}/${encodeURIComponent(programme.slug)}`}
      className={`${cardClasses} group flex h-full flex-col overflow-hidden`}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-bg-tertiary to-border">
        <ProgrammeArtwork image={programme.image} title={programme.name} />
        {ref && (
          <span className="absolute left-4 top-4 rounded-full bg-surface/90 px-3 py-1 text-[11px] font-semibold text-text-secondary backdrop-blur-sm">
            Pillar {ref.number} · {ref.title}
          </span>
        )}
      </div>
      <div className={`flex flex-1 flex-col ${cardPadding.compact}`}>
        <h3 className="text-lg font-bold text-text-primary transition-colors group-hover:text-accent-text">
          {programme.name}
        </h3>
        {programme.shortDescription && (
          <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-text-secondary">
            {programme.shortDescription}
          </p>
        )}
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-accent-text transition-all group-hover:gap-2">
          Learn more <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}
