import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";
import { resolve } from "node:path";
import { syncFuturePathways } from "../prisma/future-pathways";

loadEnvConfig(resolve(__dirname, ".."));
const prisma = new PrismaClient();

async function main() {
  if (!process.argv.includes("--apply")) {
    const records = await prisma.program.findMany({
      where: { slug: { in: ["project-future-ready", "future-pathways"] } },
      select: { id: true, slug: true, name: true, published: true, deletedAt: true },
    });
    console.log({ records, message: "Use --apply to import Future Pathways only. No other content is modified." });
    return;
  }
  const program = await syncFuturePathways(prisma);
  console.log({ id: program.id, slug: program.slug, published: program.published });
}

main().catch((error: unknown) => {
  const code = typeof error === "object" && error !== null && "code" in error ? String(error.code) : "unknown";
  console.error(`Future Pathways import failed (${error instanceof Error ? error.name : "Error"}, ${code}). Check database connectivity and conflicting or archived programme records.`);
  process.exitCode = 1;
}).finally(() => prisma.$disconnect());
