"use client";

// Phase 6.6: mobile-only sticky Give CTA that appears after 50% page scroll.
// Hidden on lg+ where the in-article CTA card is visible.
import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";

export default function StickyGiveCta() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const total = doc.scrollHeight - window.innerHeight;
      const p = total > 0 ? window.scrollY / total : 0;
      setShow(p > 0.5);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 px-4 py-3 backdrop-blur lg:hidden">
      <Link
        href="/give"
        className="flex w-full items-center justify-center gap-2 rounded-full bg-accent-hover px-5 py-3 text-sm font-bold text-text-inverse transition hover:bg-accent-hover/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
      >
        <Heart className="size-4" aria-hidden="true" />
        Give Now
      </Link>
    </div>
  );
}
