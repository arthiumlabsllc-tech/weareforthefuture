import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import {
  verifyPassword,
  setSupporterSessionCookie,
  checkLockout,
  recordFailedAttempt,
  clearFailedAttempts,
} from "@/lib/supporter-auth";

const prisma = new PrismaClient();

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = loginSchema.parse(body);
    const email = data.email.toLowerCase();

    // Check lockout
    if (checkLockout(email)) {
      return NextResponse.json(
        { error: "Too many failed attempts. Please try again in 15 minutes." },
        { status: 429 }
      );
    }

    const supporter = await prisma.supporter.findUnique({
      where: { email },
    });

    if (!supporter) {
      recordFailedAttempt(email);
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const valid = await verifyPassword(data.password, supporter.passwordHash);
    if (!valid) {
      recordFailedAttempt(email);
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    clearFailedAttempts(email);

    // Update last login
    await prisma.supporter.update({
      where: { id: supporter.id },
      data: { lastLoginAt: new Date() },
    });

    await setSupporterSessionCookie({
      supporterId: supporter.id,
      email: supporter.email,
      name: supporter.name,
    });

    return NextResponse.json({
      supporter: { name: supporter.name, email: supporter.email },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: (error as z.ZodError).issues[0].message },
        { status: 400 }
      );
    }
    console.error("Supporter login error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
