import Link from "next/link";
import { Compass, ArrowRight, Heart } from "lucide-react";
import { pillars } from "@/data/pillars";

/**
 * Served by the App Router with a 404 status when `notFound()` fires from an
 * /our-work route (e.g. an unknown pillar slug). Pillar-focused so a mistyped
 * or not-yet-published pillar lands somewhere helpful.
 */
export default function OurWorkNotFound() {
  return (
    <section className="bg-bg-primary py-28 md:py-36">
      <div className="mx-auto flex max-w-2xl flex-col items-center px-6 text-center lg:px-8">
        <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-subtle text-accent-text">
          <Compass className="h-8 w-8" aria-hidden="true" />
        </div>
        <span className="text-xs font-semibold uppercase tracking-[0.25em] text-accent-text">
          404 — Our Work
        </span>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold leading-tight text-text-primary sm:text-4xl">
          This pillar hasn&apos;t been published yet.
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-text-secondary">
          The link may be out of date, or this part of our work is still being
          built. Explore the five pillars below — everything we do sits within one
          of them.
        </p>

        <ul className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
          {pillars.map((pillar) => (
            <li key={pillar.id}>
              <Link
                href={`/our-work/${pillar.id}`}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold text-text-secondary transition-all hover:-translate-y-0.5 hover:border-accent hover:text-accent-text"
              >
                <pillar.icon aria-hidden="true" className="h-4 w-4" />
                {pillar.title}
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/our-work"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-3.5 text-base font-semibold text-text-on-primary shadow-lg shadow-primary/20 transition-all hover:bg-primary-hover hover:scale-[1.02]"
          >
            Back to Our Work
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link
            href="/donate"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-cta px-7 py-3.5 text-base font-semibold text-on-cta shadow-lg shadow-accent/20 transition-all hover:bg-cta-hover hover:scale-[1.02]"
          >
            <Heart className="h-5 w-5" aria-hidden="true" />
            Give Now
          </Link>
        </div>
      </div>
    </section>
  );
}
