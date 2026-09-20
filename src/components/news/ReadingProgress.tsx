"use client";

// Phase 6.6: reading progress bar — fixed 2px track, accent fill, tracks the
// <article> element. Decorative (aria-hidden); honours prefers-reduced-motion
// by updating instantly with no width transition.
import { useEffect, useState } from "react";

export default function ReadingProgress() {
  const [progress, setProgress] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    setReduceMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const article = document.querySelector("article");

    const update = () => {
      const el = article ?? document.documentElement;
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const scrolled = -rect.top;
      const p = total > 0 ? Math.min(1, Math.max(0, scrolled / total)) : 0;
      setProgress(p);
    };

    const onScroll = () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) update();
      else window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div aria-hidden="true" className="fixed inset-x-0 top-0 z-50 h-0.5 bg-transparent">
      <div
        className={`h-full bg-accent ${reduceMotion ? "" : "transition-[width] duration-75 ease-out"}`}
        style={{ width: `${(progress * 100).toFixed(2)}%` }}
      />
    </div>
  );
}
