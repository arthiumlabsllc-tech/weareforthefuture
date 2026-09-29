"use client";

/* eslint-disable @next/next/no-html-link-for-pages -- Case navigation uses fresh documents to preserve the privacy boundary. */
import SectionWrapper from "@/components/ui/SectionWrapper";
import SupportSwipeDeck from "@/components/give/SupportSwipeDeck";
import type { CasePage } from "@/components/give/case-client";
import { caseOutline, casePrimary } from "@/components/give/BeneficiaryCard";

export default function SupportAFutureClient({ initial, cursor }: { initial: CasePage | null; cursor: string | null }) {
  return (
    <>
      <SectionWrapper background="cream" reveal={false} className="!pt-40 !pb-12 lg:!pt-48">
        <div className="max-w-[620px]">
          <h1 className="font-[family-name:var(--font-display)] text-4xl leading-tight tracking-tight text-text-primary sm:text-5xl">Support a Future</h1>
          <p className="mt-5 text-lg text-text-secondary">Choose a verified need. FTF turns your support into learning, dignity, wellbeing, and opportunity.</p>
          <div className="mt-8 flex flex-wrap gap-3"><a href="#open-needs" className={casePrimary}>Browse verified needs</a><a href="/give/support-a-future/archive" className={caseOutline}>Funded needs</a></div>
        </div>
      </SectionWrapper>

      <SectionWrapper background="sand" reveal={false} className="!py-8">
        <p className="max-w-[620px] text-text-secondary">You fund an approved need, not a private relationship with a child or family. FTF manages all funds and communication. Public stories require consent and independent safeguarding review.</p>
      </SectionWrapper>
      <SectionWrapper id="open-needs" background="white" reveal={false} className="scroll-mt-32">
        <SupportSwipeDeck initial={initial} initialCursor={cursor} />
      </SectionWrapper>

      <SectionWrapper background="cream" reveal={false}>
        <div className="max-w-[620px] space-y-5">
          <h2 className="font-[family-name:var(--font-display)] text-3xl text-text-primary">Your choice, with safeguards</h2>
          <p className="text-text-secondary">Funding closes when a target is met. If another payment clears first, your valid allocation stays with the case. You choose whether to refund the excess or redirect it to the general fund or another eligible case.</p>
          <p className="text-text-secondary">No redirect happens without your consent. With no instruction, an excess refund starts after the 14-day choice window through daily processing. Provider settlement can take additional time.</p>
          <div className="flex flex-wrap gap-3"><a href="/about/safeguarding" className={caseOutline}>Our safeguarding approach</a><a href="/give" className={caseOutline}>All giving routes</a></div>
        </div>
      </SectionWrapper>
    </>
  );
}
