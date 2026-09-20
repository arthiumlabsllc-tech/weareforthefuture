import type { Metadata } from "next";
import SafeguardingClient from "./SafeguardingClient";

export const metadata: Metadata = {
  title: "Safeguarding & Accountability",
  description:
    "How For The Future Organization protects children: child protection, consent and safe storytelling, volunteer conduct, incident reporting and referral, data protection, and partner expectations.",
  alternates: { canonical: "/about/safeguarding" },
};

export default function SafeguardingPage() {
  return <SafeguardingClient />;
}
