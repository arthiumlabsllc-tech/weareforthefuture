import Link from "next/link";
import { ArrowLeft, Calendar, FileText } from "lucide-react";
import LegalContent from "./LegalContent";

type LegalPageShellProps = {
  title: string;
  lastUpdated: Date | string;
  summary: string;
  content: string;
};

/**
 * Shared layout for /privacy, /terms, /cookies.
 * Renders: Back link → title + last-updated → plain-English summary box → full legal text.
 */
export default function LegalPageShell({
  title,
  lastUpdated,
  summary,
  content,
}: LegalPageShellProps) {
  const date =
    typeof lastUpdated === "string" ? new Date(lastUpdated) : lastUpdated;
  const formatted = date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="bg-bg-primary pb-20 pt-8">
      {/* Back link */}
      <div className="mx-auto w-full max-w-3xl px-5 sm:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-text-tertiary transition hover:text-accent-text"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Home</span>
        </Link>
      </div>

      <article className="mx-auto mt-8 w-full max-w-3xl px-5 sm:px-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 text-text-tertiary">
            <FileText className="h-5 w-5" aria-hidden="true" />
            <span className="text-xs font-medium uppercase tracking-wider">
              Legal
            </span>
          </div>
          <h1 className="mt-4 font-[family-name:var(--font-display)] text-[clamp(1.75rem,4vw,2.5rem)] font-bold leading-[1.15] tracking-[-0.02em] text-text-primary">
            {title}
          </h1>
          <div className="mt-4 flex items-center gap-2 text-sm text-text-tertiary">
            <Calendar className="h-4 w-4" aria-hidden="true" />
            <time dateTime={date.toISOString()}>Last updated: {formatted}</time>
          </div>
        </header>

        {/* Plain-English summary box */}
        <aside
          aria-label="Summary"
          className="mb-10 rounded-xl border border-accent/20 bg-accent-subtle p-6"
        >
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-accent-text">
            In plain English
          </h2>
          <p className="text-[0.9375rem] leading-[1.7] text-text-secondary">
            {summary}
          </p>
        </aside>

        {/* Full legal text */}
        <LegalContent content={content} />
      </article>
    </div>
  );
}
