import type { Metadata } from "next";
import { getPublicProgrammes } from "@/lib/programmes";
import { initiatives as staticInitiatives } from "@/data/initiatives";
import InitiativesClient from "./InitiativesClient";

export const metadata: Metadata = {
  title: "Our Work",
  description:
    "Explore FTF's five pillars of change - from foundational education and girls' dignity to future-ready skills, mentorship and community support - and the initiatives delivering them."
};

export const dynamic = "force-dynamic";

export default async function InitiativesPage() {
  const dbInitiatives = await getPublicProgrammes();

  // DB programmes override static entries with the same slug
  const dbSlugs = new Set(dbInitiatives.map((i) => i.slug));
  const merged = [
    ...dbInitiatives,
    ...staticInitiatives.filter((i) => !dbSlugs.has(i.slug)),
  ];

  return <InitiativesClient initialInitiatives={merged} />;
}
