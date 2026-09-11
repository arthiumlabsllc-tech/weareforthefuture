import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import type { Role } from "@prisma/client";

const JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || "ftf-admin-jwt-secret-change-me"
);

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
    .sign(JWT_SECRET);
}

export async function verifySessionToken(
  token: string
): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
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
  return verifySessionToken(token);
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
