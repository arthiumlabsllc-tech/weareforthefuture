import { prisma } from "@/lib/db";
import Link from "next/link";
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  const posts = await prisma.blogPost.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      category: { select: { name: true } },
      author: { select: { name: true } },
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-text-primary">
            Blog / News
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Manage blog posts and news articles
          </p>
        </div>
        <Link
          href="/admin/blog/new"
          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-text-on-primary transition-all hover:bg-primary-hover"
        >
          <Plus className="h-4 w-4" />
          New Post
        </Link>
      </div>

      {/* Posts Table */}
      <div className="rounded-xl bg-surface border border-border overflow-hidden">
        {posts.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-text-secondary">No blog posts yet.</p>
            <Link
              href="/admin/blog/new"
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-accent-text hover:text-accent-hover"
            >
              <Plus className="h-4 w-4" />
              Create your first post
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-bg-tertiary">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-tertiary uppercase tracking-wider">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-tertiary uppercase tracking-wider">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-tertiary uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-tertiary uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-text-tertiary uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-bg-tertiary/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {post.featuredImage && (
                          <img
                            src={post.featuredImage}
                            alt=""
                            className="h-10 w-10 rounded-lg object-cover"
                          />
                        )}
                        <div>
                          <p className="text-sm font-medium text-text-primary">{post.title}</p>
                          {post.excerpt && (
                            <p className="text-xs text-text-muted line-clamp-1">{post.excerpt}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-bg-tertiary px-2.5 py-1 text-xs font-medium text-text-secondary">
                        {post.category?.name || "Uncategorized"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                          post.published
                            ? "bg-success/10 text-success-text"
                            : "bg-accent/10 text-accent-text"
                        }`}
                      >
                        {post.published ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                        {post.published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-text-secondary">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/blog/${post.id}/edit`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary hover:bg-bg-tertiary hover:text-text-primary"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary hover:bg-error/10 hover:text-error"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
