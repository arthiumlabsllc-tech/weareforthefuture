import type { Metadata } from "next";
import WhereWeWorkClient from "./WhereWeWorkClient";

export const metadata: Metadata = {
  title: "Where We Work",
  description:
    "For The Future delivers programmes in two countries — Ghana (Greater Accra and six other regions) and Nigeria (Ibadan, Oyo State) — supported by a US 501(c)(3) vehicle.",
  alternates: { canonical: "/about/where-we-work" },
};

export default function WhereWeWorkPage() {
  return <WhereWeWorkClient />;
}
