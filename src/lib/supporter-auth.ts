import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.SUPPORTER_JWT_SECRET || "ftf-supporter-jwt-secret-change-me"
);

const SESSION_COOKIE = "ftf-supporter-session";
const SESSION_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

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

export interface SupporterSession {
  supporterId: string;
  email: string;
  name: string;
}

export async function createSessionToken(
  session: SupporterSession
): Promise<string> {
  return new SignJWT({ ...session })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(JWT_SECRET);
}

export async function verifySessionToken(
  token: string
): Promise<SupporterSession | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      supporterId: payload.supporterId as string,
      email: payload.email as string,
      name: payload.name as string,
    };
  } catch {
    return null;
  }
}

// ============================================
// COOKIE MANAGEMENT
// ============================================

export async function setSupporterSessionCookie(
  session: SupporterSession
): Promise<void> {
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

export async function getSupporterSessionFromCookie(): Promise<SupporterSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function clearSupporterSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
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
