import type { Metadata } from "next";
import ImpactStoriesClient from "./ImpactStoriesClient";

export const metadata: Metadata = {
  title: "Impact Stories",
  description:
    "Real lives changed by For The Future Organization. See how your support is transforming the lives of underprivileged children.",
};

export default function ImpactStoriesPage() {
  return <ImpactStoriesClient />;
}
