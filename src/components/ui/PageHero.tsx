"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, type LucideIcon } from "lucide-react";
import { img } from "@/lib/imageUrl";
import SectionWrapper from "@/components/ui/SectionWrapper";

/**
 * PageHero — the approved split editorial hero pattern (see DESIGN.md §4 and the
 * ftf-design-system hero reference), reused across interior content pages so they
 * match the About page instead of the old full-bleed blue-overlay hero.
 *
 * Layout: warm cream band, text column on the left (eyebrow + Playfair H1 + lede +
 * optional CTAs), the page's photograph as a framed rounded card on the right.
 *
 * Motion: the text column is the LCP element and is rendered fully static (the
 * section wrapper uses `reveal={false}`); only the image card carries a one-shot
 * entrance, gated on prefers-reduced-motion.
 */
export default function PageHero({
  eyebrow,
  eyebrowIcon: EyebrowIcon,
  title,
  description,
  meta,
  image,
  imageAlt,
  actions,
  backLink,
}: {
  eyebrow: string;
  eyebrowIcon?: LucideIcon;
  title: ReactNode;
  description?: ReactNode;
  /** Optional chips row rendered below the lede (e.g. location / commitment / safeguarding). */
  meta?: ReactNode;
  /** Path under /images, resolved through img() (watermark-free Cloudinary crop). */
  image: string;
  imageAlt: string;
  actions?: ReactNode;
  /** Optional "back to ..." link rendered above the eyebrow. */
  backLink?: { href: string; label: string };
}) {
  const reduceMotion = useReducedMotion();

  return (
    <SectionWrapper background="cream" reveal={false} className="overflow-hidden">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          {backLink ? (
            <Link
              href={backLink.href}
              className="mb-6 inline-flex items-center gap-1.5 text-sm text-text-secondary transition-colors hover:text-accent-text"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              {backLink.label}
            </Link>
          ) : null}
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-accent-text">
            {EyebrowIcon ? <EyebrowIcon className="h-4 w-4" aria-hidden="true" /> : null}
            {eyebrow}
          </span>
          <h1 className="mt-5 font-[family-name:var(--font-display)] text-4xl font-bold leading-[1.1] text-text-primary sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          {description ? (
            <div className="mt-6 max-w-xl text-lg leading-relaxed text-text-secondary">
              {description}
            </div>
          ) : null}
          {meta ? (
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-text-secondary">
              {meta}
            </div>
          ) : null}
          {actions ? (
            <div className="mt-8 flex flex-wrap items-center gap-3">{actions}</div>
          ) : null}
        </div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{
            duration: reduceMotion ? 0 : 0.6,
            delay: reduceMotion ? 0 : 0.15,
            ease: "easeOut",
          }}
          className="relative"
        >
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-border shadow-xl shadow-primary/5">
            <Image
              src={img(image)}
              alt={imageAlt}
              fill
              className="object-cover"
              priority
              unoptimized
            />
          </div>
        </motion.div>
      </div>
    </SectionWrapper>
  );
}
