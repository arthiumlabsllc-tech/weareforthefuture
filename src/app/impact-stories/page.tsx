import type { Metadata } from "next";
import { PrismaClient } from "@prisma/client";
import { img } from "@/lib/imageUrl";
import ImpactStoriesClient from "./ImpactStoriesClient";

export const metadata: Metadata = {
  title: "Impact Stories",
  description:
    "Real lives changed by For The Future Organization. See how your support is transforming the lives of underprivileged children.",
};

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

export default async function ImpactStoriesPage() {
  const stories = await prisma.impactStory.findMany({
    where: { published: true, deletedAt: null },
    orderBy: { createdAt: "desc" },
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
