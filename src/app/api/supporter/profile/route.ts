import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import {
  getSupporterSessionFromCookie,
  hashPassword,
  verifyPassword,
} from "@/lib/supporter-auth";

const prisma = new PrismaClient();

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  emailNotifications: z.boolean().optional(),
  marketingEmails: z.boolean().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

export async function GET() {
  const session = await getSupporterSessionFromCookie();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const supporter = await prisma.supporter.findUnique({
    where: { id: session.supporterId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      avatar: true,
      country: true,
      city: true,
      emailNotifications: true,
      marketingEmails: true,
      createdAt: true,
    },
  });

  if (!supporter) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ supporter });
}

export async function PUT(request: NextRequest) {
  const session = await getSupporterSessionFromCookie();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Handle password change
    if (body.currentPassword && body.newPassword) {
      const pwData = passwordSchema.parse(body);
      const supporter = await prisma.supporter.findUnique({
        where: { id: session.supporterId },
      });
      if (!supporter) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      const valid = await verifyPassword(pwData.currentPassword, supporter.passwordHash);
      if (!valid) {
        return NextResponse.json(
          { error: "Current password is incorrect" },
          { status: 400 }
        );
      }
      const newPasswordHash = await hashPassword(pwData.newPassword);
      await prisma.supporter.update({
        where: { id: session.supporterId },
        data: { passwordHash: newPasswordHash },
      });
      return NextResponse.json({ ok: true });
    }

    // Handle profile update
    const data = updateSchema.parse(body);
    await prisma.supporter.update({
      where: { id: session.supporterId },
      data,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: (error as z.ZodError).issues[0].message },
        { status: 400 }
      );
    }
    console.error("Supporter profile update error:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
