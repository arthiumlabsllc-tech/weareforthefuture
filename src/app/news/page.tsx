import type { Metadata } from "next";
import { PrismaClient } from "@prisma/client";
import NewsClient, { type NewsCategory, type NewsPost } from "./NewsClient";

export const metadata: Metadata = {
  title: "News & Stories",
  description:
    "Programme updates, impact stories, partnerships, events and insights from For The Future Organization across Ghana and Nigeria.",
  alternates: { canonical: "/news" },
};

const prisma = new PrismaClient();

/**
 * Phase 6 brief §15 taxonomy — the seven content streams. Used as the build-time
 * fallback when the DB is unreachable so the filter bar still renders the real
 * taxonomy (the DB is the source of truth when reachable).
 */
export const NEWS_CATEGORIES = [
  "Programme Updates",
  "Impact Stories",
  "Partnerships",
  "Events",
  "FTF at 10",
  "Insights",
  "Nigeria",
];

const slugify = (text: string) =>
  text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

// Phase 3b.2 ISR audit: news is CMS-managed content that does not need
// per-request freshness — statically generate + revalidate instead of λ dynamic.
export const revalidate = 300;

export default async function NewsPage() {
  // Guarded: fall back to safe empties if the DB is unreachable (Phase 3a.5).
  const [categories, posts] = await Promise.all([
    prisma.blogCategory
      .findMany({ where: { deletedAt: null }, orderBy: { order: "asc" } })
      .catch((err) => {
        console.error("[/news] category query failed:", err);
        return [];
      }),
    prisma.blogPost
      .findMany({
        where: { published: true, deletedAt: null },
        include: { category: true, tags: true, author: true },
        orderBy: [{ publishDate: "desc" }, { createdAt: "desc" }],
      })
      .catch((err) => {
        console.error("[/news] post query failed:", err);
        return [];
      }),
  ]);

  const initialCategories: NewsCategory[] =
    categories.length > 0
      ? categories.map((c) => ({ name: c.name, slug: c.slug }))
      : NEWS_CATEGORIES.map((name) => ({ name, slug: slugify(name) }));

  const initialPosts: NewsPost[] = posts.map((p) => ({
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt || p.content.replace(/<[^>]*>/g, "").slice(0, 200),
    category: p.category?.name || "Programme Updates",
    categorySlug: p.category?.slug || slugify("Programme Updates"),
    date: (p.publishDate || p.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    author: p.author?.name || "FTF Communications",
    readTime: `${p.readingTime || Math.max(1, Math.ceil(p.content.length / 1500))} min read`,
    image: p.featuredImage || "/images/news/default.jpg",
    featured: p.featured,
    archived: p.archived,
    pillarSlug: p.pillarSlug,
    country: p.country,
    tags: p.tags.map((t) => ({ name: t.name, slug: t.slug })),
  }));

  return <NewsClient initialCategories={initialCategories} initialPosts={initialPosts} />;
}
