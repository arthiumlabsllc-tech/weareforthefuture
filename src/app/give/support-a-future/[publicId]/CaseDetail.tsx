"use client";

/* eslint-disable @next/next/no-html-link-for-pages -- Case routes require document navigation to preserve the privacy boundary. */
import { useState } from "react";
import { BookOpen } from "lucide-react";
import SectionWrapper from "@/components/ui/SectionWrapper";
import { CaseProgress, caseOutline, casePrimary } from "@/components/give/BeneficiaryCard";
import SupportDrawer from "@/components/give/SupportDrawer";
import { useCaseHydrated, useFreshCase, type CaseDetail as Detail } from "@/components/give/case-client";
import { cardClasses, cardPadding } from "@/lib/ui/cardClasses";

export default function CaseDetail({ publicId, initial, failed }: { publicId: string; initial: Detail | null; failed: boolean }) {
  const { detail, pending, error, refresh } = useFreshCase(publicId, initial, failed ? "Case details could not be loaded." : "");
  const hydrated = useCaseHydrated();
  const [open, setOpen] = useState(false);
  const record = detail?.case;
  return <>
    <SectionWrapper background="cream" reveal={false} className="!pt-40 lg:!pt-48">
      <div className="mx-auto max-w-[1200px]">
        <a href="/give/support-a-future" className={caseOutline}>Browse open needs</a>
        <div id="case-detail-content" tabIndex={-1} className="mt-8" aria-busy={pending}>
          {pending ? <><h1 className="font-[family-name:var(--font-display)] text-4xl">Verified need</h1><p role="status" className="mt-4 text-text-secondary">Checking current consent and funding…</p></> : error ? <><h1 className="font-[family-name:var(--font-display)] text-4xl">Case details could not be loaded</h1><p role="alert" className="mt-4 text-error-text">Please reconnect and retry. No funding balance is available.</p></> : !record ? <><h1 className="font-[family-name:var(--font-display)] text-4xl">This case is unavailable</h1><p className="mt-4 max-w-[620px] text-text-secondary">The case cannot currently be shown. You can browse other approved needs or explore another giving route.</p></> : <div className="grid items-start gap-8 lg:grid-cols-[3fr_2fr] lg:gap-12">
            <article className="min-w-0 max-w-[620px] space-y-6">
              <div className="flex items-center gap-3 text-accent-text"><BookOpen aria-hidden="true" className="h-7 w-7" /><p className="text-sm">{record.needType}</p></div>
              <h1 className="break-words font-[family-name:var(--font-display)] text-4xl leading-tight tracking-tight text-text-primary sm:text-5xl">{record.displayName}</h1>
              <p className="text-text-secondary">{record.region}{record.age !== null ? ` · Age ${record.age}` : ""} · {record.publicId}</p>
              <p className="text-lg text-text-secondary">{record.storyShort}</p>
              <h2 className="font-[family-name:var(--font-display)] text-2xl text-text-primary">The verified need</h2>
              <p className="whitespace-pre-line break-words text-text-secondary">{record.needDescription}</p>
              <h2 className="font-[family-name:var(--font-display)] text-2xl text-text-primary">The story and next steps</h2>
              <p className="whitespace-pre-line break-words text-text-secondary">{record.storyFull}</p>
            </article>
            <aside className={`${cardClasses} ${cardPadding.compact} space-y-6`} aria-label="Funding progress">
              <h2 className="font-[family-name:var(--font-display)] text-2xl text-text-primary">Support administered by FTF</h2>
              <CaseProgress record={record} />
              <p className="text-text-secondary">Your contribution supports this approved need. FTF manages delivery and all communication.</p>
              {!detail.fundable && <p className="rounded-xl bg-info-bg p-4 text-info-text">This need is not accepting new support.</p>}
              {detail.fundable && !detail.checkoutEnabled && <p className="rounded-xl bg-info-bg p-4 text-info-text">Case giving is not open yet.</p>}
              {hydrated && detail.fundable && <button type="button" className={`${casePrimary} w-full`} onClick={() => setOpen(true)}>Support this need</button>}
              <p className="text-sm text-text-secondary">No beneficiary photo is displayed. Public content remains subject to consent and safeguarding review.</p>
            </aside>
          </div>}
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          {hydrated && <button type="button" className={caseOutline} aria-disabled={pending} onClick={() => { if (!pending) void refresh(); }}>Check current status</button>}
          <a href="/give" className={caseOutline}>All giving routes</a>
        </div>
        <noscript><p className="mt-6 text-text-secondary">This story is readable without JavaScript. Enable JavaScript to open the support drawer; viewing this page never charges you.</p></noscript>
      </div>
    </SectionWrapper>
    <SectionWrapper background="sand" reveal={false} className="!py-12"><p className="max-w-[620px] text-text-secondary">Funding a need does not create a private relationship with a child or family. Read <a className="text-text-link underline" href="/about/safeguarding">our safeguarding approach</a>.</p></SectionWrapper>
    {open && <SupportDrawer publicId={publicId} onClose={() => setOpen(false)} />}
  </>;
}
