import "server-only";
import { Prisma, type BeneficiaryCase } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../db";
import { CASE_PAGE_SIZE, PUBLIC_CASE_ID, SupportError, type PublicBeneficiaryCase } from "./domain";

export const caseLinks = {
  pillar: { select: { published: true, deletedAt: true } },
  program: { select: { published: true, deletedAt: true, pillars: { select: { pillarId: true } } } },
} as const;
type LinkedCase = Prisma.BeneficiaryCaseGetPayload<{ include: typeof caseLinks }>;

export function casePublicWhere(now = new Date()): Prisma.BeneficiaryCaseWhereInput {
  return {
    deletedAt: null, consentGiven: true, consentRevokedAt: null,
    consentRecordedAt: { lte: now }, consentEvidenceRef: { not: null },
    safeguardingApproved: true, safeguardingApprovedBy: { not: null }, safeguardingApprovedAt: { lte: now },
    approvedRevision: { equals: prisma.beneficiaryCase.fields.revision },
    publishedAt: { lte: now },
    AND: [
      { OR: [{ consentExpiresAt: null }, { consentExpiresAt: { gt: now } }] },
      { OR: [{ pillarId: null }, { pillar: { published: true, deletedAt: null } }] },
      { OR: [{ programId: null }, { program: { published: true, deletedAt: null } }] },
    ],
  };
}

export function caseFundableWhere(now = new Date()): Prisma.BeneficiaryCaseWhereInput {
  return {
    AND: [casePublicWhere(now), {
      status: "active", amountRaised: { lt: prisma.beneficiaryCase.fields.amountNeeded },
      OR: [{ closesAt: null }, { closesAt: { gt: now } }],
    }],
  };
}

export function isCasePublic(record: LinkedCase, now = new Date()) {
  const linked = (link: LinkedCase["pillar"]) => !link || (link.published && !link.deletedAt);
  return !record.deletedAt && record.consentGiven && !record.consentRevokedAt
    && !!record.consentRecordedAt && record.consentRecordedAt <= now && !!record.consentEvidenceRef
    && (!record.consentExpiresAt || record.consentExpiresAt > now)
    && record.safeguardingApproved && !!record.safeguardingApprovedBy
    && !!record.safeguardingApprovedAt && record.safeguardingApprovedAt <= now
    && record.approvedRevision === record.revision && !!record.publishedAt && record.publishedAt <= now
    && linked(record.pillar) && linked(record.program)
    && (!record.pillarId || !record.programId || !!record.program?.pillars.some((link) => link.pillarId === record.pillarId));
}

export function isCaseFundable(record: LinkedCase, now = new Date()) {
  return isCasePublic(record, now) && record.status === "active"
    && (!record.closesAt || record.closesAt > now) && record.amountRaised < record.amountNeeded;
}

export function publicCase(record: BeneficiaryCase, fullStory = false): PublicBeneficiaryCase {
  return {
    publicId: record.publicId,
    displayName: record.firstName || "An anonymous learner",
    age: record.age, region: record.region, needType: record.needType,
    needDescription: record.needDescription, storyShort: record.storyShort,
    ...(fullStory ? { storyFull: record.storyFull } : {}),
    amountNeeded: record.amountNeeded, amountRaised: record.amountRaised,
    // Restricted media delivery is not operational. This also covers legacy assets.
    photoUrl: null,
    photoAlt: null,
    status: record.status,
  };
}

const cursorSchema = z.object({ publishedAt: z.iso.datetime(), publicId: z.string().regex(PUBLIC_CASE_ID) }).strict();
export async function getCasePage(options: { cursor?: string | null; archive?: boolean; minimumCapacity?: number; excludePublicId?: string } = {}) {
  let cursor: z.infer<typeof cursorSchema> | null = null;
  if (options.cursor) {
    try {
      if (options.cursor.length > 400) throw new Error("invalid");
      cursor = cursorSchema.parse(JSON.parse(Buffer.from(options.cursor, "base64url").toString("utf8")));
    } catch {
      throw new SupportError("invalid_cursor", "Please refresh the case list.");
    }
  }
  const where: Prisma.BeneficiaryCaseWhereInput = {
    ...(options.excludePublicId ? { publicId: { not: options.excludePublicId } } : {}),
    AND: [
      options.archive ? {
        AND: [casePublicWhere(), { status: { in: ["funded", "archived"] }, fundedAt: { not: null }, amountRaised: { equals: prisma.beneficiaryCase.fields.amountNeeded } }],
      } : caseFundableWhere(),
      ...(cursor ? [{ OR: [
        { publishedAt: { gt: new Date(cursor.publishedAt) } },
        { publishedAt: new Date(cursor.publishedAt), publicId: { gt: cursor.publicId } },
      ] }] : []),
    ],
  };
  const rows = await prisma.beneficiaryCase.findMany({
    where, include: caseLinks, orderBy: [{ publishedAt: "asc" }, { publicId: "asc" }], take: CASE_PAGE_SIZE + 1,
  });
  const page = rows.slice(0, CASE_PAGE_SIZE);
  const last = page.at(-1);
  return {
    cases: page.filter((row) => isCasePublic(row) && (!options.minimumCapacity || row.amountNeeded - row.amountRaised >= options.minimumCapacity)).map((row) => publicCase(row)),
    nextCursor: rows.length > CASE_PAGE_SIZE && last?.publishedAt
      ? Buffer.from(JSON.stringify({ publishedAt: last.publishedAt.toISOString(), publicId: last.publicId })).toString("base64url") : null,
  };
}

export async function getPublicCase(publicId: string) {
  if (!PUBLIC_CASE_ID.test(publicId)) return null;
  const record = await prisma.beneficiaryCase.findFirst({
    where: { AND: [casePublicWhere(), { publicId, status: { in: ["active", "funded", "archived", "closed"] } }] },
    include: caseLinks,
  });
  return record && isCasePublic(record) ? { record, projection: publicCase(record, true), fundable: isCaseFundable(record) } : null;
}

export async function lockCase(tx: Prisma.TransactionClient, id: string) {
  await tx.$queryRaw`SELECT "id" FROM "BeneficiaryCase" WHERE "id" = ${id} FOR UPDATE`;
  const record = await tx.beneficiaryCase.findUnique({ where: { id }, include: caseLinks });
  if (!record) throw new SupportError("case_unavailable", "This case is no longer available.", 404);
  return record;
}
