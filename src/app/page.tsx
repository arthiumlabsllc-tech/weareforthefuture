import { prisma } from "@/lib/db";
import { getFeaturedProgrammes } from "@/lib/pillars";
import HomeClient from "./HomeClient";
import type { Priority } from "@/components/home/CurrentPriorities";
import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

// Homepage is mostly static; revalidate periodically so CMS-driven
// "Current Priorities" (and their auto-expiry) stay fresh without a rebuild.
export const revalidate = 300;

/**
 * Active donation appeals for the homepage "Current Priorities" section.
 * Sourced from the CMS `DonationCampaign` model and auto-expired here:
 * published, not soft-deleted, started (or undated) and not past their end
 * date. Fails soft to an empty list so the homepage never breaks on a DB error.
 */
async function getActivePriorities(): Promise<Priority[]> {
  try {
    const now = new Date();
    const campaigns = await prisma.donationCampaign.findMany({
      where: {
        published: true,
        deletedAt: null,
        AND: [
          { OR: [{ startDate: null }, { startDate: { lte: now } }] },
          { OR: [{ endDate: null }, { endDate: { gte: now } }] },
        ],
      },
      orderBy: [{ endDate: "asc" }, { createdAt: "desc" }],
      take: 3,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        goalAmount: true,
        raisedAmount: true,
        endDate: true,
      },
    });

    return campaigns.map((campaign) => ({
      id: campaign.id,
      name: campaign.name,
      slug: campaign.slug,
      description: campaign.description,
      goalAmount: campaign.goalAmount,
      raisedAmount: campaign.raisedAmount,
      endDate: campaign.endDate ? campaign.endDate.toISOString() : null,
    }));
  } catch {
    return [];
  }
}

export default async function HomePage() {
  // getFeaturedProgrammes() is cache()'d and fails soft to the static launch
  // set internally, so no extra guard is needed here.
  const [initialPriorities, featured] = await Promise.all([
    getActivePriorities(),
    getFeaturedProgrammes(),
  ]);
  return <HomeClient initialPriorities={initialPriorities} featured={featured} />;
}
