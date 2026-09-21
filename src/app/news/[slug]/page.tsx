import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { PrismaClient } from "@prisma/client";
import { ArrowLeft, Calendar, Clock, MapPin, Tag, User } from "lucide-react";
import PostBody from "@/components/news/PostBody";
import RelatedBlock from "@/components/news/RelatedBlock";
import PostCTA from "@/components/news/PostCTA";
import MoreFromPillar from "@/components/news/MoreFromPillar";
import ReadingProgress from "@/components/news/ReadingProgress";
import ShareButtons from "@/components/news/ShareButtons";
import StickyGiveCta from "@/components/news/StickyGiveCta";

const prisma = new PrismaClient();

// CMS-managed content: statically generate + revalidate (matches /news).
export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

/** Pre-render every published post so article URLs are static at build time. */
export async function generateStaticParams() {
  const posts = await prisma.blogPost
    .findMany({ where: { published: true, deletedAt: null }, select: { slug: true } })
    .catch(() => [] as { slug: string }[]);
  return posts.map((p) => ({ slug: p.slug }));
}

const loadPost = (slug: string) =>
  prisma.blogPost
    .findUnique({
      where: { slug },
      include: { category: true, tags: true, author: true, pillar: true, program: true },
    })
    .catch(() => null);

/** Plain-text view of CMS content, for word count / reading time. */
const plainText = (content: string): string =>
  content
    .replace(/<[^>]*>/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_`-]/g, " ")
    .replace(/&[a-z#0-9]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await loadPost(decodeURIComponent(slug));
  if (!post || !post.published) {
    return { title: "Story not found | News & Stories", robots: { index: false, follow: false } };
  }
  const description =
    post.metaDescription ||
    post.excerpt ||
    `${post.title} - a story from For The Future Organization.`;
  const image = post.ogImage || post.featuredImage;
  return {
    title: post.metaTitle || `${post.title} | News & Stories`,
    description,
    alternates: { canonical: `/news/${post.slug}` },
    openGraph: {
      title: post.title,
      description,
      type: "article",
      ...(image ? { images: [{ url: image }] } : {}),
    },
    robots: { index: true, follow: true },
  };
}

export default async function NewsPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await loadPost(decodeURIComponent(slug));
  if (!post || !post.published || post.deletedAt) notFound();

  const published = post.publishDate || post.createdAt;
  const date = published.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const author = post.author?.name || "FTF Communications";
  const words = plainText(post.content).split(" ").filter(Boolean).length;
  const minutes = post.readingTime || Math.max(1, Math.ceil(words / 200));
  const readTime = `${minutes} min read`;
  const heroImage = post.featuredImage;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.metaDescription || post.excerpt || undefined,
    image: post.ogImage || post.featuredImage || undefined,
    datePublished: published.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: { "@type": "Organization", name: author },
    publisher: { "@type": "Organization", name: "For The Future Organization" },
    mainEntityOfPage: { "@type": "WebPage", "@id": `/news/${post.slug}` },
    wordCount: words,
    timeRequired: `PT${minutes}M`,
    ...(post.tags.length
      ? { keywords: post.tags.map((t) => t.name).join(", ") }
      : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        // Escape "<" so CMS-sourced strings can never break out of the script tag.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <ReadingProgress />

      <div className="bg-bg-primary pb-20 pt-8 sm:pt-10 lg:pb-28">
        <div className="mx-auto w-full max-w-6xl px-5 sm:px-6 lg:px-8">
          {/* Back link - above the hero, muted, arrow-left */}
          <Link
            href="/news"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-text-tertiary transition-colors hover:text-accent-text focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to News
          </Link>

          <article className="mt-6">
            {/* Hero - contained, 16:9, max 1200px */}
            {heroImage && (
              <div className="relative mx-auto aspect-[16/9] w-full max-w-[1200px] overflow-hidden rounded-2xl bg-bg-tertiary">
                <Image
                  src={heroImage}
                  alt={post.title}
                  fill
                  priority
                  sizes="(max-width: 1200px) 100vw, 1200px"
                  className="object-cover"
                  unoptimized
                />
              </div>
            )}

            {/* Reading column - measured at ~72 characters per line with Inter
                18px (CSS `ch` is the "0" glyph, ~25% wider than Inter's average
                prose glyph, so 70ch/720px rendered 83+ characters). 620px keeps
                the measure inside the required 65-75 range and under 720px. */}
            <div className="mx-auto mt-8 w-full max-w-[620px] sm:mt-10">
              <header>
                <div className="flex flex-wrap items-center gap-2">
                  {post.category && (
                    <Link
                      href={`/news?category=${post.category.slug}`}
                      title={`More in ${post.category.name}`}
                      className="inline-flex items-center gap-1 rounded-full bg-accent-subtle px-3 py-1 text-xs font-semibold text-accent-text transition-colors hover:bg-accent/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                    >
                      <Tag className="h-3 w-3" aria-hidden="true" />
                      {post.category.name}
                    </Link>
                  )}
                  {post.country && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-bg-tertiary px-3 py-1 text-xs font-medium text-text-secondary">
                      <MapPin className="h-3 w-3" aria-hidden="true" />
                      {post.country}
                    </span>
                  )}
                </div>

                <h1 className="mt-5 font-[family-name:var(--font-display)] text-[clamp(1.75rem,6vw,2rem)] font-bold leading-[1.15] tracking-[-0.02em] text-text-primary md:text-[clamp(2rem,4.5vw,2.5rem)] lg:text-[clamp(2.25rem,5vw,3.815rem)]">
                  {post.title}
                </h1>

                {post.excerpt && (
                  <p className="mt-5 text-[1.125rem] leading-relaxed text-text-secondary">
                    {post.excerpt}
                  </p>
                )}

                <div className="mt-7 flex flex-col gap-4 border-y border-border py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-text-tertiary">
                    <span className="flex items-center gap-1.5">
                      <User className="h-4 w-4" aria-hidden="true" />
                      {author}
                    </span>
                    <time dateTime={published.toISOString()} className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" aria-hidden="true" />
                      {date}
                    </time>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4" aria-hidden="true" />
                      {readTime}
                    </span>
                  </div>
                  <ShareButtons title={post.title} />
                </div>
              </header>

              {/* Body - semantic blocks, 65-75ch column */}
              <div className="mt-8">
                <PostBody content={post.content} />
              </div>

              <RelatedBlock
                pillar={post.pillar ? { title: post.pillar.title, slug: post.pillar.slug } : null}
                program={post.program ? { name: post.program.name, slug: post.program.slug } : null}
                tags={post.tags.map((t) => ({ name: t.name, slug: t.slug }))}
              />

              <PostCTA
                heading="Support a child's future."
                description="Your gift funds education, mentorship, and dignity."
                primaryCta={{ label: "Give Now", href: "/give" }}
                secondaryCta={{ label: "Get Involved", href: "/get-involved" }}
              />
            </div>

            {/* More from this pillar - wider grid */}
            <div className="mx-auto mt-16 w-full max-w-5xl">
              <MoreFromPillar currentSlug={post.slug} pillarId={post.pillarId} />
            </div>
          </article>
        </div>
      </div>

      <StickyGiveCta />
    </>
  );
}
