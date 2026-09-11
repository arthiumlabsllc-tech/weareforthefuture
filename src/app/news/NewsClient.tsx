"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Calendar,
  ArrowRight,
  Tag,
  Clock,
  User,
} from "lucide-react";
import SectionWrapper, { SectionHeader } from "@/components/ui/SectionWrapper";
import { img } from "@/lib/imageUrl";

interface Article {
  title: string;
  category: string;
  date: string;
  author: string;
  excerpt: string;
  featured: boolean;
  readTime: string;
  image: string;
  slug: string;
}

const newsCategories = ["All", "News", "Stories", "Press"];

export default function NewsClient({ initialArticles = [] }: { initialArticles?: Article[] }) {
  const articles = initialArticles;
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered =
    activeCategory === "All"
      ? articles
      : articles.filter((a) => a.category === activeCategory);

  const featured = articles.find((a) => a.featured);

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
            <span className="inline-block text-xs font-semibold uppercase tracking-[0.3em] text-accent mb-4">
              News & Stories
            </span>
            <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold leading-[1.1] text-text-on-primary sm:text-5xl md:text-6xl">
              Stories of Impact, News of Change
            </h1>
            <p className="mt-6 max-w-xl text-lg text-text-on-primary/70 leading-relaxed">
              Stay updated with the latest news, impact stories, and events
              from For The Future Organization.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ===== FEATURED ARTICLE ===== */}
      {featured && (
        <SectionWrapper background="white">
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
              <div className="flex items-center gap-3 mb-4">
                <span className="inline-flex items-center rounded-full bg-accent-subtle px-3 py-1 text-xs font-semibold text-accent">
                  Featured
                </span>
                <span className="inline-flex items-center rounded-full bg-bg-tertiary px-3 py-1 text-xs font-medium text-text-secondary">
                  {featured.category}
                </span>
              </div>
              <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-text-primary md:text-3xl leading-tight mb-4">
                {featured.title}
              </h2>
              <p className="text-text-secondary leading-relaxed mb-6">
                {featured.excerpt}
              </p>
              <div className="flex items-center gap-4 text-sm text-text-tertiary mb-6">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {featured.date}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {featured.readTime}
                </span>
              </div>
              <button className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-accent to-accent-hover px-6 py-3 text-sm font-semibold text-text-primary shadow-lg shadow-accent/20 transition-all hover:scale-[1.02]">
                Read Full Story
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        </SectionWrapper>
      )}

      {/* ===== ARTICLES GRID ===== */}
      <SectionWrapper background="warm">
        <SectionHeader
          overline="Latest Updates"
          title="All News & Stories"
          description="Browse the full collection of FTF news, impact stories, and press coverage."
        />
        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-10">
          {newsCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
                activeCategory === cat
                  ? "bg-primary text-text-on-primary shadow-lg"
                  : "bg-surface text-text-secondary border border-border-strong hover:border-border"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((article, i) => (
            <motion.article
              key={article.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              className="group overflow-hidden rounded-2xl border border-border bg-surface transition-all hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1"
            >
              <div className="relative aspect-[16/9] overflow-hidden bg-bg-tertiary">
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  unoptimized
                />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="inline-flex items-center gap-1 rounded-full bg-bg-tertiary px-2.5 py-0.5 text-xs font-medium text-text-secondary">
                    <Tag className="h-3 w-3" />
                    {article.category}
                  </span>
                  <span className="text-xs text-text-muted">{article.date}</span>
                </div>
                <h3 className="text-lg font-bold text-text-primary group-hover:text-accent transition-colors mb-2 line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed line-clamp-3 mb-4">
                  {article.excerpt}
                </p>
                <div className="flex items-center justify-between text-xs text-text-muted">
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {article.author}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {article.readTime}
                  </span>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </SectionWrapper>
    </>
  );
}
