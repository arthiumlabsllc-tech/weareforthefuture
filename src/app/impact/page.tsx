import type { Metadata } from "next";
import { getProgrammeIndicators } from "@/lib/pillars";
import ImpactClient from "./ImpactClient";

export const metadata: Metadata = {
  title: "Our Impact",
  description:
    "Where your money goes: verified organisational figures, fund allocation across our five programme pillars, programme-level indicators and safeguarding-approved stories of change.",
  alternates: { canonical: "/impact" },
};

// Refresh programme indicators periodically so CMS edits appear without a rebuild.
export const revalidate = 300;

export default async function ImpactPage() {
  // Programme-level indicators come from the CMS via the data-access layer,
  // which fails soft to [] when the database is unreachable (local dev, CI,
  // cold-start DB). The dashboard then shows organisation-wide figures only —
  // never a 500, never invented per-programme numbers.
  const indicators = await getProgrammeIndicators();

  return <ImpactClient indicators={indicators} />;
}
