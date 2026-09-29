/* eslint-disable @next/next/no-html-link-for-pages -- Case navigation requires fresh documents for the privacy boundary. */
import type { Metadata } from "next";
import SectionWrapper from "@/components/ui/SectionWrapper";
import SupportSwipeDeck from "@/components/give/SupportSwipeDeck";
import { caseOutline } from "@/components/give/BeneficiaryCard";
import { getCasePage } from "@/lib/support-a-future/cases";

export const metadata: Metadata = { title: "Funded needs | Support a Future", alternates: { canonical: null } };

export default async function CaseArchive({ searchParams }: { searchParams: Promise<{ cursor?: string | string[] }> }) {
  const query = await searchParams;
  const cursor = typeof query.cursor === "string" ? query.cursor : null;
  let initial = null;
  try { initial = { ...await getCasePage({ cursor, archive: true }), checkoutEnabled: false }; } catch { /* The browser provides a retryable error. */ }
  return <>
    <SectionWrapper background="cream" reveal={false} className="!pt-40 !pb-12 lg:!pt-48">
      <h1 className="font-[family-name:var(--font-display)] text-4xl tracking-tight text-text-primary sm:text-5xl">Support already given</h1>
      <p className="mt-5 max-w-[620px] text-lg text-text-secondary">Verified needs that reached their funding targets. Stories remain here only while consent and safeguarding approval are current.</p>
      <a className={`${caseOutline} mt-6`} href="/give/support-a-future">Browse open needs</a>
    </SectionWrapper>
    <SectionWrapper background="sand" reveal={false}><SupportSwipeDeck initial={initial} initialCursor={cursor} archive /></SectionWrapper>
  </>;
}
