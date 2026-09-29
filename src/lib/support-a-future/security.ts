import "server-only";
import { createCipheriv, createDecipheriv, createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import { Prisma } from "@prisma/client";
import { prisma } from "../db";
import { getSessionFromCookie, type AdminSession } from "../admin-auth";
import { hasPermission, type Permission } from "../admin-rbac";
import { SupportError } from "./domain";

export function casePaymentsEnabled() {
  return process.env.SUPPORT_A_FUTURE_ENABLED === "true";
}

export function requiredSecret(name: string): string {
  const value = process.env[name];
  if (!value || Buffer.byteLength(value) < 32 || /change.me|replace.me/i.test(value)) {
    throw new SupportError("configuration", "This service is temporarily unavailable.", 503);
  }
  return value;
}

export function trustedOrigin(): string {
  const raw = process.env.SUPPORT_A_FUTURE_ORIGIN;
  if (!raw) throw new SupportError("configuration", "This service is temporarily unavailable.", 503);
  const url = new URL(raw);
  const local = !process.env.VERCEL_ENV && ["localhost", "127.0.0.1"].includes(url.hostname);
  if ((!local && url.protocol !== "https:") || !["http:", "https:"].includes(url.protocol) || url.username || url.password || url.pathname !== "/" || url.search || url.hash) {
    throw new SupportError("configuration", "This service is temporarily unavailable.", 503);
  }
  return url.origin;
}

export function requireSameOrigin(headers: Headers) {
  if (headers.get("origin") !== trustedOrigin()) throw new SupportError("origin", "Please reload this page and try again.", 403);
  const site = headers.get("sec-fetch-site");
  if (site && !["same-origin", "none"].includes(site)) throw new SupportError("origin", "This request is not allowed.", 403);
}

export function assertFinancialEnvironment() {
  const key = process.env.PAYSTACK_SECRET_KEY || "";
  if (!/^(sk_test_|sk_live_)/.test(key) || (key.startsWith("sk_live_") && process.env.VERCEL_ENV !== "production")) {
    throw new SupportError("payment_environment", "Payments are unavailable in this environment.", 503);
  }
}

export function assertCheckoutReady() {
  if (!casePaymentsEnabled()) throw new SupportError("not_open", "Case giving is not open yet.", 503);
  assertFinancialEnvironment();
  requiredSecret("SUPPORT_REFUND_TOKEN_SECRET");
  encryptionKey();
  requiredSecret("CRON_SECRET");
  trustedOrigin();
  if (!process.env.SENDGRID_API_KEY || !process.env.SENDGRID_FROM_EMAIL || !process.env.SUPPORT_FINANCE_ALERT_EMAIL) {
    throw new SupportError("configuration", "This service is temporarily unavailable.", 503);
  }
}

export async function requireSupportAdmin(permission: Permission): Promise<AdminSession> {
  requiredSecret("ADMIN_JWT_SECRET");
  const session = await getSessionFromCookie();
  if (!session) throw new SupportError("unauthorized", "Please sign in.", 401);
  if (!hasPermission(session, permission)) throw new SupportError("forbidden", "You do not have permission for this action.", 403);
  return session;
}

export function hashNonce(nonce: string) {
  return createHash("sha256").update(nonce).digest("hex");
}

const issuer = "ftf-support-a-future";
const audience = "ftf-excess-choice";
export async function signChoiceToken(donationId: string, expiresAt: Date, issuedAt = new Date()) {
  const nonce = randomBytes(32).toString("base64url");
  const token = await new SignJWT({ purpose: "excess-choice", nonce })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(donationId).setIssuer(issuer).setAudience(audience)
    .setIssuedAt(Math.floor(issuedAt.getTime() / 1000))
    .setExpirationTime(expiresAt.getTime() / 1000)
    .sign(new TextEncoder().encode(requiredSecret("SUPPORT_REFUND_TOKEN_SECRET")));
  return { token, nonceHash: hashNonce(nonce) };
}

export async function verifyChoiceToken(token: string, now = new Date()) {
  try {
    if (token.length > 2048) throw new Error("invalid");
    const { payload } = await jwtVerify(token, new TextEncoder().encode(requiredSecret("SUPPORT_REFUND_TOKEN_SECRET")), {
      algorithms: ["HS256"], issuer, audience, currentDate: now, requiredClaims: ["sub", "iat", "exp"],
    });
    if (payload.purpose !== "excess-choice" || typeof payload.nonce !== "string" || !/^[A-Za-z0-9_-]{43}$/.test(payload.nonce) || !payload.sub) {
      throw new Error("invalid");
    }
    return { donationId: payload.sub, nonceHash: hashNonce(payload.nonce), expiresAt: new Date(payload.exp! * 1000) };
  } catch {
    throw new SupportError("invalid_link", "This link is unavailable or has expired. Please contact FTF for help.", 403);
  }
}

function encryptionKey() {
  const encoded = requiredSecret("SUPPORT_OUTBOX_ENCRYPTION_KEY");
  const key = Buffer.from(encoded, "base64");
  if (key.length !== 32) throw new SupportError("configuration", "This service is temporarily unavailable.", 503);
  return key;
}

export function encryptOutbox(value: string, context: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  cipher.setAAD(Buffer.from(context));
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return [iv, cipher.getAuthTag(), encrypted].map((part) => part.toString("base64url")).join(".");
}

export function decryptOutbox(value: string, context: string) {
  const parts = value.split(".");
  if (parts.length !== 3) throw new Error("Invalid notification payload");
  const [iv, tag, encrypted] = parts.map((part) => Buffer.from(part, "base64url"));
  const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), iv);
  decipher.setAAD(Buffer.from(context));
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
}

export function verifyCronAuthorization(value: string | null) {
  const expected = Buffer.from(`Bearer ${requiredSecret("CRON_SECRET")}`);
  const supplied = Buffer.from(value || "");
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}

export async function rateLimit(scope: string, identity: string, limit: number, windowMs = 60_000) {
  const now = Date.now();
  const bucket = Math.floor(now / windowMs);
  const key = hashNonce(`${scope}:${identity}:${bucket}`);
  const row = await prisma.supportRateLimit.upsert({
    where: { key }, create: { key, count: 1, expiresAt: new Date((bucket + 2) * windowMs) },
    update: { count: { increment: 1 } },
  });
  if (row.count > limit) throw new SupportError("rate_limit", "Too many attempts. Please wait a minute and try again.", 429);
}

export async function financialTransaction<T>(work: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await prisma.$transaction(work, { maxWait: 5000, timeout: 10000 });
    } catch (error) {
      if (attempt >= 2 || !(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2034") throw error;
      await new Promise((resolve) => setTimeout(resolve, 30 * (attempt + 1)));
    }
  }
}
