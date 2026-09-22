"use client";

import { useEffect, useRef, useState } from "react";
import { journeyStages } from "@/data/pillars";

/**
 * "How FTF changes a future" - the theory of change made visual.
 *
 * Seven stages from `journeyStages`, rendered as a horizontal icon-row with a
 * connecting green progress line on desktop and a vertical stepper on mobile
 * (decision 4A).
 *
 * Phase 12 Step 5 (C2): the fill is now SCROLL-LINKED, not a time-based reveal.
 * As the section scrolls, the progress line grows (scaleX desktop / scaleY
 * mobile) and each node activates in sequence when the fill reaches it
 * (outline -> filled, muted -> primary label, description fades in). Activation
 * is monotonic - once a node is active it stays active on scroll-up.
 *
 * Motion rules (DESIGN.md §8 "scroll-linked progress"):
 *  - transform-only fill, rAF-throttled passive scroll listener, resize debounced
 *  - node activation transitions are 300ms colour/opacity only (no lift)
 *  - prefers-reduced-motion: fill renders at 100%, all nodes active, no transitions
 *  - never a numeric count-up
 */
export default function JourneyStepper() {
  const total = journeyStages.length;
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  // SSR/no-JS is fully readable. Enhancement only starts for motion-enabled users.
  const [animated, setAnimated] = useState(false);
  const [activeCount, setActiveCount] = useState(total);

  useEffect(() => {
    const root = rootRef.current;
    const track = trackRef.current;
    const fill = fillRef.current;
    if (!root || !track || !fill) return;

    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const desktopPreference = window.matchMedia("(min-width: 1024px)");
    const nodes = Array.from(root.querySelectorAll<HTMLElement>(".journey-node"));
    let dispose = () => {};

    const configure = () => {
      dispose();
      const reduced = motionPreference.matches;
      setAnimated(!reduced);
      setActiveCount(reduced ? total : 0);
      let reached = 0;
      let frame = 0;
      let lastFrame = -Infinity;
      let resizeTimer: ReturnType<typeof setTimeout> | undefined;
      let disposed = false;
      let desktop = desktopPreference.matches;
      let start = 0;
      let distance = 1;
      let milestones: number[] = [];
      let observers: IntersectionObserver[] = [];
      let previousProgress = -1;

      const activate = (count: number) => {
        if (count > reached) {
          reached = count;
          setActiveCount(count);
        }
      };

      const update = () => {
        const traveled = window.scrollY - start;
        const progress = reduced ? 1 : Math.min(1, Math.max(0, traveled / distance));
        if (progress !== previousProgress) {
          fill.style.transform = `${desktop ? "scaleX" : "scaleY"}(${progress})`;
          fill.style.willChange = !reduced && progress > 0 && progress < 1 ? "transform" : "auto";
          previousProgress = progress;
        }
        // Also catches restored positions and fast jumps that skip an IO crossing.
        if (!reduced) activate(milestones.filter((offset) => traveled + 0.5 >= offset).length);
      };

      const tick = (time: number) => {
        if (time - lastFrame < 16) {
          frame = requestAnimationFrame(tick);
          return;
        }
        frame = 0;
        lastFrame = time;
        update();
      };
      const schedule = () => {
        if (!disposed && !frame) frame = requestAnimationFrame(tick);
      };

      const measure = () => {
        if (disposed) return;
        desktop = desktopPreference.matches;
        const rect = root.getBoundingClientRect();
        const boxes = nodes.map((node) => node.getBoundingClientRect());
        const first = boxes[0];
        const last = boxes[total - 1];
        if (!first || !last) return;
        // Layout offsets exclude the ancestor's one-shot translateY entrance.
        let sectionTop = 0;
        let ancestor: HTMLElement | null = root;
        while (ancestor) {
          sectionTop += ancestor.offsetTop;
          ancestor = ancestor.offsetParent as HTMLElement | null;
        }
        const firstY = first.top - rect.top + first.height / 2;
        const lastY = last.top - rect.top + last.height / 2;
        const firstX = first.left - rect.left + first.width / 2;
        const lastX = last.left - rect.left + last.width / 2;
        track.style.left = `${firstX - (desktop ? 0 : 1)}px`;
        track.style.top = `${firstY - (desktop ? 2 : 0)}px`;
        track.style.width = desktop ? `${lastX - firstX}px` : "2px";
        track.style.height = desktop ? "4px" : `${lastY - firstY}px`;
        track.style.bottom = "auto";
        track.style.right = "auto";
        root.dataset.layout = desktop ? "horizontal" : "vertical";
        const vh = window.innerHeight;
        if (desktop) {
          // Approved visible sequence: row travels from fully visible to 160px
          // below the top, clear of the fixed navigation. No pinning or scroll-jacking.
          const entryTop = Math.max(224, vh - rect.height - 24);
          start = sectionTop - entryTop;
          distance = entryTop - 160;
          milestones = nodes.map((_, i) => distance * i / (total - 1));
        } else {
          start = sectionTop + firstY - vh / 2;
          distance = Math.max(1, lastY - firstY);
          milestones = boxes.map((box) => box.top - rect.top + box.height / 2 - firstY);
        }
        observers.forEach((observer) => observer.disconnect());
        observers = [];
        if (!reduced && !desktop && "IntersectionObserver" in window) {
          observers = nodes.map((node, i) => {
            const observer = new IntersectionObserver(([entry]) => {
              if (entry.isIntersecting && entry.intersectionRatio >= 0.5 &&
                  entry.boundingClientRect.top + entry.boundingClientRect.height / 2 <= vh / 2 + 0.5) {
                activate(i + 1);
                observer.disconnect();
              }
            }, { rootMargin: `0px 0px -${vh / 2}px 0px`, threshold: 0.5 });
            observer.observe(node);
            return observer;
          });
        }
        previousProgress = -1;
        update();
      };
      const onResize = () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(measure, 150);
      };
      measure();
      if (!reduced) window.addEventListener("scroll", schedule, { passive: true });
      window.addEventListener("resize", onResize, { passive: true });
      window.addEventListener("pageshow", onResize);
      root.closest("main")?.addEventListener("load", onResize, true);
      const resizeObserver = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(onResize);
      resizeObserver?.observe(root);
      if (root.closest("main")) resizeObserver?.observe(root.closest("main")!);
      void document.fonts.ready.then(() => { if (!disposed) onResize(); });

      dispose = () => {
        disposed = true;
        cancelAnimationFrame(frame);
        clearTimeout(resizeTimer);
        observers.forEach((observer) => observer.disconnect());
        resizeObserver?.disconnect();
        window.removeEventListener("scroll", schedule);
        window.removeEventListener("resize", onResize);
        window.removeEventListener("pageshow", onResize);
        root.closest("main")?.removeEventListener("load", onResize, true);
      };
    };
    configure();
    motionPreference.addEventListener("change", configure);
    return () => {
      dispose();
      motionPreference.removeEventListener("change", configure);
    };
  }, [total]);

  return (
    <div ref={rootRef} className="journey-stepper relative" data-animated={animated}>
      <div ref={trackRef} className="journey-track absolute rounded-full bg-journey-track" aria-hidden="true">
        <div ref={fillRef} className="journey-fill absolute inset-0 rounded-full bg-journey-fill" />
      </div>
      <ol role="list" aria-label="How FTF changes a future" className="relative grid gap-y-6 lg:grid-cols-7">
        {journeyStages.map((stage, i) => (
          <li
            key={stage.id}
            data-active={!animated || i < activeCount}
            aria-current={animated && i === activeCount - 1 ? "step" : undefined}
            className="relative pl-12 lg:px-1 lg:text-center"
          >
            <span
              aria-hidden="true"
              className="journey-node absolute left-0 top-0 z-10 flex h-9 w-9 items-center justify-center rounded-full border-2 font-[family-name:var(--font-display)] text-base font-bold shadow-sm lg:relative lg:mx-auto lg:h-12 lg:w-12 lg:text-lg"
            >
              {i + 1}
            </span>
            <h3 className="journey-label text-sm font-semibold leading-snug lg:mt-3">
              <span className="sr-only">{`Step ${i + 1} of ${total}: `}</span>
              {stage.label}
            </h3>
            <p className="journey-description mt-1 text-xs leading-relaxed text-text-tertiary">
              {stage.description}
            </p>
          </li>
        ))}
      </ol>
      <style jsx>{`
        .journey-track { left: 17px; top: 18px; bottom: 18px; width: 2px; }
        .journey-fill { transform-origin: top; transition: none; }
        .journey-node {
          background-color: var(--ftf-journey-node-active);
          border-color: var(--ftf-journey-node-active);
          color: var(--ftf-selection-text);
          transition: background-color 300ms ease-out, border-color 300ms ease-out, color 300ms ease-out;
        }
        .journey-label { color: var(--ftf-text-primary); transition: color 300ms ease-out; }
        .journey-description { transition: opacity 300ms ease-out; }
        @media (prefers-reduced-motion: no-preference) {
          [data-animated="true"] [data-active="false"] .journey-node {
            background-color: var(--ftf-surface);
            border-color: var(--ftf-journey-node);
            color: var(--ftf-journey-node);
          }
          [data-animated="true"] [data-active="false"] .journey-label { color: var(--ftf-text-tertiary); }
          [data-animated="true"] [data-active="false"] .journey-description { opacity: 0; }
        }
        @media (min-width: 1024px) {
          .journey-track { top: 22px; left: ${100 / (total * 2)}%; right: ${100 / (total * 2)}%; bottom: auto; width: auto; height: 4px; }
          .journey-fill { transform-origin: left; }
        }
        @media (prefers-reduced-motion: reduce) {
          .journey-stepper, .journey-stepper * { transition: none !important; animation: none !important; }
          .journey-fill { transform: none !important; }
        }
      `}</style>
    </div>
  );
}
