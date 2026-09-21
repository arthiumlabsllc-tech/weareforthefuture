"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import SectionWrapper, { SectionHeader } from "@/components/ui/SectionWrapper";

/**
 * Phase 7.2: Global error boundary. Next.js App Router renders this when an
 * unhandled error occurs in a server or client component. The default Next.js
 * error page is unstyled and exposes stack traces in development - this
 * provides a branded, user-friendly fallback.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <SectionWrapper background="warm" className="!py-28 md:!py-36">
      <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
        <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400">
          <AlertTriangle className="h-8 w-8" aria-hidden="true" />
        </div>

        <SectionHeader
          overline="Something went wrong"
          title="We hit an unexpected error."
          description="Our team has been notified. Please try again, or head back to a page that works."
        />

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center rounded-full bg-cta px-6 py-3 text-sm font-semibold text-on-cta transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center rounded-full border border-border bg-surface px-6 py-3 text-sm font-semibold text-text-secondary transition hover:border-accent hover:text-accent-text"
          >
            Go home
          </Link>
        </div>

        {process.env.NODE_ENV === "development" && error?.digest && (
          <p className="mt-6 text-xs text-text-tertiary font-mono">
            Error digest: {error.digest}
          </p>
        )}
      </div>
    </SectionWrapper>
  );
}
