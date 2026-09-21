import type { Metadata } from "next";
import { PrismaClient } from "@prisma/client";
import PartnersClient from "./PartnersClient";
import { getDocumentsByCategory } from "@/lib/documents";

export const metadata: Metadata = {
  title: "Partners",
  description:
    "Partner with For The Future Organization - a credible, youth-led local implementation partner across Ghana and Nigeria. Programme grants, CSR/CSV, ESG, in-kind, employee volunteering and multi-year alliances.",
  alternates: { canonical: "/partners" },
};

const prisma = new PrismaClient();

// Phase 3b.2 ISR audit: the partner directory is CMS-managed content that does
// not need per-request freshness - statically generate + revalidate instead of λ.
export const revalidate = 300;

export default async function PartnersPage() {
  // Guarded: fall back to safe empties if the DB is unreachable (Phase 3a.5).
  const [partners, deckRaw, profileRaw] = await Promise.all([
    prisma.partner
      .findMany({
        where: { published: true, deletedAt: null },
        orderBy: { order: "asc" },
      })
      .catch((err) => {
        console.error("[/partners] DB query failed:", err);
        return [];
      }),
    getDocumentsByCategory("Partner Deck"),
    getDocumentsByCategory("Institutional Profile"),
  ]);

  // The deck section accepts the explicit "Partner Deck" category plus the
  // institutional profile we publish today ("Institutional Profile"), deduped
  // by id so a document filed under both never renders twice.
  const deckDocs = [...deckRaw, ...profileRaw].filter(
    (doc, i, all) => all.findIndex((d) => d.id === doc.id) === i,
  );

  const dbPartners = partners.map((p) => ({
    name: p.name,
    logo: p.logo || "",
    type: p.type,
    tier: p.tier,
  }));

  return <PartnersClient initialPartners={dbPartners} deckDocs={deckDocs} />;
}
