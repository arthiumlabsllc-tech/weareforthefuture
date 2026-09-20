import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPillarBySlug, getProgrammesByPillar, getPillars, type PillarData } from "@/lib/pillars";
import { DEFAULT_OG_IMAGE } from "@/data/site";
import PillarClient from "./PillarClient";

type Props = { params: Promise<{ pillar: string }> };

// Refresh the static shell periodically (ISR), matching /our-work.
export const revalidate = 300;

/** Pre-render all published pillar pages at build time (DB-backed, static fallback). */
export async function generateStaticParams() {
  const pillars = await getPillars();
  return pillars.map((pillar) => ({ pillar: pillar.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { pillar: slug } = await params;
  const pillar = await getPillarBySlug(decodeURIComponent(slug));
  if (!pillar) return { title: "Pillar not found | Our Work" };
  return {
    title: `${pillar.title} | Our Work`,
    description: `${pillar.summary} Explore what this FTF pillar addresses, how we deliver it, who it serves and where it works.`,
    alternates: { canonical: `/our-work/${pillar.id}` },
    openGraph: {
      title: `${pillar.title} | For The Future Organization`,
      description: pillar.summary,
      type: "website",
      images: [DEFAULT_OG_IMAGE],
    },
  };
}

export default async function PillarPage({ params }: Props) {
  const { pillar: slug } = await params;
  // getPillarBySlug/getProgrammesByPillar fail soft to static copy when the DB
  // is unreachable, so a cold branch renders the pillar instead of 500ing.
  const pillar = await getPillarBySlug(decodeURIComponent(slug));
  if (!pillar) notFound();
  const programmes = await getProgrammesByPillar(pillar.id);

  // Strip the non-serialisable icon; PillarClient re-derives it by id.
  const pillarView: Omit<PillarData, "icon"> = (({ icon: _icon, ...rest }) => rest)(pillar);

  return <PillarClient pillar={pillarView} programmes={programmes} />;
}
