import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionFromCookie } from "@/lib/admin-auth";
import { hasPermission } from "@/lib/admin-rbac";
import { z } from "zod";

const blogUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  excerpt: z.string().optional(),
  content: z.string().optional(),
  featuredImage: z.string().nullable().optional(),
  categoryId: z.string().nullable().optional(),
  published: z.boolean().optional(),
  featured: z.boolean().optional(),
  metaTitle: z.string().nullable().optional(),
  metaDescription: z.string().nullable().optional(),
});

// PATCH - Update post
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSessionFromCookie();
    if (!session || !hasPermission(session, "blog.manage")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = blogUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Get existing post for audit
    const existing = await prisma.blogPost.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Check slug uniqueness if changed
    const data = parsed.data;
    if (data.slug && data.slug !== existing.slug) {
      const slugExists = await prisma.blogPost.findUnique({ where: { slug: data.slug } });
      if (slugExists) {
        return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
      }
    }

    const post = await prisma.blogPost.update({
      where: { id },
      data: {
        ...data,
        updatedBy: session.userId,
        readingTime: data.content
          ? Math.ceil(data.content.split(/\s+/).length / 200)
          : undefined,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: "UPDATE",
        entity: "BlogPost",
        entityId: post.id,
        before: { title: existing.title, published: existing.published },
        after: { title: post.title, published: post.published },
      },
    });

    return NextResponse.json({ post });
  } catch (error) {
    console.error("[Blog API] PATCH error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE - Soft delete post
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSessionFromCookie();
    if (!session || !hasPermission(session, "blog.manage")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existing = await prisma.blogPost.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    await prisma.blogPost.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedBy: session.userId,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: "DELETE",
        entity: "BlogPost",
        entityId: id,
        before: { title: existing.title, slug: existing.slug },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Blog API] DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
