import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionFromCookie } from "@/lib/admin-auth";
import { hasPermission } from "@/lib/admin-rbac";
import { z } from "zod";

const blogSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  excerpt: z.string().optional(),
  content: z.string().optional(),
  featuredImage: z.string().nullable().optional(),
  categoryId: z.string().nullable().optional(),
  published: z.boolean().optional(),
  featured: z.boolean().optional(),
  metaTitle: z.string().nullable().optional(),
  metaDescription: z.string().nullable().optional(),
});

// GET - List all posts
export async function GET() {
  try {
    const session = await getSessionFromCookie();
    if (!session || !hasPermission(session, "blog.manage")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const posts = await prisma.blogPost.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      include: {
        category: { select: { name: true } },
        author: { select: { name: true } },
      },
    });

    return NextResponse.json({ posts });
  } catch (error) {
    console.error("[Blog API] GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Create new post
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromCookie();
    if (!session || !hasPermission(session, "blog.manage")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = blogSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Check slug uniqueness
    const existing = await prisma.blogPost.findUnique({ where: { slug: data.slug } });
    if (existing) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
    }

    const post = await prisma.blogPost.create({
      data: {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt ?? null,
        content: data.content || "",
        featuredImage: data.featuredImage ?? null,
        published: data.published ?? false,
        featured: data.featured ?? false,
        metaTitle: data.metaTitle ?? null,
        metaDescription: data.metaDescription ?? null,
        createdBy: session.userId,
        updatedBy: session.userId,
        readingTime: Math.ceil((data.content || "").split(/\s+/).length / 200),
        ...(data.categoryId ? { category: { connect: { id: data.categoryId } } } : {}),
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: "CREATE",
        entity: "BlogPost",
        entityId: post.id,
        after: { title: post.title, slug: post.slug, published: post.published },
      },
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    console.error("[Blog API] POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
