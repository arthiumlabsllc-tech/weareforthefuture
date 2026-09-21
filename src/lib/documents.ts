import { cache } from "react";
import { prisma } from "@/lib/db";

/**
 * Phase 4 data-access layer for public documents (Document model). Mirrors the
 * src/lib/pillars.ts pattern: every accessor is `cache()`'d and degrades to a
 * safe empty fallback when the database is unreachable (local dev, CI, cold
 * Neon branch at build time), so ISR pages prerender and render an intentional
 * empty state instead of a 500.
 */

export interface ReportDocument {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string;
  fileSize: number | null;
  category: string;
  year: number | null;
  downloads: number;
}

/**
 * Published documents in a single category, newest year first, then most
 * recently created. Only rows with a real fileUrl are returned (a document with
 * no file cannot be downloaded). Falls back to [] when the DB is unreachable.
 *
 * Downloads are routed through /api/documents/[id]/download, which increments
 * the counter and 302-redirects to the stored file URL.
 */
export const getDocumentsByCategory = cache(
  async (category: string): Promise<ReportDocument[]> => {
    try {
      const rows = await prisma.document.findMany({
        where: { published: true, deletedAt: null, category },
        orderBy: [{ year: "desc" }, { createdAt: "desc" }],
      });
      return rows
        .filter((doc) => Boolean(doc.fileUrl))
        .map((doc) => ({
          id: doc.id,
          title: doc.title,
          description: doc.description,
          fileUrl: doc.fileUrl,
          fileSize: doc.fileSize,
          category: doc.category,
          year: doc.year,
          downloads: doc.downloads,
        }));
    } catch (err) {
      console.error("[documents] getDocumentsByCategory failed - using empty fallback", err);
      return [];
    }
  },
);

/** Annual reports specifically - the /impact/reports grid. */
export const getAnnualReports = cache((): Promise<ReportDocument[]> =>
  getDocumentsByCategory("Annual Report"),
);
