"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Calendar,
  ArrowRight,
  ArrowUpRight,
  Tag,
  Clock,
  User,
  MapPin,
  Search,
  Archive,
  X,
} from "lucide-react";
import SectionWrapper, { SectionHeader } from "@/components/ui/SectionWrapper";
import { img } from "@/lib/imageUrl";
import { pillars } from "@/data/pillars";

export interface NewsCategory {
  name: string;
  slug: string;
}

export interface NewsPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  categorySlug: string;
  date: string;
  author: string;
  readTime: string;
  image: string;
  featured: boolean;
  archived: boolean;
  pillarSlug: string | null;
  country: string | null;
  tags: { name: string; slug: string }[];
}

/* Short pillar labels for chips (the full titles are too long for a card). */
const PILLAR_SHORT: Record<string, string> = {
  "foundational-education": "Foundational education",
  "girls-education-dignity": "Girls' education & dignity",
  "future-ready-skills": "Future-ready skills",
  "mentorship-leadership": "Mentorship & leadership",
  "community-family-support": "Community & family support",
};

/* The "Impact Stories" stream lives on the Stories of Change template
   (/impact-stories) per the Phase 6 brief - the chip routes there instead of
   filtering this feed. */
const IMPACT_STORIES_SLUG = "impact-stories";

/* Phase 6.5: the card's primary destination is the POST itself (/news/{slug}).
   The pillar chip is the only secondary link (/our-work/{pillar}); programme
   links live on the post detail page's Related block, not on the card body. */

interface NewsClientProps {
  initialCategories?: NewsCategory[];
  initialPosts?: NewsPost[];
}

export default function NewsClient({ initialCategories = [], initialPosts = [] }: NewsClientProps) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeTag, setActiveTag] = useState("All");
  const [pillar, setPillar] = useState("All");
  const [country, setCountry] = useState("All");
  const [showArchived, setShowArchived] = useState(false);

  const categories = initialCategories;
  const posts = initialPosts;

  /* Phase 6.5 deep links: /news?category=…&tag=… (from card category chips and
     the /news/[slug] Related tags) seed the matching filter on mount. Resolved
     client-side so /news keeps its ISR render mode (no server searchParams). */
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const cat = sp.get("category");
    const tag = sp.get("tag");
    if (cat && cat !== IMPACT_STORIES_SLUG && categories.some((c) => c.slug === cat)) {
      setActiveCategory(cat);
    }
    if (tag) setActiveTag(tag);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const allTags = useMemo(() => {
    const seen = new Map<string, string>();
    for (const p of posts) for (const t of p.tags) if (!seen.has(t.slug)) seen.set(t.slug, t.name);
    return Array.from(seen, ([slug, name]) => ({ slug, name }));
  }, [posts]);

  const archivedCount = posts.filter((p) => p.archived).length;

  const filtered = posts.filter((p) => {
    if (!showArchived && p.archived) return false;
    if (activeCategory !== "All" && p.categorySlug !== activeCategory) return false;
    if (activeTag !== "All" && !p.tags.some((t) => t.slug === activeTag)) return false;
    if (pillar !== "All" && p.pillarSlug !== pillar) return false;
    if (country !== "All" && p.country !== country) return false;
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      if (!`${p.title} ${p.excerpt}`.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const featured = filtered.find((p) => p.featured);
  const hasActiveFilters =
    query.trim() !== "" ||
    activeCategory !== "All" ||
    activeTag !== "All" ||
    pillar !== "All" ||
    country !== "All" ||
    showArchived;

  function clearFilters() {
    setQuery("");
    setActiveCategory("All");
    setActiveTag("All");
    setPillar("All");
    setCountry("All");
    setShowArchived(false);
  }

  const chipClass = (active: boolean) =>
    `rounded-full px-4 py-2 text-sm font-medium transition-all ${
      active
        ? "bg-primary text-text-on-primary shadow-lg"
        : "bg-surface text-text-secondary border border-border-strong hover:border-border"
    }`;

  return (
    <>
      {/* ===== HERO ===== */}
      <section className="relative min-h-[45vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={img("/images/page-heroes/news-hero.jpg")}
            alt="News & Stories"
            fill
            className="object-cover"
            priority
            unoptimized
          />
          <div className="absolute inset-0 bg-primary/70" />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/40 to-primary/70" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 py-32 lg:px-8 w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <span className="inline-block text-xs font-semibold uppercase tracking-[0.3em] text-accent-text mb-4">
              News & Stories
            </span>
            <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold leading-[1.1] text-text-on-primary sm:text-5xl md:text-6xl">
              Stories of Impact, News of Change
            </h1>
            <p className="mt-6 max-w-xl text-lg text-text-on-primary/70 leading-relaxed">
              Programme updates, impact stories, partnerships, events and insights
              from across Ghana and Nigeria - filtered the way you read.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ===== FILTER BAR ===== */}
      <SectionWrapper background="cream" className="!py-10">
        <div className="space-y-5">
          {/* Search + selects */}
          <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr_1fr]">
            <div className="relative">
              <label htmlFor="news-search" className="sr-only">
                Search news and stories
              </label>
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <input
                id="news-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search titles and summaries…"
                className="w-full rounded-full border border-border-strong bg-surface py-2.5 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
            </div>
            <div>
              <label htmlFor="news-pillar" className="sr-only">
                Filter by pillar
              </label>
              <select
                id="news-pillar"
                value={pillar}
                onChange={(e) => setPillar(e.target.value)}
                className="w-full rounded-full border border-border-strong bg-surface px-4 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none"
              >
                <option value="All">All pillars</option>
                {pillars.map((p) => (
                  <option key={p.id} value={p.id}>
                    {PILLAR_SHORT[p.id] ?? p.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="news-country" className="sr-only">
                Filter by country
              </label>
              <select
                id="news-country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full rounded-full border border-border-strong bg-surface px-4 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none"
              >
                <option value="All">All countries</option>
                <option value="Ghana">Ghana</option>
                <option value="Nigeria">Nigeria</option>
              </select>
            </div>
          </div>

          {/* Category chips - the §15 taxonomy. "Impact Stories" routes to the
              Stories of Change template instead of filtering this feed. */}
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Content type">
            <button className={chipClass(activeCategory === "All")} aria-pressed={activeCategory === "All"} onClick={() => setActiveCategory("All")}>
              All
            </button>
            {categories.map((cat) =>
              cat.slug === IMPACT_STORIES_SLUG ? (
                <Link
                  key={cat.slug}
                  href="/impact-stories"
                  title="Impact Stories open on the Stories of Change template"
                  className="inline-flex items-center gap-1 rounded-full border border-border-strong bg-surface px-4 py-2 text-sm font-medium text-text-secondary transition-all hover:border-accent hover:text-accent-text"
                >
                  {cat.name}
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              ) : (
                <button
                  key={cat.slug}
                  className={chipClass(activeCategory === cat.slug)}
                  aria-pressed={activeCategory === cat.slug}
                  onClick={() => setActiveCategory(activeCategory === cat.slug ? "All" : cat.slug)}
                >
                  {cat.name}
                </button>
              ),
            )}
          </div>

          {/* Tag chips */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Tags">
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-text-muted">
                Tags
              </span>
              <button className={chipClass(activeTag === "All")} aria-pressed={activeTag === "All"} onClick={() => setActiveTag("All")}>
                All
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag.slug}
                  className={chipClass(activeTag === tag.slug)}
                  aria-pressed={activeTag === tag.slug}
                  onClick={() => setActiveTag(activeTag === tag.slug ? "All" : tag.slug)}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          )}

          {/* Archive toggle */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-text-secondary">
              <input
                type="checkbox"
                checked={showArchived}
                onChange={(e) => setShowArchived(e.target.checked)}
                className="rounded border-border-strong"
              />
              <Archive className="h-4 w-4 text-text-muted" aria-hidden="true" />
              Include archived campaign coverage
              {archivedCount > 0 && <span className="text-xs text-text-muted">({archivedCount})</span>}
            </label>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1.5 rounded-full border border-border-strong px-4 py-1.5 text-xs font-semibold text-text-secondary transition-colors hover:border-accent hover:text-accent-text"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
                Clear filters
              </button>
            )}
          </div>
        </div>
      </SectionWrapper>

      {/* ===== FEATURED ARTICLE ===== */}
      {featured && (
        <SectionWrapper background="sand">
          <SectionHeader
            overline="Featured Story"
            title="Editor's Pick"
            description="The latest headline from For The Future Organization."
          />
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid gap-8 lg:grid-cols-2 items-center"
          >
            <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-bg-tertiary">
              <Image
                src={featured.image}
                alt={featured.title}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="inline-flex items-center rounded-full bg-accent-subtle px-3 py-1 text-xs font-semibold text-accent-text">
                  Featured
                </span>
                <Link
                  href={`/news?category=${featured.categorySlug}`}
                  title={`More in ${featured.category}`}
                  className="inline-flex items-center rounded-full bg-bg-tertiary px-3 py-1 text-xs font-medium text-text-secondary transition-colors hover:text-accent-text"
                >
                  {featured.category}
                </Link>
                {featured.pillarSlug && (
                  <span className="inline-flex items-center rounded-full bg-bg-tertiary px-3 py-1 text-xs font-medium text-text-secondary">
                    {PILLAR_SHORT[featured.pillarSlug] ?? featured.pillarSlug}
                  </span>
                )}
              </div>
              <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-text-primary md:text-3xl leading-tight mb-4">
                <Link href={`/news/${featured.slug}`} className="transition-colors hover:text-accent-text">
                  {featured.title}
                </Link>
              </h2>
              <p className="text-text-secondary leading-relaxed mb-6">{featured.excerpt}</p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-text-tertiary mb-6">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" aria-hidden="true" />
                  {featured.date}
                </span>
                <span className="flex items-center gap-1.5">
                  <User className="h-4 w-4" aria-hidden="true" />
                  {featured.author}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" aria-hidden="true" />
                  {featured.readTime}
                </span>
              </div>
              <Link
                href={`/news/${featured.slug}`}
                className="inline-flex items-center gap-2 rounded-full bg-cta px-6 py-3 text-sm font-semibold text-on-cta shadow-lg shadow-accent/20 transition-all hover:bg-cta-hover hover:scale-[1.02]"
              >
                Read the full story
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </motion.div>
        </SectionWrapper>
      )}

      {/* ===== ARTICLES GRID ===== */}
      <SectionWrapper background="white">
        <SectionHeader
          overline="Latest Updates"
          title="All News & Stories"
          description="Browse the full collection of FTF programme updates, partnerships, events and insights."
        />

        {filtered.length === 0 ? (
          <div className="mx-auto max-w-lg rounded-2xl border border-dashed border-border bg-surface p-10 text-center">
            <Search className="mx-auto h-8 w-8 text-text-muted" aria-hidden="true" />
            <h3 className="mt-3 text-lg font-bold text-text-primary">
              Nothing in this stream yet
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">
              No posts match the current filters. Stories from this stream are
              published as they happen - try widening your search.
            </p>
            <button
              onClick={clearFilters}
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-text-on-primary transition-all hover:scale-[1.02]"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((post, i) => {
              return (
                <motion.article
                  key={post.slug}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05, duration: 0.4 }}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-all hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1"
                >
                  <div className="relative aspect-[16/9] overflow-hidden bg-bg-tertiary">
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      unoptimized
                    />
                    {post.archived && (
                      <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-navy-900/85 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                        <Archive className="h-3 w-3" aria-hidden="true" />
                        Archived
                      </span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <Link
                        href={`/news?category=${post.categorySlug}`}
                        title={`More in ${post.category}`}
                        className="inline-flex items-center gap-1 rounded-full bg-bg-tertiary px-2.5 py-0.5 text-xs font-medium text-text-secondary transition-colors hover:text-accent-text"
                      >
                        <Tag className="h-3 w-3" aria-hidden="true" />
                        {post.category}
                      </Link>
                      {post.pillarSlug && (
                        <Link
                          href={`/our-work/${post.pillarSlug}`}
                          className="inline-flex items-center rounded-full bg-accent-subtle px-2.5 py-0.5 text-xs font-medium text-accent-text transition-colors hover:bg-accent/20"
                          title={`Related pillar: ${PILLAR_SHORT[post.pillarSlug] ?? post.pillarSlug}`}
                        >
                          {PILLAR_SHORT[post.pillarSlug] ?? post.pillarSlug}
                        </Link>
                      )}
                      {post.country === "Nigeria" && (
                        <Link
                          href="/nigeria"
                          className="inline-flex items-center gap-1 rounded-full bg-primary-subtle px-2.5 py-0.5 text-xs font-medium text-primary transition-colors hover:bg-primary/15"
                        >
                          <MapPin className="h-3 w-3" aria-hidden="true" />
                          Nigeria
                        </Link>
                      )}
                      {post.country === "Ghana" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-bg-tertiary px-2.5 py-0.5 text-xs font-medium text-text-secondary">
                          <MapPin className="h-3 w-3" aria-hidden="true" />
                          Ghana
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-text-primary group-hover:text-accent-text transition-colors mb-2 line-clamp-2">
                      <Link
                        href={`/news/${post.slug}`}
                        className="rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                      >
                        {post.title}
                      </Link>
                    </h3>
                    <p className="text-sm text-text-secondary leading-relaxed line-clamp-3 mb-4">
                      {post.excerpt}
                    </p>
                    <div className="mt-auto">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-text-muted mb-4">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" aria-hidden="true" />
                          {post.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" aria-hidden="true" />
                          {post.author}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" aria-hidden="true" />
                          {post.readTime}
                        </span>
                      </div>
                      <Link
                        href={`/news/${post.slug}`}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent-text transition-colors hover:text-accent-hover"
                      >
                        Read the story
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </SectionWrapper>
    </>
  );
}
