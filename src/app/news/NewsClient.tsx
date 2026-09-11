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

const newsCategories = ["All", "News", "Stories", "Press"];

const newsArticles = [
  {
    title: "FTF Impact Store Launches with Inspiring Book Fair: A New Chapter for Childhood Empowerment",
    category: "News",
    date: "July 21, 2025",
    author: "ftfghana",
    excerpt:
      "The FTF Impact Store officially opened its doors with a vibrant book fair, bringing together children, parents, and community members to celebrate the power of reading and learning.",
    featured: true,
    readTime: "5 min read",
    image: "/images/news/impact-store-bookfair.jpg",
  },
  {
    title: "For The Future (FTF) Launches Impact Store to Support Deprived Kids",
    category: "Press",
    date: "July 21, 2025",
    author: "B&FTonline",
    excerpt:
      "For The Future Organization has launched its Impact Store, where 100% of proceeds go directly toward supporting underprivileged children with education, healthcare, and mentorship.",
    featured: false,
    readTime: "4 min read",
    image: "/images/news/impact-store-launch.jpg",
  },
  {
    title: "FTF and Chess in Slums: Developing Critical Thinkers",
    category: "Stories",
    date: "June 1, 2025",
    author: "ftfghana",
    excerpt:
      "For the Future Ghana partnered with Chess in Slums, a Nigerian-based organization, as its first Global Ambassador, developing critical thinking and strategic skills in children from underserved communities.",
    featured: false,
    readTime: "6 min read",
    image: "/images/initiatives/chess-in-slums.jpg",
  },
  {
    title: "Project Momentum: Empowering Nigeria's Next Generation",
    category: "News",
    date: "May 26, 2025",
    author: "ftfghana",
    excerpt:
      "Project Momentum is the official launch initiative of For the Future (FTF) Nigeria, dedicated to empowering secondary school students in underserved communities across Lagos.",
    featured: false,
    readTime: "4 min read",
    image: "/images/initiatives/project-momentum.jpg",
  },
  {
    title: "Kezia Asiedua Sanie Sworn In as Youngest Board of Trustees Member",
    category: "Press",
    date: "May 7, 2025",
    author: "ftfghana",
    excerpt:
      "FTF Founder Kezia Asiedua Sanie was sworn in as the youngest member of the Board of Trustees for the Head of State Awards Scheme, recognizing her exceptional leadership at just 23 years old.",
    featured: false,
    readTime: "3 min read",
    image: "/images/news/board-of-trustees.jpg",
  },
  {
    title: "FTF Ghana Wins Community Influencer of the Year at Pulse Awards",
    category: "Press",
    date: "May 6, 2025",
    author: "ftfghana",
    excerpt:
      "For The Future Ghana won the prestigious Community Influencer of the Year Award at the Pulse Influencer Awards, recognizing our outstanding impact on youth empowerment across the country.",
    featured: false,
    readTime: "3 min read",
    image: "/images/news/pulse-award.jpg",
  },
  {
    title: "Project Future Ready: Equipping Youth for the Digital Age",
    category: "News",
    date: "February 26, 2025",
    author: "ftfghana",
    excerpt:
      "Our newest initiative provides digital literacy, coding basics, and 21st-century skills to underprivileged youth in Ghana, preparing them for opportunities in the modern world.",
    featured: false,
    readTime: "4 min read",
    image: "/images/initiatives/future-ready.jpg",
  },
  {
    title: "Empower Her, Period: Breaking Barriers for the Girl Child",
    category: "Stories",
    date: "March 12, 2025",
    author: "ftfghana",
    excerpt:
      "Periods affect the physical and emotional wellbeing of the average girl child. Our Empower Her initiative provides affordable period care and education so no girl misses school.",
    featured: false,
    readTime: "5 min read",
    image: "/images/initiatives/empower-her.jpg",
  },
];

export default function NewsClient() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered =
    activeCategory === "All"
      ? newsArticles
      : newsArticles.filter((a) => a.category === activeCategory);

  const featured = newsArticles.find((a) => a.featured);

  return (
    <>
      {/* ===== HERO ===== */}
      <section className="relative min-h-[45vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/page-heroes/news-hero.jpg"
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
