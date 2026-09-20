import type { Metadata } from "next";
import { getPillars, getProgrammesByPillar, type PillarData } from "@/lib/pillars";
import { DEFAULT_OG_IMAGE } from "@/data/site";
import OurWorkClient from "./OurWorkClient";

export const metadata: Metadata = {
  title: "Our Work | Five Pillars, One Pathway",
  description:
    "Every FTF programme sits within one of five pillars that connect into a single development pathway — from access to school, through learning, dignity and future-ready skills, to mentorship, work and leadership. Explore the pillars and the programmes delivering them across Ghana and Nigeria.",
  alternates: { canonical: "/our-work" },
  openGraph: {
    title: "Our Work | For The Future Organization",
    description: "Five pillars. One pathway. From disadvantage to opportunity.",
    type: "website",
    images: [DEFAULT_OG_IMAGE],
  },
};

// Pillars and their programmes are CMS-managed (Pillar / Program / ProgramPillar).
// Refresh the static shell periodically rather than per-request, matching the
// homepage ISR cadence.
export const revalidate = 300;

export default async function OurWorkPage() {
  // getPillars()/getProgrammesByPillar() both fail soft to src/data/pillars.ts
  // when the DB is unreachable, so this route never 500s on a cold branch.
  const pillars = await getPillars();
  const grouped = (
    await Promise.all(
      pillars.map(async (pillar) => ({
        pillarId: pillar.id,
        programmes: await getProgrammesByPillar(pillar.id),
      })),
    )
  ).filter((group) => group.programmes.length > 0);

  // Strip the non-serialisable icon before crossing into the client component;
  // OurWorkClient re-derives it from static pillar copy by id.
  const pillarsView: Omit<PillarData, "icon">[] = pillars.map(({ icon: _icon, ...rest }) => rest);

  return <OurWorkClient pillars={pillarsView} grouped={grouped} />;
}
