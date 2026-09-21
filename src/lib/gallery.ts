import { img } from "@/lib/imageUrl";

/**
 * Documented data contract for ImpactStory.gallery (Prisma `Json`):
 *   Array<{ url: string, alt: string, caption?: string }>
 * The legacy shape (Array<string> of bare URLs/paths) is still accepted and
 * normalised here so older records keep working.
 */
export interface GalleryImage {
  url: string;
  alt: string;
  caption?: string;
}

/** Resolve a stored path/URL to a deliverable URL (bare local paths -> Cloudinary). */
function toUrl(value: string): string {
  return /^https?:\/\//i.test(value) ? value : img(value);
}

const FALLBACK_ALT = "FTF programme photograph";

/**
 * Normalise ImpactStory.gallery (Prisma Json) into GalleryImage[].
 * Accepts both the documented object shape and the legacy string[] shape, and
 * routes bare local paths through the Cloudinary map so nothing 404s on deploy
 * (public/images is not shipped to Vercel).
 */
export function normalizeGallery(raw: unknown): GalleryImage[] {
  if (!Array.isArray(raw)) return [];
  const out: GalleryImage[] = [];
  for (const item of raw) {
    if (typeof item === "string") {
      if (item.trim()) out.push({ url: toUrl(item), alt: FALLBACK_ALT });
      continue;
    }
    if (item && typeof item === "object") {
      const o = item as Record<string, unknown>;
      const url = typeof o.url === "string" ? o.url : typeof o.src === "string" ? o.src : "";
      if (!url.trim()) continue;
      out.push({
        url: toUrl(url),
        alt: typeof o.alt === "string" && o.alt.trim() ? o.alt : FALLBACK_ALT,
        caption: typeof o.caption === "string" && o.caption.trim() ? o.caption : undefined,
      });
    }
  }
  return out;
}
