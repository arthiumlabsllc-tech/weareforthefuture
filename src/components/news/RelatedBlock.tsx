import Link from "next/link";
import { ArrowRight } from "lucide-react";

// Phase 6.6: reusable Related block - pillar row, programme row (needs the
// pillar to build /our-work/{pillar}/{program}), and tag chips. Unset values
// are omitted silently; if nothing is set the whole block is not rendered.
type RelatedBlockProps = {
  pillar?: { title: string; slug: string } | null;
  program?: { name: string; slug: string } | null;
  tags?: { name: string; slug: string }[];
};

const rowCls =
  "flex items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3 transition-colors hover:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40";

export default function RelatedBlock({ pillar, program, tags = [] }: RelatedBlockProps) {
  const hasRelated = Boolean(pillar) || Boolean(program && pillar);
  if (!hasRelated && tags.length === 0) return null;

  return (
    <aside aria-label="Related to this story" className="mt-14">
      {hasRelated && (
        <div className="rounded-2xl border border-border bg-bg-primary p-6">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-text-tertiary">
            Related
          </h2>
          <div className="space-y-3">
            {pillar && (
              <Link href={`/our-work/${pillar.slug}`} className={rowCls}>
                <span>
                  <span className="block text-[0.6875rem] font-semibold uppercase tracking-wider text-text-muted">
                    Pillar
                  </span>
                  <span className="text-sm font-semibold text-text-primary">{pillar.title}</span>
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-accent-text" aria-hidden="true" />
              </Link>
            )}
            {program && pillar && (
              <Link href={`/our-work/${pillar.slug}/${program.slug}`} className={rowCls}>
                <span>
                  <span className="block text-[0.6875rem] font-semibold uppercase tracking-wider text-text-muted">
                    Programme
                  </span>
                  <span className="text-sm font-semibold text-text-primary">{program.name}</span>
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-accent-text" aria-hidden="true" />
              </Link>
            )}
          </div>
        </div>
      )}

      {tags.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-text-muted">
            Tags
          </span>
          {tags.map((tag) => (
            <Link
              key={tag.slug}
              href={`/news?tag=${tag.slug}`}
              className="inline-flex items-center rounded-full border border-border-strong bg-surface px-3 py-1 text-xs font-medium text-text-secondary transition-colors hover:border-accent hover:text-accent-text focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            >
              {tag.name}
            </Link>
          ))}
        </div>
      )}
    </aside>
  );
}
