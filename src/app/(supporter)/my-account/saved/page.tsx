"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bookmark, X } from "lucide-react";

interface SavedItem {
  id: string;
  type: string;
  itemId: string;
  title: string;
  image: string | null;
  createdAt: string;
}

export default function SavedPage() {
  const [items, setItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSaved() {
      try {
        const res = await fetch("/api/supporter/saved");
        if (res.ok) {
          const data = await res.json();
          setItems(data.savedItems);
        }
      } catch (err) {
        console.error("Fetch saved error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchSaved();
  }, []);

  async function handleRemove(id: string) {
    await fetch(`/api/supporter/saved?id=${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center lg:pl-64">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] bg-bg-primary lg:pl-64">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold text-text-primary">Saved Items</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Programmes, stories, and campaigns you&apos;ve saved for later.
          </p>
        </motion.div>

        {items.length === 0 ? (
          <div className="rounded-2xl bg-surface border border-border p-12 text-center">
            <Bookmark className="mx-auto mb-3 h-10 w-10 text-text-muted" />
            <p className="text-text-muted">No saved items yet.</p>
            <p className="mt-1 text-xs text-text-muted">
              Save programmes, stories, or campaigns to find them here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="group relative overflow-hidden rounded-2xl bg-surface border border-border"
              >
                {item.image && (
                  <div className="aspect-video bg-bg-primary">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <div className="p-4">
                  <span className="mb-1 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    {item.type}
                  </span>
                  <p className="text-sm font-medium text-text-primary">
                    {item.title}
                  </p>
                  <p className="mt-1 text-xs text-text-muted">
                    Saved {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleRemove(item.id)}
                  className="absolute right-2 top-2 rounded-full bg-surface/80 p-1.5 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-error/10 hover:text-error"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
