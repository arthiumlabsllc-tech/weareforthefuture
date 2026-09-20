import type { Metadata } from "next";
import FTFat10Client from "./FTFat10Client";

export const metadata: Metadata = {
  title: "FTF at 10",
  description:
    "Ten years of For The Future Organization: the 2016 → 2026 timeline, key milestones, safeguarding-approved beneficiary journeys and the work still ahead. It takes all of us.",
  alternates: { canonical: "/impact/ftf-at-10" },
};

export default function FTFat10Page() {
  return <FTFat10Client />;
}
