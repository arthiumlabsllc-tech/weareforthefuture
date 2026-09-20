import type { Metadata } from "next";
import AboutPageClient from "./AboutClient";

export const metadata: Metadata = {
  title: "About",
  description:
    "For The Future Organization is a youth-led, community-rooted child and youth development organization. Explore our story, how we work, where we work, our team and governance, and our safeguarding commitments.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return <AboutPageClient />;
}
