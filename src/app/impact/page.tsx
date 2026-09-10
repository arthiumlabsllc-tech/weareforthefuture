import type { Metadata } from "next";
import ImpactClient from "./ImpactClient";

export const metadata: Metadata = {
  title: "Our Impact",
  description:
    "See the measurable impact of For The Future Organization - from lives changed to communities transformed across Ghana, Nigeria, and the US.",
};

export default function ImpactPage() {
  return <ImpactClient />;
}
