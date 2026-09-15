import { NextRequest, NextResponse } from "next/server";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import {
  hashPassword,
  setSupporterSessionCookie,
} from "@/lib/supporter-auth";

const prisma = new PrismaClient();

const registerSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  country: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = registerSchema.parse(body);

    // Check if email already exists
    const existing = await prisma.supporter.findUnique({
      where: { email: data.email.toLowerCase() },
    });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(data.password);

    const supporter = await prisma.supporter.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        phone: data.phone || null,
        country: data.country || null,
        passwordHash,
      },
    });

    // Auto-login after registration
    await setSupporterSessionCookie({
      supporterId: supporter.id,
      email: supporter.email,
      name: supporter.name,
    });

    return NextResponse.json(
      { supporter: { name: supporter.name, email: supporter.email } },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: (error as z.ZodError).issues[0].message },
        { status: 400 }
      );
    }
    if (error instanceof PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }
    console.error("Supporter register error:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
