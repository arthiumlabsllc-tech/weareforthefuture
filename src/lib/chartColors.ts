/**
 * Shared chart/decoration colour map (Phase 11.5, Decision 1).
 *
 * Every value is a CSS variable reference into the DESIGN.md token set, so
 * charts, legends and celebratory palettes stay theme-aware in light AND dark
 * mode. Raw hex is banned everywhere in src/ (enforced by
 * scripts/check-design-tokens.mjs); this map is the only place chart code
 * should source colours from.
 */
export const chartColors = {
  accent: "var(--ftf-accent)",
  primary: "var(--ftf-primary)",
  forest: "var(--ftf-accent-hover)",
  charcoal: "var(--ftf-text-secondary)",
  muted: "var(--ftf-text-muted)",
  tertiary: "var(--ftf-text-tertiary)",
  coral: "var(--ftf-pillar-2)",
  amber: "var(--ftf-warning)",
  bright: "var(--ftf-accent-bright)",
  blueDeep: "var(--ftf-primary-hover)",
} as const;

/** Celebration confetti palette (donation success) - brand tokens only. */
export const confettiColors: readonly string[] = [
  chartColors.amber,
  chartColors.accent,
  chartColors.coral,
  chartColors.primary,
  chartColors.bright,
  chartColors.forest,
  chartColors.blueDeep,
  chartColors.charcoal,
];
