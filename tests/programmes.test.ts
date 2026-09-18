import assert from "node:assert/strict";
import { afterEach, mock, test } from "node:test";
import type { PrismaClient } from "@prisma/client";
import { futurePathways, syncFuturePathways } from "../prisma/future-pathways";
import { programMetricsSchema } from "../src/lib/programme-content";
import { getPublicProgramme, getPublicProgrammes } from "../src/lib/programmes";
import { prisma } from "../src/lib/db";

const originalFindMany = prisma.program.findMany;
const originalFindFirst = prisma.program.findFirst;
afterEach(() => {
  prisma.program.findMany = originalFindMany;
  prisma.program.findFirst = originalFindFirst;
  mock.restoreAll();
});

test("Future Pathways has six stages and separates delivery from ambition", () => {
  const metrics = programMetricsSchema.parse(futurePathways.impactMetrics);
  assert.deepEqual(metrics.detail?.stages.map((stage) => stage.name), ["Identify", "Prepare", "Train", "Place", "Launch", "Employ"]);
  assert.deepEqual(metrics.detail?.stages.map((stage) => stage.status), ["running", "running", "running", "running", "seeking-partners", "seeking-partners"]);
  assert.equal(metrics.beneficiaries, null);
  assert.equal(metrics.year, 2025);
  assert.equal(metrics.detail?.launched, "February 2025");
  assert.equal(futurePathways.image, null);
  assert.doesNotMatch(JSON.stringify(futurePathways), /Prince|Kojo|Delight|Jane Montessori|West African Vehicle|Cape Coast Technical|WhatsApp/);
});

test("metadata validation rejects invalid stages and unsupported count values", () => {
  const badStages = structuredClone(futurePathways.impactMetrics);
  (badStages.detail!.stages[0] as { status: string }).status = "funded";
  assert.equal(programMetricsSchema.safeParse(badStages).success, false);
  for (const beneficiaries of [-1, "200", 2.5]) {
    assert.equal(programMetricsSchema.safeParse({ beneficiaries }).success, false);
  }
  assert.equal(programMetricsSchema.safeParse({ detail: { headline: "Incomplete" } }).success, false);
  assert.equal(programMetricsSchema.safeParse({}).success, true);
  assert.deepEqual(programMetricsSchema.parse({ legacyMetric: 12 }).legacyMetric, 12);
});

function database(records: Record<string, unknown>[]) {
  const calls: { operation: string; args: Record<string, unknown> }[] = [];
  const client = {
    program: {
      findMany: async () => records,
      update: async (args: { where: { id: string }; data: Record<string, unknown> }) => {
        calls.push({ operation: "update", args });
        return { ...records[0], ...args.data };
      },
      create: async (args: { data: Record<string, unknown> }) => {
        calls.push({ operation: "create", args });
        return { id: "new", ...args.data };
      },
    },
  } as unknown as PrismaClient;
  return { client, calls };
}

test("import renames the old record in place and preserves publication state", async () => {
  const { client, calls } = database([{ id: "existing", slug: "project-future-ready", published: false, order: 7 }]);
  const result = await syncFuturePathways(client);
  assert.equal(result.id, "existing");
  assert.equal(result.slug, "future-pathways");
  assert.equal(result.published, false);
  assert.equal(result.order, 7);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].operation, "update");
});

test("repeated import preserves subsequent CMS edits", async () => {
  const edited = { id: "existing", slug: "future-pathways", name: "CMS revision", published: true };
  const { client, calls } = database([edited]);
  assert.deepEqual(await syncFuturePathways(client), edited);
  assert.equal(calls.length, 0);
});

test("import refuses archived or duplicate programme records", async () => {
  const archived = database([{ slug: "project-future-ready", deletedAt: new Date() }]);
  await assert.rejects(syncFuturePathways(archived.client), /archived/);
  const duplicate = database([{ slug: "future-pathways" }, { slug: "project-future-ready" }]);
  await assert.rejects(syncFuturePathways(duplicate.client), /Both programme slugs/);
  assert.equal(archived.calls.length + duplicate.calls.length, 0);
});

test("import can create the programme on a fresh database", async () => {
  const { client, calls } = database([]);
  const result = await syncFuturePathways(client);
  assert.equal(result.slug, "future-pathways");
  assert.equal(result.published, true);
  assert.equal(calls[0].operation, "create");
});

test("public summaries query only published, nonarchived programmes", async () => {
  prisma.program.findMany = (async (args: { where: unknown }) => {
    assert.deepEqual(args.where, { published: true, deletedAt: null });
    return [{ ...futurePathways, createdAt: new Date("2025-02-01") }, { slug: "legacy", name: "Legacy", image: null, impactMetrics: null, createdAt: new Date("2020-01-01") }];
  }) as unknown as typeof prisma.program.findMany;
  const [program, legacy] = await getPublicProgrammes();
  assert.equal(program.href, "/initiatives/future-pathways");
  assert.equal(program.beneficiaries, null);
  assert.equal(program.featured, true);
  assert.equal(legacy.href, undefined);
  assert.equal(legacy.beneficiaries, null);
});

test("detail lookup excludes missing, unpublished and invalid content", async () => {
  const lookup = mock.fn(async (args: { where: unknown }): Promise<unknown> => {
    assert.deepEqual(args.where, { slug: "future-pathways", published: true, deletedAt: null });
    return null;
  });
  prisma.program.findFirst = lookup as unknown as typeof prisma.program.findFirst;
  assert.equal(await getPublicProgramme("future-pathways"), null);
  lookup.mock.mockImplementation(async () => ({ ...futurePathways, impactMetrics: {} }));
  assert.equal(await getPublicProgramme("future-pathways"), null);
  lookup.mock.mockImplementation(async () => futurePathways);
  assert.equal((await getPublicProgramme("future-pathways"))?.detail.stages.length, 6);
});
