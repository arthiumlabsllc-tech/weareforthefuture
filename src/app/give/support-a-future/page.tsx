import type { Metadata } from "next";
import SupportAFutureClient from "./SupportAFutureClient";

export const metadata: Metadata = {
  title: "Support a Future",
  description:
    "Privacy-safe, FTF-administered giving that backs a child's learning, dignity and wellbeing - without exposing identifiable profiles. Secure, tax-deductible support with For The Future Organization.",
  alternates: { canonical: "/give/support-a-future" },
};

export default function SupportAFuturePage() {
  return <SupportAFutureClient />;
}
