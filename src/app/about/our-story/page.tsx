import type { Metadata } from "next";
import OurStoryClient from "./OurStoryClient";

export const metadata: Metadata = {
  title: "Our Story",
  description:
    "Founded in 2016 by students at Wesley Girls' High School, For The Future Organization has grown into a youth-led movement across Ghana and Nigeria — a decade of learning from 2016 to 2026.",
  alternates: { canonical: "/about/our-story" },
};

export default function OurStoryPage() {
  return <OurStoryClient />;
}
