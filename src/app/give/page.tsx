import type { Metadata } from "next";
import GiveClient from "./GiveClient";
import { getProgrammeIndicators } from "@/lib/pillars";
import { getGivingCampaigns } from "@/lib/give";

export const metadata: Metadata = {
  title: "Give",
  description:
    "Six ways to give to For The Future Organization: unrestricted, monthly, programme support, time-bound campaigns, Support a Future, and partnership. Secure, tax-deductible giving across Ghana and Nigeria.",
  alternates: { canonical: "/give" },
};

// Giving routes are CMS-driven but do not need per-request freshness.
export const revalidate = 300;

export default async function GivePage() {
  const [programmes, campaigns] = await Promise.all([
    getProgrammeIndicators(),
    getGivingCampaigns(),
  ]);
  return <GiveClient programmes={programmes} campaigns={campaigns} />;
}
