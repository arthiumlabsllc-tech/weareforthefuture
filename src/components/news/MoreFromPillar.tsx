import Link from "next/link";
import Image from "next/image";
import { Calendar } from "lucide-react";
import { prisma } from "@/lib/db";

// Phase 6.6: "More from this pillar" — 3 recent published posts sharing the
// current post's pillar, topped up with other recent posts when the pillar has
// fewer (or none) siblings. Cards show image, title and date only.
type MoreFromPillarProps = {
  currentSlug: string;
  pillarId: string | null;
};

const select = {
  slug: true,
  title: true,
  featuredImage: true,
  publishDate: true,
  createdAt: true,
} as const;

export default async function MoreFromPillar({ currentSlug, pillarId }: MoreFromPillarProps) {
  const siblings = pillarId
    ? await prisma.blogPost
        .findMany({
          where: { published: true, deletedAt: null, pillarId, slug: { not: currentSlug } },
          orderBy: { publishDate: "desc" },
          take: 3,
          select,
        })
        .catch(() => [])
    : [];

  let posts = siblings;
  if (posts.length < 3) {
    const fill = await prisma.blogPost
      .findMany({
        where: {
          published: true,
          deletedAt: null,
          slug: { notIn: [currentSlug, ...posts.map((p) => p.slug)] },
        },
        orderBy: { publishDate: "desc" },
        take: 3 - posts.length,
        select,
      })
      .catch(() => []);
    posts = [...posts, ...fill];
  }

  if (!posts.length) return null;

  return (
    <section aria-labelledby="more-from-pillar" className="mt-16">
      <h2
        id="more-from-pillar"
        className="text-xs font-semibold uppercase tracking-[0.18em] text-text-tertiary"
      >
        {pillarId && siblings.length ? "More from this pillar" : "More stories"}
      </h2>

      <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((p) => {
          const date = (p.publishDate || p.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          });
          return (
            <Link
              key={p.slug}
              href={`/news/${p.slug}`}
              className="group overflow-hidden rounded-2xl border border-border bg-surface transition-colors hover:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            >
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-bg-tertiary">
                <Image
                  src={p.featuredImage || "/images/news/default.jpg"}
                  alt={p.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  unoptimized
                />
              </div>
              <div className="p-4">
                <h3 className="line-clamp-2 text-sm font-bold leading-snug text-text-primary transition-colors group-hover:text-accent-text">
                  {p.title}
                </h3>
                <span className="mt-2 flex items-center gap-1.5 text-xs text-text-tertiary">
                  <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                  {date}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
