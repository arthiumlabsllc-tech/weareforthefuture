import type { Metadata } from "next";
import ImpactStoreClient from "./ImpactStoreClient";

export const metadata: Metadata = {
  title: "Impact Store",
  description:
    "Shop with purpose. Support underprivileged children while shopping for everyday essentials. 100% of proceeds fund our life-changing programs.",
};

export default function ImpactStorePage() {
  return <ImpactStoreClient />;
}
