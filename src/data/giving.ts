/**
 * Isomorphic giving constants (Phase 5). Plain data only — safe to import from
 * both server and client components (no Prisma, no React). Server-side accessors
 * live in src/lib/give.ts.
 */

/** Quick-select donation amounts in GHS, used across the /give tree. */
export const GIVING_AMOUNTS = [50, 100, 250, 500, 1000, 2500];

/**
 * Illustrative impact levels. Qualitative on purpose: these describe what a gift
 * can fund without making unverifiable per-child or percentage claims.
 */
export const GIVING_TIERS: { amount: number; impact: string }[] = [
  { amount: 100, impact: "School supplies for a classroom for a month" },
  { amount: 250, impact: "A week of meals at a community learning club" },
  { amount: 500, impact: "Menstrual health kits for a group of girls for a term" },
  { amount: 1000, impact: "A term of school fees for one child" },
  { amount: 2500, impact: "A digital-skills workshop for a cohort of young people" },
];

/** Default amount preselected in the giving panel. */
export const DEFAULT_GIVING_AMOUNT = 250;
