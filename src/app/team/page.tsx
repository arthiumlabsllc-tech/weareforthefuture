import type { Metadata } from "next";
import TeamClient from "./TeamClient";

export const metadata: Metadata = {
  title: "Our Team",
  description:
    "Meet the passionate individuals leading For The Future Organization across Ghana, Nigeria, and the United States.",
};

export default function TeamPage() {
  return <TeamClient />;
}
