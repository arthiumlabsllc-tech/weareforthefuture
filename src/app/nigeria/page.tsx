import type { Metadata } from "next";
import NigeriaClient from "./NigeriaClient";

export const metadata: Metadata = {
  title: "FTF Nigeria · Ibadan, Oyo State",
  description:
    "For The Future (FTF) Nigeria operates in Ibadan, Oyo State, delivering STEP and Project Momentum within the same five-pillar framework we use across Ghana.",
  alternates: { canonical: "/nigeria" },
};

export default function NigeriaPage() {
  return <NigeriaClient />;
}
