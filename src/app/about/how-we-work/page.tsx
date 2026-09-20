import type { Metadata } from "next";
import HowWeWorkClient from "./HowWeWorkClient";

export const metadata: Metadata = {
  title: "How We Work",
  description:
    "The six principles behind every For The Future programme: youth-led and volunteer-powered, community-embedded, holistic, partnership-based, safeguarding-led, and measured and accountable.",
  alternates: { canonical: "/about/how-we-work" },
};

export default function HowWeWorkPage() {
  return <HowWeWorkClient />;
}
