import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import {
  getPillarBySlug,
  getProgrammeDetail,
  getProgrammeStories,
  getProgrammePartners,
  getProgrammeUpdates,
  getProgrammeRouteParams,
  type PillarData,
} from "@/lib/pillars";
import { DEFAULT_OG_IMAGE } from "@/data/site";
import ProgrammeDetailClient from "./ProgrammeDetailClient";

type Props = { params: Promise<{ pillar: string; program: string }> };

/**
 * Programme detail route - /our-work/{pillar}/{program}.
 *
 * Pillar copy and programme↔pillar links come from the CMS (Pillar / Program /
 * ProgramPillar), fetched through src/lib/pillars.ts. Every fetch degrades
 * gracefully: pillars fall back to src/data/pillars.ts and related content
 * (stories/partners/updates) falls back to an empty list, so an unreachable DB
 * never 500s the route. Refreshed via ISR rather than per-request.
 */
export const revalidate = 300;

/** Pre-render every published (pillar, programme) pair at build time. */
export async function generateStaticParams() {
  return getProgrammeRouteParams();
}

const humanize = (slug: string) =>
  slug
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

/** Strip CMS rich-text HTML to plain paragraphs (project convention - never render raw HTML). */
const toParagraphs = (html: string): string[] =>
  html
    .split(/\n+/)
    .map((chunk) =>
      chunk
        .replace(/<[^>]*>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/\s+/g, " ")
        .trim(),
    )
    .filter(Boolean);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { pillar: pillarSlug, program: programSlug } = await params;
  const pillar = await getPillarBySlug(decodeURIComponent(pillarSlug));
  const programme = await getProgrammeDetail(decodeURIComponent(programSlug));

  if (!programme) {
    return {
      title: `${humanize(decodeURIComponent(programSlug))} | Our Work`,
      robots: { index: false, follow: false },
    };
  }

  // Canonical always points at the PRIMARY pillar path, so the many-to-many
  // variants (/our-work/{any-linked-pillar}/{programme}) never split ranking.
  const primary = programme.pillars.find((p) => p.isPrimary) ?? programme.pillars[0];
  const canonicalPillar = primary?.id ?? decodeURIComponent(pillarSlug);
  const description =
    programme.shortDescription ||
    `${programme.name} - an FTF programme under ${pillar?.title ?? "our work"}.`;

  return {
    title: `${programme.name} | ${pillar?.title ?? "Our Work"}`,
    description,
    alternates: { canonical: `/our-work/${canonicalPillar}/${programme.slug}` },
    openGraph: {
      title: `${programme.name} | For The Future Organization`,
      description,
      type: "article",
      ...(programme.image ? { images: [{ url: programme.image }] } : { images: [DEFAULT_OG_IMAGE] }),
    },
    robots: { index: true, follow: true },
  };
}

export default async function ProgrammePage({ params }: Props) {
  const { pillar: pillarSlugRaw, program: programSlugRaw } = await params;
  const pillarSlug = decodeURIComponent(pillarSlugRaw);
  const programSlug = decodeURIComponent(programSlugRaw);

  const [pillar, programme] = await Promise.all([
    getPillarBySlug(pillarSlug),
    getProgrammeDetail(programSlug),
  ]);
  if (!pillar || !programme) notFound();

  // A programme can sit under several pillars (many-to-many). Only redirect when
  // the requested pillar is NOT one of them (a typo / stale link) - send it to
  // the canonical primary pillar. Valid variants render and canonicalise above.
  const isLinked = programme.pillars.some((p) => p.id === pillarSlug);
  if (!isLinked) {
    const primary = programme.pillars.find((p) => p.isPrimary) ?? programme.pillars[0];
    if (primary) redirect(`/our-work/${primary.id}/${encodeURIComponent(programme.slug)}`);
    // No pillar links at all - render under the requested pillar (defensive).
  }

  const [stories, partners, updates] = await Promise.all([
    getProgrammeStories(programme.name),
    getProgrammePartners(programme.name),
    getProgrammeUpdates(programme.name, programme.slug),
  ]);

  // Strip the non-serialisable icon before crossing into the client component;
  // the client re-derives it from static pillar copy by id.
  const pillarView: Omit<PillarData, "icon"> = {
    id: pillar.id,
    number: pillar.number,
    title: pillar.title,
    summary: pillar.summary,
    challenge: pillar.challenge,
    whatWeDo: pillar.whatWeDo,
    whoItServes: pillar.whoItServes,
    whereItWorks: pillar.whereItWorks,
    accent: pillar.accent,
    order: pillar.order,
  };

  return (
    <ProgrammeDetailClient
      pillar={pillarView}
      programme={programme}
      bodyParagraphs={toParagraphs(programme.description)}
      stories={stories}
      partners={partners}
      updates={updates}
    />
  );
}
