import { prisma } from "@/lib/db";
import BlogEditor from "@/components/admin/BlogEditor";

export const dynamic = "force-dynamic";

export default async function NewBlogPostPage() {
  const categories = await prisma.blogCategory.findMany({
    where: { deletedAt: null },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return <BlogEditor categories={categories} />;
}
