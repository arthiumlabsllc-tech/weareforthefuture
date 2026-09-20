import { prisma } from "@/lib/db";
import BlogEditor from "@/components/admin/BlogEditor";

export const dynamic = "force-dynamic";

export default async function NewBlogPostPage() {
  // Intentionally UNGUARDED (Phase 3a.5): auth-gated admin surface. A DB outage
  // must surface as a 500 here; an empty fallback would read as data loss to an
  // editor. Public content pages degrade to [] instead (see e.g. /news).
  const categories = await prisma.blogCategory.findMany({
    where: { deletedAt: null },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  // Phase 6.5: pillar + programme selector options (relations on BlogPost).
  const [pillars, programs] = await Promise.all([
    prisma.pillar.findMany({
      where: { deletedAt: null },
      orderBy: { number: "asc" },
      select: { id: true, number: true, title: true, slug: true },
    }),
    prisma.program.findMany({
      where: { deletedAt: null },
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true, pillars: { select: { pillarId: true } } },
    }),
  ]);

  return (
    <BlogEditor
      categories={categories}
      pillars={pillars}
      programs={programs.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        pillarIds: p.pillars.map((x) => x.pillarId),
      }))}
    />
  );
}
