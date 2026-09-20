import Link from "next/link";
import { ArrowRight, Heart, Users } from "lucide-react";

// Phase 6.6: reusable closing CTA card (bg-surface + 4px accent left border).
// The solid green fill uses the deep accent token so text stays AA in both
// themes (mid-green #4CB64D has no accessible token-coloured foreground).
export type PostCtaLink = { label: string; href: string };

type PostCTAProps = {
  heading: string;
  description: string;
  primaryCta: PostCtaLink;
  secondaryCta: PostCtaLink;
};

export default function PostCTA({ heading, description, primaryCta, secondaryCta }: PostCTAProps) {
  return (
    <section
      aria-label={heading}
      className="mt-16 rounded-r-2xl rounded-l-lg border-y border-r border-border border-l-4 border-l-accent bg-surface p-7 sm:p-9"
    >
      <h2 className="font-[family-name:var(--font-display)] text-[clamp(1.5rem,3vw,2rem)] font-bold leading-tight text-text-primary">
        {heading}
      </h2>
      <p className="mt-3 max-w-prose text-[1.0625rem] leading-relaxed text-text-secondary">
        {description}
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Link
          href={primaryCta.href}
          className="inline-flex items-center gap-2 rounded-full bg-accent-hover px-6 py-3 text-sm font-bold text-text-inverse transition hover:bg-accent-hover/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        >
          <Heart className="h-4 w-4" aria-hidden="true" />
          {primaryCta.label}
        </Link>
        <Link
          href={secondaryCta.href}
          className="inline-flex items-center gap-2 rounded-full border border-border-strong px-6 py-3 text-sm font-semibold text-text-primary transition-colors hover:border-accent hover:text-accent-text focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        >
          <Users className="h-4 w-4" aria-hidden="true" />
          {secondaryCta.label}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
