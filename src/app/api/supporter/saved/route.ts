import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import { getSupporterSessionFromCookie } from "@/lib/supporter-auth";

const prisma = new PrismaClient();

const saveSchema = z.object({
  type: z.string().min(1),
  itemId: z.string().min(1),
  title: z.string().min(1),
  image: z.string().optional(),
});

export async function GET() {
  const session = await getSupporterSessionFromCookie();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const savedItems = await prisma.savedItem.findMany({
    where: { supporterId: session.supporterId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ savedItems });
}

export async function POST(request: NextRequest) {
  const session = await getSupporterSessionFromCookie();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = saveSchema.parse(body);

    const savedItem = await prisma.savedItem.create({
      data: {
        supporterId: session.supporterId,
        type: data.type,
        itemId: data.itemId,
        title: data.title,
        image: data.image || null,
      },
    });

    return NextResponse.json({ savedItem }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: (error as z.ZodError).issues[0].message },
        { status: 400 }
      );
    }
    console.error("Save item error:", error);
    return NextResponse.json({ error: "Failed to save item" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getSupporterSessionFromCookie();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  await prisma.savedItem.deleteMany({
    where: { id, supporterId: session.supporterId },
  });

  return NextResponse.json({ ok: true });
}
