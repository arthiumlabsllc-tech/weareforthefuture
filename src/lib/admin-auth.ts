import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import type { Role } from "@prisma/client";

function adminSigningKey() {
  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret || Buffer.byteLength(secret) < 32 || /change.me|replace.me/i.test(secret)) throw new Error("Admin authentication is unavailable");
  return new TextEncoder().encode(secret);
}

const SESSION_COOKIE = "ftf-admin-session";
const SESSION_MAX_AGE = 30 * 60; // 30 minutes in seconds

// ============================================
// PASSWORD HASHING
// ============================================

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ============================================
// JWT TOKEN MANAGEMENT
// ============================================

export interface AdminSession {
  userId: string;
  email: string;
  role: Role;
  name?: string;
}

export async function createSessionToken(session: AdminSession): Promise<string> {
  return new SignJWT({ ...session })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(adminSigningKey());
}

export async function verifySessionToken(
  token: string
): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, adminSigningKey(), { algorithms: ["HS256"], requiredClaims: ["iat", "exp"] });
    if (typeof payload.userId !== "string" || typeof payload.email !== "string" || typeof payload.role !== "string") return null;
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      role: payload.role as Role,
      name: payload.name as string | undefined,
    };
  } catch {
    return null;
  }
}

// ============================================
// COOKIE MANAGEMENT
// ============================================

export async function setSessionCookie(session: AdminSession): Promise<void> {
  const token = await createSessionToken(session);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

export async function getSessionFromCookie(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return getActiveAdminSession(token);
}

export async function getActiveAdminSession(token: string): Promise<AdminSession | null> {
  const session = await verifySessionToken(token);
  if (!session) return null;
  const { prisma } = await import("./db");
  const user = await prisma.user.findFirst({ where: { id: session.userId, suspended: false, deletedAt: null },
    select: { id: true, name: true, email: true, role: true } });
  return user ? { userId: user.id, email: user.email, role: user.role, name: user.name ?? undefined } : null;
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export function refreshSessionCookie(session: AdminSession): void {
  // Extend session on activity (called from middleware)
  createSessionToken(session).then((token) => {
    cookies().then((cookieStore) => {
      cookieStore.set(SESSION_COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: SESSION_MAX_AGE,
        path: "/",
      });
    });
  });
}

// ============================================
// LOCKOUT MANAGEMENT
// ============================================

const failedAttempts = new Map<string, { count: number; lockedUntil: number }>();

export function checkLockout(identifier: string): boolean {
  const entry = failedAttempts.get(identifier);
  if (!entry) return false;
  if (entry.lockedUntil > Date.now()) return true;
  if (entry.lockedUntil <= Date.now()) {
    failedAttempts.delete(identifier);
    return false;
  }
  return false;
}

export function recordFailedAttempt(identifier: string): void {
  const entry = failedAttempts.get(identifier);
  const count = (entry?.count || 0) + 1;
  const lockedUntil = count >= 5 ? Date.now() + 15 * 60 * 1000 : 0;
  failedAttempts.set(identifier, { count, lockedUntil });
}

export function clearFailedAttempts(identifier: string): void {
  failedAttempts.delete(identifier);
}
