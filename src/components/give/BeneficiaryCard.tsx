import { BookOpen } from "lucide-react";
import { formatGhs, type PublicBeneficiaryCase } from "@/lib/support-a-future/domain";
import { cardClasses, cardPadding } from "@/lib/ui/cardClasses";

export const caseAction = "inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 aria-disabled:cursor-wait aria-disabled:opacity-60";
export const caseOutline = `${caseAction} border-2 border-border text-text-secondary hover:border-primary hover:bg-bg-tertiary`;
export const casePrimary = `${caseAction} bg-cta text-on-cta hover:bg-cta-hover`;

export function CaseProgress({ record }: { record: PublicBeneficiaryCase }) {
  const percent = Math.min(100, Math.max(0, record.amountRaised / record.amountNeeded * 100));
  return <div className="space-y-3">
    <dl className="flex flex-wrap justify-between gap-4 tabular-nums">
      <div><dt className="text-sm text-text-secondary">Credited support</dt><dd className="text-2xl font-semibold text-text-primary">{formatGhs(record.amountRaised)}</dd></div>
      <div><dt className="text-sm text-text-secondary">Verified target</dt><dd className="text-2xl font-semibold text-text-primary">{formatGhs(record.amountNeeded)}</dd></div>
    </dl>
    <div role="progressbar" aria-label={`Funding for ${record.displayName}`} aria-valuemin={0} aria-valuemax={record.amountNeeded} aria-valuenow={record.amountRaised}
      aria-valuetext={`${formatGhs(record.amountRaised)} credited toward ${formatGhs(record.amountNeeded)}`} className="h-2.5 overflow-hidden rounded-full bg-journey-track">
      <div className="h-full origin-left rounded-full bg-accent" style={{ width: `${percent}%` }} />
    </div>
    <p className="text-sm tabular-nums text-text-secondary">{record.amountRaised === record.amountNeeded ? "This verified need is funded." : `${formatGhs(record.amountNeeded - record.amountRaised)} remaining`}</p>
  </div>;
}

export default function BeneficiaryCard({ record, archive = false, onSupport, interactive = false }: {
  record: PublicBeneficiaryCase; archive?: boolean; onSupport?: () => void; interactive?: boolean;
}) {
  return <article className={`${cardClasses} ${cardPadding.compact} h-full space-y-6 sm:p-8`} aria-labelledby={`case-${record.publicId}`}>
    <header className="flex items-start gap-4">
      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-accent-subtle text-accent-text"><BookOpen aria-hidden="true" className="h-7 w-7" /></span>
      <div className="min-w-0">
        <p className="text-sm text-text-secondary">{record.needType}</p>
        <h3 id={`case-${record.publicId}`} className="break-words font-[family-name:var(--font-display)] text-2xl leading-tight text-text-primary">{record.displayName}</h3>
        <p className="mt-2 text-sm text-text-secondary">{record.region}{record.age !== null ? ` · Age ${record.age}` : ""}</p>
      </div>
    </header>
    <p className="text-text-secondary">{record.storyShort}</p>
    <div className="border-l-2 border-primary pl-4">
      <p className="mb-1 text-sm font-semibold text-text-primary">The verified need</p>
      <p className="whitespace-pre-line break-words text-text-secondary">{record.needDescription}</p>
    </div>
    <CaseProgress record={record} />
    <div className="flex flex-wrap gap-3">
      {!archive && interactive && onSupport && <button type="button" className={casePrimary} onClick={onSupport} aria-label={`Support ${record.displayName}, ${record.publicId}`}>Support</button>}
      <a className={caseOutline} href={`/give/support-a-future/${encodeURIComponent(record.publicId)}`}>View details<span className="sr-only"> for {record.displayName}, {record.publicId}</span></a>
    </div>
    <p className="text-xs text-text-secondary">{record.publicId} · FTF-administered support · No beneficiary photo</p>
  </article>;
}
