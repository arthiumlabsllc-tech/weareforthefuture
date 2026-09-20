import { cache } from "react";
import {
  BookOpen,
  Compass,
  Flower2,
  HeartHandshake,
  Laptop,
  type LucideIcon,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { pillars as staticPillars, primaryPillar } from "@/data/pillars";
import { initiatives } from "@/data/initiatives";
import { programMetricsSchema, type ProgrammeDetail, type ProgrammeMetrics } from "@/lib/programme-content";

/**
 * Phase 3b.2 data-access layer for the five strategic pillars and the
 * programmes linked to them (Program <-> Pillar many-to-many via ProgramPillar).
 *
 * Every function is wrapped in try/catch and degrades to the static copy in
 * src/data/pillars.ts / src/data/initiatives.ts when the database is
 * unreachable (e.g. a cold Neon branch at build time). The static fallback
 * keeps ISR pages rendering — and `next build` prerendering — with no 500s.
 */

/* ===== View types (serialisable; safe to pass into client components) ===== */

export type PillarAccent = "primary" | "accent" | "charcoal";

export interface PillarData {
  /** Stable slug — equals Pillar.slug in the DB and Pillar.id in static data. */
  id: string;
  number: number;
  title: string;
  summary: string;
  challenge: string;
  whatWeDo: string;
  whoItServes: string;
  whereItWorks: string;
  /** Resolved lucide icon (from Pillar.icon name in DB, component in static). */
  icon: LucideIcon;
  /** Brand-semantic accent token (decorative metadata only). */
  accent: PillarAccent | null;
  order: number;
}

export interface PillarRef {
  id: string;
  number: number;
  title: string;
  isPrimary: boolean;
}

export interface PillarProgramme {
  slug: string;
  name: string;
  shortDescription: string;
  image: string | null;
  /** Program.status — active | expanding | campaign | pilot | future_project | archived. */
  status: string;
  isFeatured: boolean;
  /** Linked pillars, primary first. */
  pillars: PillarRef[];
}

export interface FeaturedProgramme {
  title: string;
  /** Short display label of the primary pillar. */
  pillar: string;
  description: string;
  image: string | null;
  href: string;
}

export interface ProgrammeStory {
  slug: string;
  title: string;
  excerpt: string;
  childName: string | null;
  location: string | null;
  pullQuote: string | null;
  image: string | null;
}

export interface ProgrammePartner {
  name: string;
  logo: string | null;
  website: string | null;
  type: string;
  tier: string;
}

export interface ProgrammeUpdate {
  slug: string;
  title: string;
  excerpt: string | null;
  date: string | null;
}

export interface ProgrammeDetailData {
  slug: string;
  name: string;
  shortDescription: string;
  /** Rich-text body copy (HTML). Render as stripped text, never as raw HTML. */
  description: string;
  image: string | null;
  status: string;
  isFeatured: boolean;
  /** Parsed impactMetrics JSON (category/country/year/beneficiaries/highlights…). */
  metrics: ProgrammeMetrics;
  /** Structured long-form copy, when the programme has a published detail set. */
  detail: ProgrammeDetail | null;
  pillars: PillarRef[];
}

/* ===== Icon resolution (Pillar.icon stores the lucide component NAME) ===== */

const ICONS: Record<string, LucideIcon> = {
  BookOpen,
  Flower2,
  Laptop,
  Compass,
  HeartHandshake,
};

const FALLBACK_ICON = HeartHandshake;

const iconFor = (name: string | null | undefined): LucideIcon =>
  (name && ICONS[name]) || FALLBACK_ICON;

const toAccent = (value: string | null | undefined): PillarAccent | null =>
  value === "primary" || value === "accent" || value === "charcoal" ? value : null;

/* ===== Static fallbacks (src/data/pillars.ts + src/data/initiatives.ts) ===== */

const staticPillarData: PillarData[] = staticPillars.map((pillar) => ({
  id: pillar.id,
  number: pillar.number,
  title: pillar.title,
  summary: pillar.summary,
  challenge: pillar.challenge,
  whatWeDo: pillar.whatWeDo,
  whoItServes: pillar.whoItServes,
  whereItWorks: pillar.whereItWorks,
  icon: pillar.icon,
  accent: toAccent(["primary", "accent", "primary", "accent", "charcoal"][pillar.number - 1]),
  order: pillar.number,
}));

const staticProgramme = (slug: string): PillarProgramme | null => {
  const initiative = initiatives.find((i) => i.slug === slug);
  if (!initiative) return null;
  const pillar = primaryPillar(initiative.pillars);
  return {
    slug: initiative.slug,
    name: initiative.title,
    shortDescription: initiative.shortDescription,
    image: initiative.image,
    status: initiative.status === "upcoming" ? "future_project" : "active",
    isFeatured: initiative.featured ?? false,
    pillars: pillar
      ? [{ id: pillar.id, number: pillar.number, title: pillar.title, isPrimary: true }]
      : [],
  };
};

/* The four brief-featured programmes (decision 5B launch set). */
const FEATURED_SLUGS = [
  "step-project",
  "smart-start-initiative",
  "future-pathways",
  "empower-her-period",
];

/* ===== Pillars ===== */

/** All published pillars, ordered by number. Falls back to static copy. */
export const getPillars = cache(async (): Promise<PillarData[]> => {
  try {
    const rows = await prisma.pillar.findMany({
      where: { published: true, deletedAt: null },
      orderBy: [{ number: "asc" }, { order: "asc" }],
    });
    if (rows.length === 0) return staticPillarData;
    return rows.map((row) => ({
      id: row.slug,
      number: row.number,
      title: row.title,
      summary: row.summary,
      challenge: row.challenge,
      whatWeDo: row.whatWeDo,
      whoItServes: row.whoItServes,
      whereItWorks: row.whereItWorks,
      icon: iconFor(row.icon),
      accent: toAccent(row.accent),
      order: row.order,
    }));
  } catch (err) {
    console.error("[pillars] getPillars failed — using static fallback", err);
    return staticPillarData;
  }
});

/** A single published pillar by slug, or null. Falls back to static copy. */
export const getPillarBySlug = cache(async (slug: string): Promise<PillarData | null> => {
  try {
    const row = await prisma.pillar.findFirst({
      where: { slug, published: true, deletedAt: null },
    });
    if (row) {
      return {
        id: row.slug,
        number: row.number,
        title: row.title,
        summary: row.summary,
        challenge: row.challenge,
        whatWeDo: row.whatWeDo,
        whoItServes: row.whoItServes,
        whereItWorks: row.whereItWorks,
        icon: iconFor(row.icon),
        accent: toAccent(row.accent),
        order: row.order,
      };
    }
  } catch (err) {
    console.error("[pillars] getPillarBySlug failed — using static fallback", err);
  }
  return staticPillarData.find((pillar) => pillar.id === slug) ?? null;
});

/* ===== Programmes by pillar / featured ===== */

const pillarRefSort = (a: PillarRef, b: PillarRef) =>
  Number(b.isPrimary) - Number(a.isPrimary) || a.number - b.number;

const mapProgramRow = (row: {
  slug: string;
  name: string;
  shortDescription: string | null;
  image: string | null;
  status: string;
  isFeatured: boolean;
  pillars: {
    isPrimary: boolean;
    pillar: { slug: string; number: number; title: string };
  }[];
}): PillarProgramme => ({
  slug: row.slug,
  name: row.name,
  shortDescription: row.shortDescription ?? "",
  image: row.image,
  status: row.status,
  isFeatured: row.isFeatured,
  pillars: row.pillars
    .map((link) => ({
      id: link.pillar.slug,
      number: link.pillar.number,
      title: link.pillar.title,
      isPrimary: link.isPrimary,
    }))
    .sort(pillarRefSort),
});

/**
 * Published programmes linked to a pillar (by pillar slug — the stable public
 * id), primary-linked first. Falls back to the static initiatives whose
 * primary pillar tag matches.
 */
export const getProgrammesByPillar = cache(async (pillarSlug: string): Promise<PillarProgramme[]> => {
  try {
    const rows = await prisma.program.findMany({
      where: {
        published: true,
        deletedAt: null,
        pillars: { some: { pillar: { slug: pillarSlug } } },
      },
      orderBy: [{ order: "asc" }, { name: "asc" }],
      include: { pillars: { include: { pillar: true } } },
    });
    return rows
      .map((row) => mapProgramRow({
        ...row,
        pillars: row.pillars.map((link) => ({ isPrimary: link.isPrimary, pillar: link.pillar })),
      }))
      .sort((a, b) => {
        const aPrimary = a.pillars.some((p) => p.isPrimary && p.id === pillarSlug) ? 0 : 1;
        const bPrimary = b.pillars.some((p) => p.isPrimary && p.id === pillarSlug) ? 0 : 1;
        return aPrimary - bPrimary || a.name.localeCompare(b.name);
      });
  } catch (err) {
    console.error("[pillars] getProgrammesByPillar failed — using static fallback", err);
  }
  return initiatives
    .filter((initiative) => primaryPillar(initiative.pillars)?.id === pillarSlug)
    .map((initiative) => staticProgramme(initiative.slug))
    .filter((p): p is PillarProgramme => p !== null);
});

/** Short label for a pillar title on compact cards ("Pillar 2 · …"). */
const pillarLabel = (pillarId: string): string => {
  const pillar = staticPillarData.find((p) => p.id === pillarId);
  return pillar ? `Pillar ${pillar.number} · ${pillar.title}` : "Our work";
};

/**
 * Programmes flagged isFeatured in the CMS, primary-pillar order — the
 * homepage "Featured work" rail. Falls back to the hard-coded launch set
 * (decision 5B) built from the static initiatives when the DB is unreachable.
 */
export const getFeaturedProgrammes = cache(async (): Promise<FeaturedProgramme[]> => {
  try {
    const rows = await prisma.program.findMany({
      where: { published: true, deletedAt: null, isFeatured: true },
      orderBy: [{ order: "asc" }, { name: "asc" }],
      include: { pillars: { include: { pillar: true } } },
    });
    if (rows.length > 0) {
      return rows.map((row) => {
        const programme = mapProgramRow({
          ...row,
          pillars: row.pillars.map((link) => ({ isPrimary: link.isPrimary, pillar: link.pillar })),
        });
        const primary = programme.pillars[0];
        return {
          title: programme.name,
          pillar: primary ? `Pillar ${primary.number} · ${primary.title}` : "Our work",
          description: programme.shortDescription,
          image: programme.image,
          href: primary
            ? `/our-work/${primary.id}/${encodeURIComponent(programme.slug)}`
            : `/our-work`,
        };
      });
    }
  } catch (err) {
    console.error("[pillars] getFeaturedProgrammes failed — using static fallback", err);
  }
  return FEATURED_SLUGS.map((slug) => {
    const programme = staticProgramme(slug);
    const primary = programme?.pillars[0];
    return {
      title: programme?.name ?? slug,
      pillar: primary ? pillarLabel(primary.id) : "Our work",
      description: programme?.shortDescription ?? "",
      image: programme?.image ?? null,
      href: primary
        ? `/our-work/${primary.id}/${encodeURIComponent(slug)}`
        : `/our-work`,
    };
  });
});

/* ===== Programme-level indicators (Phase 4 /impact dashboard) ===== */

export interface ProgrammeIndicator {
  slug: string;
  name: string;
  pillarId: string;
  pillarTitle: string;
  beneficiaries: number | null;
  category: string | null;
  highlights: string[];
  href: string;
}

/**
 * Published programmes with their CMS impact metrics, for the /impact
 * programme-level indicator grid. Falls back to [] when the DB is unreachable,
 * in which case the dashboard shows organisation-wide figures only.
 */
export const getProgrammeIndicators = cache(async (): Promise<ProgrammeIndicator[]> => {
  try {
    const rows = await prisma.program.findMany({
      where: { published: true, deletedAt: null },
      orderBy: [{ order: "asc" }, { name: "asc" }],
      include: { pillars: { include: { pillar: true } } },
    });
    return rows.map((row) => {
      const parsed = programMetricsSchema.safeParse(row.impactMetrics);
      const metrics = parsed.success ? parsed.data : {};
      const primaryLink = row.pillars.find((link) => link.isPrimary) ?? row.pillars[0];
      const primary = primaryLink?.pillar;
      return {
        slug: row.slug,
        name: row.name,
        pillarId: primary?.slug ?? "",
        pillarTitle: primary?.title ?? "Our work",
        beneficiaries: typeof metrics.beneficiaries === "number" ? metrics.beneficiaries : null,
        category: metrics.category ?? null,
        highlights: metrics.highlights ?? [],
        href: primary ? `/our-work/${primary.slug}/${encodeURIComponent(row.slug)}` : "/our-work",
      };
    });
  } catch (err) {
    console.error("[pillars] getProgrammeIndicators failed — using empty fallback", err);
    return [];
  }
});

/* ===== Programme detail + related content ===== */

/**
 * Full published programme by slug, or null. No static fallback: a programme
 * detail page without CMS copy should 404 rather than render invented content.
 */
export const getProgrammeDetail = cache(async (slug: string): Promise<ProgrammeDetailData | null> => {
  try {
    const row = await prisma.program.findFirst({
      where: { slug, published: true, deletedAt: null },
      include: { pillars: { include: { pillar: true } } },
    });
    if (!row) return null;
    const parsed = programMetricsSchema.safeParse(row.impactMetrics);
    const metrics = parsed.success ? parsed.data : {};
    return {
      slug: row.slug,
      name: row.name,
      shortDescription: row.shortDescription ?? "",
      description: row.description ?? "",
      image: row.image,
      status: row.status,
      isFeatured: row.isFeatured,
      metrics,
      detail: metrics.detail ?? null,
      pillars: row.pillars
        .map((link) => ({
          id: link.pillar.slug,
          number: link.pillar.number,
          title: link.pillar.title,
          isPrimary: link.isPrimary,
        }))
        .sort(pillarRefSort),
    };
  } catch (err) {
    console.error("[pillars] getProgrammeDetail failed", err);
    return null;
  }
});

/**
 * Safeguarding-approved stories for a programme: ImpactStory rows linked by
 * programme, consentGiven AND published (consent gate — never relaxed).
 *
 * ImpactStory.program is free text and does not equal Program.name (e.g.
 * "Student Training & Education Project (STEP)" vs "Student Training and
 * Education Project"), so we normalise both sides (& -> and, strip
 * punctuation/parentheticals, collapse case+space) and match on containment.
 * The consent gate is enforced in SQL and is never bypassed by the matcher.
 */
const normalizeForMatch = (value: string): string =>
  value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

export const getProgrammeStories = cache(async (programName: string): Promise<ProgrammeStory[]> => {
  const needle = normalizeForMatch(programName);
  try {
    const rows = await prisma.impactStory.findMany({
      where: { consentGiven: true, published: true, deletedAt: null, program: { not: null } },
      orderBy: { createdAt: "desc" },
      select: {
        slug: true,
        title: true,
        excerpt: true,
        childName: true,
        location: true,
        pullQuote: true,
        featuredImage: true,
        program: true,
      },
    });
    return rows
      .filter((row) => {
        const haystack = normalizeForMatch(row.program ?? "");
        return haystack.length > 0 && (haystack.includes(needle) || needle.includes(haystack));
      })
      .slice(0, 6)
      .map((row) => ({
        slug: row.slug,
        title: row.title,
        excerpt: row.excerpt ?? "",
        childName: row.childName,
        location: row.location,
        pullQuote: row.pullQuote,
        image: row.featuredImage,
      }));
  } catch (err) {
    console.error("[pillars] getProgrammeStories failed", err);
    return [];
  }
});

/**
 * Partners whose published description mentions the programme name. Partner
 * has no programme FK, so name-match is the only honest filter; returns []
 * when nothing matches (the page renders an empty state, never invented links).
 */
export const getProgrammePartners = cache(async (programName: string): Promise<ProgrammePartner[]> => {
  try {
    const rows = await prisma.partner.findMany({
      where: {
        published: true,
        deletedAt: null,
        description: { contains: programName, mode: "insensitive" },
      },
      orderBy: [{ order: "asc" }, { name: "asc" }],
      take: 8,
      select: { name: true, logo: true, website: true, type: true, tier: true },
    });
    return rows;
  } catch (err) {
    console.error("[pillars] getProgrammePartners failed", err);
    return [];
  }
});

/**
 * Chronological updates for a programme: published BlogPosts carrying a tag
 * whose name or slug matches the programme (BlogPost has no programme FK).
 * Returns [] when no post is tagged for the programme.
 */
export const getProgrammeUpdates = cache(
  async (programName: string, programSlug: string): Promise<ProgrammeUpdate[]> => {
    try {
      const rows = await prisma.blogPost.findMany({
        where: {
          published: true,
          deletedAt: null,
          tags: {
            some: {
              OR: [
                { name: { equals: programName, mode: "insensitive" } },
                { slug: { equals: programSlug, mode: "insensitive" } },
              ],
            },
          },
        },
        orderBy: [{ publishDate: "desc" }, { createdAt: "desc" }],
        take: 6,
        select: { slug: true, title: true, excerpt: true, publishDate: true, createdAt: true },
      });
      return rows.map((row) => ({
        slug: row.slug,
        title: row.title,
        excerpt: row.excerpt,
        date: (row.publishDate ?? row.createdAt).toISOString(),
      }));
    } catch (err) {
      console.error("[pillars] getProgrammeUpdates failed", err);
      return [];
    }
  },
);

/**
 * Every published (pillarSlug, programmeSlug) pair — used by
 * generateStaticParams to pre-render the full /our-work/[pillar]/[program]
 * tree. Falls back to static initiatives so `next build` prerenders even with
 * the DB unreachable.
 */
export const getProgrammeRouteParams = cache(
  async (): Promise<{ pillar: string; program: string }[]> => {
    try {
      const rows = await prisma.program.findMany({
        where: { published: true, deletedAt: null },
        select: { slug: true, pillars: { select: { pillar: { select: { slug: true } } } } },
      });
      const params = rows.flatMap((row) =>
        row.pillars.map((link) => ({ pillar: link.pillar.slug, program: row.slug })),
      );
      if (params.length > 0) return params;
    } catch (err) {
      console.error("[pillars] getProgrammeRouteParams failed — using static fallback", err);
    }
    return initiatives.flatMap((initiative) => {
      const pillar = primaryPillar(initiative.pillars);
      return pillar ? [{ pillar: pillar.id, program: initiative.slug }] : [];
    });
  },
);
