import type { Metadata } from "next";
import SupportAFutureClient from "./SupportAFutureClient";
import { getCasePage } from "@/lib/support-a-future/cases";
import { casePaymentsEnabled } from "@/lib/support-a-future/security";

export const metadata: Metadata = {
  title: "Support a Future",
  description:
    "Browse verified needs with consent and safeguarding review. FTF administers every contribution.",
  alternates: { canonical: null },
};

export default async function SupportAFuturePage({ searchParams }: { searchParams: Promise<{ cursor?: string | string[] }> }) {
  const query = await searchParams;
  const cursor = typeof query.cursor === "string" ? query.cursor : null;
  let initial = null;
  try { initial = { ...await getCasePage({ cursor }), checkoutEnabled: casePaymentsEnabled() }; } catch { /* Render an honest retryable load error. */ }
  return <SupportAFutureClient initial={initial} cursor={cursor} />;
}
