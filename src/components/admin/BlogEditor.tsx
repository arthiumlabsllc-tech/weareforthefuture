"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Save, Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

const RichTextEditor = dynamic(() => import("@/components/admin/RichTextEditor"), { ssr: false });

/* Phase 6 §15: posts carry a country so /news can filter by it. Pillar + programme
   options now come from the Pillar / Program models (Phase 6.5 relations). */
const COUNTRY_OPTIONS = ["Ghana", "Nigeria"];

interface BlogEditorProps {
  post?: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string;
    featuredImage: string | null;
    categoryId: string | null;
    pillarSlug: string | null;
    pillarId: string | null;
    programId: string | null;
    country: string | null;
    archived: boolean;
    published: boolean;
    featured: boolean;
    metaTitle: string | null;
    metaDescription: string | null;
  };
  categories: { id: string; name: string }[];
  pillars: { id: string; number: number; title: string; slug: string }[];
  programs: { id: string; name: string; slug: string; pillarIds: string[] }[];
}

export default function BlogEditor({ post, categories, pillars, programs }: BlogEditorProps) {
  const router = useRouter();
  const isEditing = !!post;

  const [title, setTitle] = useState(post?.title || "");
  const [slug, setSlug] = useState(post?.slug || "");
  const [excerpt, setExcerpt] = useState(post?.excerpt || "");
  const [content, setContent] = useState(post?.content || "");
  const [featuredImage, setFeaturedImage] = useState(post?.featuredImage || "");
  const [categoryId, setCategoryId] = useState(post?.categoryId || "");
  const [pillarSlug, setPillarSlug] = useState(post?.pillarSlug || "");
  const [pillarId, setPillarId] = useState(post?.pillarId || "");
  const [programId, setProgramId] = useState(post?.programId || "");
  const [country, setCountry] = useState(post?.country || "");
  const [archived, setArchived] = useState(post?.archived || false);
  const [published, setPublished] = useState(post?.published || false);
  const [featured, setFeatured] = useState(post?.featured || false);
  const [metaTitle, setMetaTitle] = useState(post?.metaTitle || "");
  const [metaDescription, setMetaDescription] = useState(post?.metaDescription || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function generateSlug(text: string) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  /* Phase 6.5: choosing a pillar keeps the denormalised pillarSlug (the /news
     filter) in sync with the pillarId relation, and narrows the programme list
     to that pillar's programmes. Clearing the pillar also clears an orphaned
     programme selection. */
  const programOptions = pillarId
    ? programs.filter((pr) => pr.pillarIds.includes(pillarId))
    : programs;

  function handlePillarChange(value: string) {
    setPillarId(value);
    setPillarSlug(pillars.find((p) => p.id === value)?.slug || "");
    if (value && programId && !programOptions.some((pr) => pr.id === programId)) {
      // programOptions is computed pre-update; re-check against the new pillar.
      const allowed = programs.filter((pr) => pr.pillarIds.includes(value));
      if (!allowed.some((pr) => pr.id === programId)) setProgramId("");
    }
  }

  function programLabel(pr: { id: string; name: string; pillarIds: string[] }) {
    if (pillarId) return pr.name;
    const names = pr.pillarIds
      .map((id) => pillars.find((p) => p.id === id)?.title)
      .filter(Boolean)
      .join(", ");
    return names ? `${pr.name} - ${names}` : `${pr.name} - no pillar`;
  }

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!isEditing) {
      setSlug(generateSlug(value));
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const url = isEditing ? `/api/admin/blog/${post.id}` : "/api/admin/blog";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug: slug || generateSlug(title),
          excerpt,
          content,
          featuredImage: featuredImage || null,
          categoryId: categoryId || null,
          pillarSlug: pillarSlug || null,
          pillarId: pillarId || null,
          programId: programId || null,
          country: country || null,
          archived,
          published,
          featured,
          metaTitle: metaTitle || null,
          metaDescription: metaDescription || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }

      router.push("/admin/blog");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/blog"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-secondary hover:bg-bg-tertiary"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-text-primary">
            {isEditing ? "Edit Post" : "New Post"}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setPublished(!published)}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              published
                ? "bg-success/10 text-success-text"
                : "bg-bg-tertiary text-text-secondary"
            }`}
          >
            {published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            {published ? "Published" : "Draft"}
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-text-on-primary transition-all hover:bg-primary-hover disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-error/10 border border-error/20 px-4 py-3 text-sm text-error">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Title */}
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Post title..."
              required
              className="w-full border-0 bg-transparent text-3xl font-bold text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-0"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-text-tertiary uppercase tracking-wider">
              Slug
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="post-url-slug"
              className="w-full rounded-xl border border-border-strong bg-bg-primary px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
          </div>

          {/* Excerpt */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-text-tertiary uppercase tracking-wider">
              Excerpt
            </label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Brief summary of the post..."
              rows={2}
              className="w-full rounded-xl border border-border-strong bg-bg-primary px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 resize-none"
            />
          </div>

          {/* Content */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-text-tertiary uppercase tracking-wider">
              Content
            </label>
            <RichTextEditor content={content} onChange={setContent} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Featured Image */}
          <div className="rounded-xl bg-surface border border-border p-5">
            <h3 className="mb-3 text-sm font-semibold text-text-primary">Featured Image</h3>
            <input
              type="url"
              value={featuredImage}
              onChange={(e) => setFeaturedImage(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full rounded-lg border border-border-strong bg-bg-primary px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
            />
            {featuredImage && (
              <img
                src={featuredImage}
                alt="Preview"
                className="mt-3 h-32 w-full rounded-lg object-cover"
              />
            )}
          </div>

          {/* Category */}
          <div className="rounded-xl bg-surface border border-border p-5">
            <h3 className="mb-3 text-sm font-semibold text-text-primary">Category</h3>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-lg border border-border-strong bg-bg-primary px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none"
            >
              <option value="">Select category...</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>

            <h3 className="mt-4 mb-2 text-sm font-semibold text-text-primary">Related pillar</h3>
            <select
              value={pillarId}
              onChange={(e) => handlePillarChange(e.target.value)}
              className="w-full rounded-lg border border-border-strong bg-bg-primary px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none"
            >
              <option value="">No pillar...</option>
              {pillars.map((p) => (
                <option key={p.id} value={p.id}>{`Pillar ${p.number} · ${p.title}`}</option>
              ))}
            </select>

            <h3 className="mt-4 mb-2 text-sm font-semibold text-text-primary">Related programme</h3>
            <select
              value={programId}
              onChange={(e) => setProgramId(e.target.value)}
              className="w-full rounded-lg border border-border-strong bg-bg-primary px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none"
            >
              <option value="">No programme...</option>
              {programOptions.map((pr) => (
                <option key={pr.id} value={pr.id}>{programLabel(pr)}</option>
              ))}
            </select>

            <h3 className="mt-4 mb-2 text-sm font-semibold text-text-primary">Country</h3>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full rounded-lg border border-border-strong bg-bg-primary px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none"
            >
              <option value="">Not country-specific...</option>
              {COUNTRY_OPTIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Options */}
          <div className="rounded-xl bg-surface border border-border p-5">
            <h3 className="mb-3 text-sm font-semibold text-text-primary">Options</h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="rounded border-border-strong"
              />
              <span className="text-sm text-text-secondary">Featured post</span>
            </label>
            <label className="mt-3 flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={archived}
                onChange={(e) => setArchived(e.target.checked)}
                className="rounded border-border-strong"
              />
              <span className="text-sm text-text-secondary">
                Archived (hidden from the /news feed)
              </span>
            </label>
          </div>

          {/* SEO */}
          <div className="rounded-xl bg-surface border border-border p-5">
            <h3 className="mb-3 text-sm font-semibold text-text-primary">SEO</h3>
            <div className="space-y-3">
              <input
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder="Meta title (optional)"
                className="w-full rounded-lg border border-border-strong bg-bg-primary px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
              />
              <textarea
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="Meta description (optional)"
                rows={2}
                className="w-full rounded-lg border border-border-strong bg-bg-primary px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none resize-none"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
