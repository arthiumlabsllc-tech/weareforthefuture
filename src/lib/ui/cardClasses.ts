/**
 * Shared card surface treatment (DESIGN.md §4 "Card" pattern, Phase 12 Step 4).
 *
 * One source of truth for the default card chrome so every card-like surface
 * (programme, value, story, report, partner tiles, gallery frames) stays
 * visually consistent. Spread `cardClasses` onto the card root and pick a
 * padding from `cardPadding`.
 *
 * Sanctioned variants (see DESIGN.md §4):
 *  - default        -> cardClasses as-is (bg-surface + border-border)
 *  - semantic tint  -> ValueCard only: keeps its tinted border/bg, but adopts
 *                      the same radius, padding and hover shadow
 *  - dashed empty   -> empty-state cards: border-dashed, no hover
 *
 * Motion rule (§8): no transform greater than 2px on cards - hover is a
 * background + shadow change only, never a lift.
 */
export const cardClasses =
  "rounded-2xl border border-border bg-surface shadow-sm transition-colors hover:bg-surface-hover hover:shadow-md";

export const cardPadding = {
  compact: "p-6",
  default: "p-7",
  feature: "p-8",
} as const;

export type CardPadding = keyof typeof cardPadding;
