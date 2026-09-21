import Link from "next/link";
import { Compass } from "lucide-react";
import SectionWrapper, { SectionHeader } from "@/components/ui/SectionWrapper";

/**
 * Custom 404. Next.js App Router serves this file with a proper `404 Not Found`
 * status automatically (both for unmatched routes and when `notFound()` is
 * called), so no manual status handling is required here.
 */
const quickLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Our Story", href: "/about/our-story" },
  { label: "Our Work", href: "/our-work" },
  { label: "Impact", href: "/impact" },
  { label: "Team & Governance", href: "/about/team" },
  { label: "News", href: "/news" },
  { label: "Contact", href: "/contact" },
];

export default function NotFound() {
  return (
    <SectionWrapper background="warm" className="!py-28 md:!py-36">
      <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
        <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-subtle text-accent-text">
          <Compass className="h-8 w-8" aria-hidden="true" />
        </div>

        <SectionHeader
          overline="404 — Page not found"
          title="This page seems to have wandered off."
          description="The link may be out of date, or the page may have moved as we build out our new home. No worries — everything you need is one click away."
        />

        <nav
          aria-label="Quick links"
          className="flex flex-wrap items-center justify-center gap-3"
        >
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex items-center rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-semibold text-text-secondary transition-all hover:-translate-y-0.5 hover:border-accent hover:text-accent-text hover:shadow-lg hover:shadow-primary/5"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/donate"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-cta px-7 py-3.5 text-sm font-semibold text-on-cta shadow-lg shadow-accent/20 transition-all hover:bg-cta-hover hover:scale-[1.02]"
        >
          Give Now
        </Link>
      </div>
    </SectionWrapper>
  );
}
