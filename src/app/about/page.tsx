import type { Metadata } from "next";
import AboutPageClient from "./AboutClient";

export const metadata: Metadata = {
  title: "Our Story",
  description:
    "From a small charity in Ghana to a global movement - discover the history and mission of For The Future Organization (FTF).",
};

export default function AboutPage() {
  return <AboutPageClient />;
}
