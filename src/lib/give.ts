import { cache } from "react";
import { prisma } from "@/lib/db";

/**
 * Phase 5 data-access layer for the /give tree. Mirrors src/lib/documents.ts and
 * src/lib/pillars.ts: every accessor is `cache()`'d and degrades to a safe
 * fallback when the database is unreachable, so ISR pages prerender and render an
 * intentional state instead of a 500. Server-only (imports Prisma) — client
 * components must import the isomorphic constants from @/data/giving instead.
 */

export interface GivingCampaign {
  slug: string;
  name: string;
  description: string | null;
  heroImage: string | null;
  /** pesewas */
  goalAmount: number;
  /** pesewas */
  raisedAmount: number;
  startDate: string | null;
  endDate: string | null;
}

/** Published, time-bound donation campaigns (newest end date first). Falls back to []. */
export const getGivingCampaigns = cache(async (): Promise<GivingCampaign[]> => {
  try {
    const rows = await prisma.donationCampaign.findMany({
      where: { published: true, deletedAt: null },
      orderBy: [{ endDate: "asc" }, { createdAt: "desc" }],
    });
    return rows.map((r) => ({
      slug: r.slug,
      name: r.name,
      description: r.description,
      heroImage: r.heroImage,
      goalAmount: r.goalAmount,
      raisedAmount: r.raisedAmount,
      startDate: r.startDate ? r.startDate.toISOString() : null,
      endDate: r.endDate ? r.endDate.toISOString() : null,
    }));
  } catch (err) {
    console.error("[give] getGivingCampaigns failed — empty fallback", err);
    return [];
  }
});

export type GivingKind = "campaign" | "programme" | "general";

export interface GivingTarget {
  kind: GivingKind;
  slug: string;
  name: string;
  description: string | null;
  image: string | null;
  /** pesewas — campaign only */
  goalAmount: number | null;
  /** pesewas — campaign only */
  raisedAmount: number | null;
  campaignId: string | null;
}

/**
 * Reserved slugs for the two unrestricted giving routes on the hub. These are not
 * DB rows — they resolve to a general, unrestricted donation page.
 */
export const GENERAL_GIVING = {
  "where-most-needed": {
    name: "Give where it's needed most",
    description:
      "Unrestricted giving. We direct your gift to the highest-priority need across our five programme pillars — so support reaches children and young people where it matters most, when it matters most.",
  },
  monthly: {
    name: "Monthly giving",
    description:
      "Recurring monthly support gives our programmes predictable funding to plan, staff and sustain their work — turning a one-off gift into lasting opportunity.",
  },
} as const;

export type GeneralSlug = keyof typeof GENERAL_GIVING;

export function isGeneralSlug(slug: string): slug is GeneralSlug {
  return Object.prototype.hasOwnProperty.call(GENERAL_GIVING, slug);
}

/**
 * Resolve a /give/[slug] target: reserved general route → DonationCampaign →
 * Program → null (caller renders notFound()). Never throws.
 */
export const resolveGivingTarget = cache(async (slug: string): Promise<GivingTarget | null> => {
  if (isGeneralSlug(slug)) {
    const g = GENERAL_GIVING[slug];
    return {
      kind: "general",
      slug,
      name: g.name,
      description: g.description,
      image: null,
      goalAmount: null,
      raisedAmount: null,
      campaignId: null,
    };
  }
  try {
    const campaign = await prisma.donationCampaign.findFirst({
      where: { slug, published: true, deletedAt: null },
    });
    if (campaign) {
      return {
        kind: "campaign",
        slug: campaign.slug,
        name: campaign.name,
        description: campaign.description,
        image: campaign.heroImage,
        goalAmount: campaign.goalAmount,
        raisedAmount: campaign.raisedAmount,
        campaignId: campaign.id,
      };
    }
    const program = await prisma.program.findFirst({
      where: { slug, published: true, deletedAt: null },
    });
    if (program) {
      return {
        kind: "programme",
        slug: program.slug,
        name: program.name,
        description: program.shortDescription,
        image: program.image,
        goalAmount: null,
        raisedAmount: null,
        campaignId: program.campaignId ?? null,
      };
    }
  } catch (err) {
    console.error("[give] resolveGivingTarget failed for slug:", slug, err);
  }
  return null;
});

/**
 * Slugs to prerender for /give/[slug]: the reserved general routes plus every
 * published programme and campaign slug. Falls back to the reserved slugs only.
 */
export const getGivingSlugs = cache(async (): Promise<string[]> => {
  const slugs = new Set<string>(Object.keys(GENERAL_GIVING));
  try {
    const [programs, campaigns] = await Promise.all([
      prisma.program.findMany({ where: { published: true, deletedAt: null }, select: { slug: true } }),
      prisma.donationCampaign.findMany({ where: { published: true, deletedAt: null }, select: { slug: true } }),
    ]);
    for (const p of programs) slugs.add(p.slug);
    for (const c of campaigns) slugs.add(c.slug);
  } catch (err) {
    console.error("[give] getGivingSlugs failed — reserved slugs only", err);
  }
  return [...slugs];
});
