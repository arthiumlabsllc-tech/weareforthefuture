import type { Metadata } from "next";
import { PrismaClient } from "@prisma/client";
import { img } from "@/lib/imageUrl";
import ImpactStoriesClient from "./ImpactStoriesClient";

export const metadata: Metadata = {
  title: "Impact Stories",
  description:
    "Real lives changed by For The Future Organization. See how your support is transforming the lives of vulnerable children and young people.",
  alternates: { canonical: "/impact-stories" },
};

const prisma = new PrismaClient();

// Phase 3b.2 ISR audit: impact stories are CMS-managed, consent-gated content
// that does not need per-request freshness — statically generate + revalidate.
export const revalidate = 300;

export default async function ImpactStoriesPage() {
  // Guarded: fall back to an empty list if the DB is unreachable (Phase 3a.5).
  const stories = await prisma.impactStory.findMany({
    // Child-safeguarding gate: only publish stories with verified consent.
    where: { published: true, consentGiven: true, deletedAt: null },
    orderBy: { createdAt: "desc" },
  }).catch((err) => {
    console.error("[/impact-stories] DB query failed:", err);
    return [];
  });

  const dbStories = stories.map((s) => ({
    name: s.childName || s.title,
    title: s.title,
    story: s.content.replace(/<[^>]*>/g, ""),
    image: s.featuredImage || img("/images/stories/default.jpg"),
    program: s.program || "",
  }));

  // Gallery images from all stories
  const allGalleryImages = stories.flatMap((s) => (s.gallery as string[]) || []);

  return <ImpactStoriesClient initialStories={dbStories} galleryImages={allGalleryImages} />;
}
