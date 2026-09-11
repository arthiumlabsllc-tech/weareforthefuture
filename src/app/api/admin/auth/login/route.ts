import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  verifyPassword,
  setSessionCookie,
  checkLockout,
  recordFailedAttempt,
  clearFailedAttempts,
} from "@/lib/admin-auth";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    // Check lockout
    if (checkLockout(email)) {
      return NextResponse.json(
        { error: "Too many failed attempts. Account locked for 15 minutes." },
        { status: 429 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user || user.suspended || user.deletedAt) {
      recordFailedAttempt(email);
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Verify password
    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      recordFailedAttempt(email);
      const attempts = 5 - (1); // simplified
      return NextResponse.json(
        { error: `Invalid email or password` },
        { status: 401 }
      );
    }

    // Success - clear failed attempts and create session
    clearFailedAttempts(email);

    await setSessionCookie({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name || undefined,
    });

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Log the login
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "LOGIN",
        entity: "User",
        entityId: user.id,
        ip: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || null,
        userAgent: request.headers.get("user-agent") || null,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("[Admin Login] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
