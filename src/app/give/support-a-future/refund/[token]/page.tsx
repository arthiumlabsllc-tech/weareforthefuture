import type { Metadata } from "next";
import SectionWrapper from "@/components/ui/SectionWrapper";
import { getChoiceContext } from "@/lib/support-a-future/resolutions";
import { SupportError } from "@/lib/support-a-future/domain";
import RefundChoicePanel from "./RefundChoicePanel";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Private gift instruction",
  description: "Review your private gift instruction with FTF.",
  robots: { index: false, follow: false, noarchive: true },
  referrer: "no-referrer", alternates: { canonical: null }, openGraph: null, twitter: null,
};

export default async function RefundChoicePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  let context: Awaited<ReturnType<typeof getChoiceContext>> | null = null;
  let unavailable = false;
  try { context = await getChoiceContext(token); }
  catch (error) { unavailable = error instanceof SupportError && error.code === "invalid_link"; }
  return <SectionWrapper background="cream" reveal={false} className="min-h-screen">
    <div className="mx-auto max-w-[620px]">
      <p className="mb-8 border-b border-border pb-4 text-sm font-semibold text-text-primary">For The Future Organization</p>
      {context ? <RefundChoicePanel token={token} initial={context} /> : <div className="space-y-4" role="status">
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-text-primary">{unavailable ? "This private link is unavailable" : "We could not load your gift"}</h1>
        <p className="text-text-secondary">{unavailable ? "The link may have expired or been replaced. Contact FTF for help checking your gift." : "Please reload this page or contact FTF. No choice was recorded by opening this page."}</p>
      </div>}
      <footer className="mt-8 space-y-4 border-t border-border pt-6 text-sm text-text-secondary">
        <p>Keep this link private. FTF administers all support and communications.</p>
        <div className="flex flex-wrap gap-6">
          <a href="mailto:info@weareforthefuture.org" rel="noreferrer" className="inline-flex min-h-11 items-center text-text-link underline">Send us a message</a>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- Leave the bearer document through a clean, referrer-free navigation. */}
          <a href="/give" rel="noreferrer" referrerPolicy="no-referrer" className="inline-flex min-h-11 items-center text-text-link underline">Return to giving</a>
        </div>
      </footer>
    </div>
  </SectionWrapper>;
}
