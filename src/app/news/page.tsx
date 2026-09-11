import type { Metadata } from "next";
import { PrismaClient } from "@prisma/client";
import NewsClient from "./NewsClient";

export const metadata: Metadata = {
  title: "News & Stories",
  description:
    "Stay updated with the latest news, stories, and updates from For The Future Organization.",
};

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

export default async function NewsPage() {
  const posts = await prisma.blogPost.findMany({
    where: { published: true, deletedAt: null },
    include: { category: true, author: true },
    orderBy: { publishDate: "desc" },
  });

  const articles = posts.map((p) => ({
    title: p.title,
    category: p.category?.name || "News",
    date: (p.publishDate || p.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
    author: p.author?.name || "FTF",
    excerpt: p.excerpt || p.content.replace(/<[^>]*>/g, "").slice(0, 200),
    featured: p.featured,
    readTime: `${p.readingTime || Math.max(1, Math.ceil(p.content.length / 1500))} min read`,
    image: p.featuredImage || "/images/news/default.jpg",
    slug: p.slug,
  }));

  return <NewsClient initialArticles={articles} />;
}
