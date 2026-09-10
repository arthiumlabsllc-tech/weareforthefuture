import type { Metadata } from "next";
import DonateClient from "./DonateClient";

export const metadata: Metadata = {
  title: "Donate",
  description:
    "Support For The Future Organization. Your donation provides education, healthcare, and opportunities to underprivileged children.",
};

export default function DonatePage() {
  return <DonateClient />;
}
