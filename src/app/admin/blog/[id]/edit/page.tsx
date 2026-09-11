import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import BlogEditor from "@/components/admin/BlogEditor";

export const dynamic = "force-dynamic";

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const post = await prisma.blogPost.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      content: true,
      featuredImage: true,
      categoryId: true,
      published: true,
      featured: true,
      metaTitle: true,
      metaDescription: true,
    },
  });

  if (!post) notFound();

  const categories = await prisma.blogCategory.findMany({
    where: { deletedAt: null },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return <BlogEditor post={post} categories={categories} />;
}
