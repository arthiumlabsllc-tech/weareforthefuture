import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * Public download endpoint for report documents. Increments the download
 * counter then redirects the browser to the stored file URL (Cloudinary).
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const doc = await prisma.document.findFirst({
    where: { id, published: true, deletedAt: null },
  });

  if (!doc || !doc.fileUrl) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  await prisma.document.update({
    where: { id: doc.id },
    data: { downloads: { increment: 1 } },
  });

  return NextResponse.redirect(doc.fileUrl, 302);
}
