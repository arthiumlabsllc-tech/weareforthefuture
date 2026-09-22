"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import type { GalleryImage } from "@/lib/gallery";

/**
 * One gallery tile: skeleton placeholder while loading, graceful hide on error,
 * lazy-loaded, and a real <button> so keyboard users can reach it.
 */
function Tile({ image, onOpen, className }: { image: GalleryImage; onOpen: () => void; className?: string }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Open photo: ${image.alt}`}
      className={`group relative block overflow-hidden rounded-2xl bg-bg-tertiary ${className ?? ""}`}
    >
      {!loaded && <span aria-hidden="true" className="absolute inset-0 animate-pulse bg-bg-tertiary" />}
      <Image
        src={image.url}
        alt={image.alt}
        fill
        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 82vw"
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        className={`object-cover transition-[opacity,transform] duration-500 group-hover:scale-105 ${loaded ? "opacity-100" : "opacity-0"}`}
      />
    </button>
  );
}

/**
 * Phase 8.10 - reusable, accessible impact photo gallery.
 * Grid on desktop (2–3 cols, aspect-square), swipeable snap carousel on mobile,
 * and a keyboard-navigable lightbox (arrows / Escape / swipe, focus-trapped).
 * Images are FTF's own consent-gated, published programme photos; alt text and
 * captions carry no identifying details for minors.
 */
export default function ImpactGallery({ images }: { images: GalleryImage[] }) {
  const [index, setIndex] = useState<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const touchX = useRef<number | null>(null);

  const open = index !== null;
  const close = useCallback(() => setIndex(null), []);
  const step = useCallback(
    (d: number) => setIndex((i) => (i === null ? i : (i + d + images.length) % images.length)),
    [images.length]
  );

  // Lightbox keyboard: Escape closes, arrows navigate, Tab is trapped inside.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
      else if (e.key === "Tab" && panelRef.current) {
        const f = panelRef.current.querySelectorAll<HTMLElement>("button, [href]");
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close, step]);

  // Focus the close button on open; lock body scroll while the lightbox is up.
  useEffect(() => {
    if (open) {
      closeRef.current?.focus();
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!images.length) return null;
  const current = open ? images[index as number] : null;

  return (
    <>
      {/* Mobile: swipeable snap carousel */}
      <div role="group" aria-label="Photo gallery" className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 sm:hidden">
        {images.map((im, i) => (
          <Tile key={im.url} image={im} onOpen={() => setIndex(i)} className="aspect-square w-[82%] shrink-0 snap-center" />
        ))}
      </div>

      {/* Desktop / tablet: grid */}
      <div role="group" aria-label="Photo gallery" className="hidden gap-3 sm:grid grid-cols-2 lg:grid-cols-3">
        {images.map((im, i) => (
          <Tile key={im.url} image={im} onOpen={() => setIndex(i)} className="aspect-square" />
        ))}
      </div>

      {/* Lightbox */}
      {open && current && (
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Photo gallery lightbox"
          onClick={(e) => { if (e.target === e.currentTarget) close(); }}
          onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
          onTouchEnd={(e) => {
            if (touchX.current === null) return;
            const dx = e.changedTouches[0].clientX - touchX.current;
            if (Math.abs(dx) > 48) step(dx < 0 ? 1 : -1);
            touchX.current = null;
          }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
        >
          <button
            ref={closeRef}
            onClick={close}
            aria-label="Close lightbox"
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <X className="h-6 w-6" aria-hidden="true" />
          </button>
          <button
            onClick={() => step(-1)}
            aria-label="Previous photo"
            className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:left-4"
          >
            <ChevronLeft className="h-6 w-6" aria-hidden="true" />
          </button>
          <button
            onClick={() => step(1)}
            aria-label="Next photo"
            className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:right-4"
          >
            <ChevronRight className="h-6 w-6" aria-hidden="true" />
          </button>

          <div className="relative h-[58vh] w-full max-w-4xl sm:h-[68vh]">
            <Image src={current.url} alt={current.alt} fill sizes="100vw" priority className="object-contain" />
          </div>
          {current.caption && (
            <p className="mt-4 max-w-xl text-center text-sm leading-relaxed text-white/80">{current.caption}</p>
          )}
          <p className="mt-2 text-xs tabular-nums text-white/50">{(index as number) + 1} / {images.length}</p>
        </div>
      )}
    </>
  );
}
