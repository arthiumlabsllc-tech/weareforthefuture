// Isolated local production-build harness. No provider credentials or live database.
import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const database = process.env.SUPPORT_TEST_DATABASE_URL;
if (!database) throw new Error("Set SUPPORT_TEST_DATABASE_URL to a migrated disposable local database.");
const url = new URL(database);
if (!["127.0.0.1", "localhost"].includes(url.hostname) || !/^\/ftf_step8(?:_[a-z0-9]+)?$/.test(url.pathname)) throw new Error("Only a local Step 8 database is allowed.");
const env = { ...process.env, DATABASE_URL: database, SUPPORT_TEST_DATABASE_URL: database,
  SUPPORT_TEST_SERVER_ORIGIN: "http://127.0.0.1:3128", SUPPORT_A_FUTURE_ORIGIN: "http://127.0.0.1:3128",
  SUPPORT_A_FUTURE_ENABLED: "false", PAYSTACK_SECRET_KEY: "", SENDGRID_API_KEY: "", SENDGRID_FROM_EMAIL: "", SUPPORT_FINANCE_ALERT_EMAIL: "",
  ADMIN_JWT_SECRET: randomBytes(32).toString("hex"), SUPPORTER_JWT_SECRET: randomBytes(32).toString("hex"),
  SUPPORT_REFUND_TOKEN_SECRET: randomBytes(32).toString("hex"),
  SUPPORT_OUTBOX_ENCRYPTION_KEY: randomBytes(32).toString("base64"), CRON_SECRET: randomBytes(32).toString("hex"),
};
delete env.VERCEL_ENV;
if (process.argv.includes("--build")) {
  for (const script of ["scripts/check-banned-language.mjs", "scripts/check-design-tokens.mjs"]) {
    const checks = spawn(process.execPath, [script], { cwd: root, env, stdio: "inherit" });
    const checked = await new Promise((resolve) => { checks.on("error", () => resolve(1)); checks.on("exit", resolve); });
    if (checked !== 0) process.exit(1);
  }
  const build = spawn(process.execPath, ["node_modules/next/dist/bin/next", "build"], { cwd: root, env, stdio: "inherit" });
  const built = await new Promise((resolve) => { build.on("error", () => resolve(1)); build.on("exit", resolve); });
  if (built !== 0) process.exit(1);
}
const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", "3128"], { cwd: root, env, stdio: "inherit" });
let exitCode = 0;
server.on("error", () => { process.exitCode = 1; });
server.on("exit", (code) => process.exit(exitCode || code || 0));
process.on("SIGINT", () => { server.kill(); });
process.on("SIGTERM", () => { server.kill(); });
let ready = false;
for (let attempt = 0; attempt < 60; attempt++) {
  try { const response = await fetch(env.SUPPORT_TEST_SERVER_ORIGIN + "/give/support-a-future/refund/invalid", { signal: AbortSignal.timeout(1000) }); ready = response.ok; } catch {}
  if (ready) break;
  await new Promise((resolve) => setTimeout(resolve, 500));
}
if (!ready) { exitCode = 1; server.kill(); throw new Error("Isolated server did not start."); }
const tests = spawn(process.execPath, ["--conditions=react-server", "--import", "tsx", "--test", "tests/support-a-future-http.test.ts"], { cwd: root, env, stdio: "inherit" });
tests.on("error", () => { exitCode = 1; server.kill(); });
tests.on("exit", (code) => {
  if (code !== 0) { exitCode = code || 1; server.kill(); }
  else console.log("Isolated HTTP tests passed. Server remains available at http://127.0.0.1:3128 for local browser verification.");
});
