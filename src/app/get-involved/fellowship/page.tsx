import type { Metadata } from "next";
import FellowshipClient from "./FellowshipClient";

export const metadata: Metadata = {
  title: "FTF Fellowship",
  description:
    "The FTF Fellowship (Young Changemakers) is a structured pathway for young leaders to lead community projects, build skills, receive mentorship and give back by training the next cohort.",
  alternates: { canonical: "/get-involved/fellowship" },
};

export default function GetInvolvedFellowshipPage() {
  return <FellowshipClient />;
}
