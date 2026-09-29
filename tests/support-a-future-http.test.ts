import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { refundDeadline, type CaseDraft } from "../src/lib/support-a-future/domain";

// Run only through the isolated server harness; never inherit a live .env database.
test("isolated HTTP authorization, case workflow and private choice rendering", { timeout: 120_000 }, async (t) => {
  const database = process.env.SUPPORT_TEST_DATABASE_URL;
  const origin = process.env.SUPPORT_TEST_SERVER_ORIGIN;
  assert.ok(database && origin && process.env.ADMIN_JWT_SECRET && process.env.SUPPORTER_JWT_SECRET);
  const dbUrl = new URL(database);
  assert.ok(["localhost", "127.0.0.1"].includes(dbUrl.hostname) && /^\/ftf_step8(?:_[a-z0-9]+)?$/.test(dbUrl.pathname));
  assert.equal(origin, "http://127.0.0.1:3128");
  assert.equal(process.env.SUPPORT_A_FUTURE_ENABLED, "false");
  assert.equal(process.env.PAYSTACK_SECRET_KEY, "");
  assert.equal(process.env.SENDGRID_API_KEY, "");
  process.env.DATABASE_URL = database;
  const { prisma } = await import("../src/lib/db");
  const { createSessionToken } = await import("../src/lib/admin-auth");
  const { signChoiceToken } = await import("../src/lib/support-a-future/security");
  const { acceptDonorChoice } = await import("../src/lib/support-a-future/resolutions");
  const { getPublicCase } = await import("../src/lib/support-a-future/cases");
  const actor = async (role: "SUPER_ADMIN" | "EDITOR" | "SAFEGUARDING_OFFICER") => {
    const user = await prisma.user.create({ data: { email: `${randomUUID()}@example.test`, role, passwordHash: "synthetic-unusable" } });
    return { user, cookie: `ftf-admin-session=${await createSessionToken({ userId: user.id, email: user.email, role })}` };
  };
  const request = (path: string, cookie = "", method = "GET", body?: unknown, requestOrigin = origin) => fetch(origin + path, {
    method, redirect: "manual", headers: { cookie, origin: requestOrigin, "content-type": "application/json", "sec-fetch-site": "same-origin" },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }), signal: AbortSignal.timeout(15000),
  });
  const draft: CaseDraft = { firstName: "Synthetic", age: null, region: "Ashanti", needType: "Learning",
    needDescription: "Synthetic learning materials for local testing only.", storyShort: "Synthetic test case. No real beneficiary is represented.",
    storyFull: "Synthetic test case for approved learning materials. FTF administers the verified need and records progress. No real beneficiary is represented.",
    amountNeeded: 10000, pillarId: null, programId: null, consentGiven: true, consentRecordedAt: new Date().toISOString(),
    consentEvidenceRef: "synthetic-private-evidence", consentExpiresAt: null, closesAt: null, photoAssetId: null, photoAlt: null };
  try {
    const author = await actor("SUPER_ADMIN");
    const reviewer = await actor("SAFEGUARDING_OFFICER");
    const editor = await actor("EDITOR");
    const collection = "/api/admin/beneficiary-cases";
    let caseId = "";
    await t.test("API guards reject anonymous, cross-origin and forbidden fields", async () => {
      assert.equal((await request(collection)).status, 401);
      assert.equal((await request(collection, author.cookie, "POST", draft, "https://attacker.example")).status, 403);
      assert.equal((await request(collection, reviewer.cookie, "POST", draft)).status, 403);
      const invalid = await request(collection, author.cookie, "POST", { ...draft, amountRaised: 1, safeguardingApproved: true });
      assert.equal(invalid.status, 400);
      assert.match(invalid.headers.get("cache-control")!, /no-store/);
      assert.equal((await request(collection, author.cookie, "POST", { ...draft, storyFull: "Contact hidden@example.test" })).status, 400);
      const response = await request(collection, author.cookie, "POST", draft);
      assert.equal(response.status, 201);
      const { record } = await response.json();
      caseId = record.id;
      assert.equal(record.status, "draft");
      assert.equal(record.createdBy, author.user.id);
      assert.equal(record.safeguardingApproved, false);
      assert.equal(await getPublicCase(record.publicId), null);
    });
    await t.test("case workspace renders saved preview, restricted evidence and role-specific actions", async () => {
      const list = await request("/admin/beneficiary-cases", reviewer.cookie);
      assert.equal(list.status, 200);
      assert.match(list.headers.get("cache-control")!, /no-store/);
      const listHtml = await list.text();
      assert.match(listHtml, /Case workflow table|No matching cases/);
      assert.doesNotMatch(listHtml, /synthetic-private-evidence/);
      assert.equal((await request("/admin/beneficiary-cases/new", reviewer.cookie)).status, 403);
      const create = await request("/admin/beneficiary-cases/new", editor.cookie);
      assert.equal(create.status, 200);
      assert.match(await create.text(), /Create a private case draft/);
      const detail = await request(`/admin/beneficiary-cases/${caseId}`, reviewer.cookie);
      assert.equal(detail.status, 200);
      const html = await detail.text();
      assert.match(html, /Saved public-content preview/);
      assert.match(html, /Restricted consent evidence/);
      assert.match(html, /synthetic-private-evidence/);
      assert.match(html, /Editorial audit timeline/);
      assert.doesNotMatch(html, /Save new draft revision|Open excess-resolution queue/);
      assert.match(await (await request(`/admin/beneficiary-cases/${caseId}`, author.cookie)).text(), /Save new draft revision/);
      const anonymous = await request(`/admin/beneficiary-cases/${caseId}`);
      assert.ok(anonymous.status >= 300 && anonymous.status < 400);
    });
    await t.test("independent review, revision invalidation and withdrawal", async () => {
      assert.ok(caseId);
      const path = `${collection}/${caseId}`;
      const transition = (cookie: string, action: string, revision = 1, extra = {}) => request(path, cookie, "POST", {
        action, revision, reason: "Synthetic workflow verification only.", ...extra,
      });
      assert.equal((await transition(author.cookie, "publish")).status, 409);
      assert.equal((await transition(author.cookie, "submit")).status, 200);
      const checks = { reviewedContent: true, reviewedConsent: true, reviewedMedia: true };
      assert.equal((await transition(author.cookie, "approve", 1, checks)).status, 403);
      assert.equal((await transition(reviewer.cookie, "approve")).status, 400);
      assert.equal((await transition(reviewer.cookie, "approve", 1, checks)).status, 200);
      assert.equal((await transition(reviewer.cookie, "publish")).status, 403);
      assert.equal((await transition(editor.cookie, "publish")).status, 403);
      const published = await transition(author.cookie, "publish");
      assert.equal(published.status, 200);
      const { record } = await published.json();
      assert.ok((await getPublicCase(record.publicId))?.fundable);
      const save = await request(path, editor.cookie, "PATCH", { revision: 1, draft: { ...draft, storyShort: "Updated synthetic learning case for testing." } });
      assert.equal(save.status, 200);
      const saved = (await save.json()).record;
      assert.equal(saved.revision, 2);
      assert.equal(saved.approvedRevision, null);
      assert.equal(await getPublicCase(record.publicId), null);
      assert.equal((await transition(author.cookie, "publish", 1)).status, 409);
      assert.equal((await transition(editor.cookie, "submit", 2)).status, 200);
      assert.equal((await transition(reviewer.cookie, "approve", 2, checks)).status, 200);
      assert.equal((await transition(author.cookie, "publish", 2)).status, 200);
      assert.equal((await transition(editor.cookie, "withdraw", 2)).status, 403);
      const withdrawal = await transition(reviewer.cookie, "withdraw", 2);
      assert.equal(withdrawal.status, 200);
      const withdrawn = (await withdrawal.json()).record;
      assert.ok(withdrawn.consentRevokedAt);
      assert.equal(await getPublicCase(record.publicId), null);
      assert.equal((await request(path, author.cookie, "PATCH", { revision: withdrawn.revision, draft })).status, 409, "Old consent cannot undo withdrawal");
      const detail = await request(path, reviewer.cookie);
      const body = await detail.json();
      assert.ok(body.history.length >= 8);
      assert.equal(JSON.stringify(body.preview).includes("consentEvidenceRef"), false);
      assert.equal(JSON.stringify(body.history).includes("synthetic-private-evidence"), false);
      assert.equal((await request(collection, reviewer.cookie)).status, 200);
      await prisma.user.update({ where: { id: reviewer.user.id }, data: { suspended: true } });
      assert.equal((await request(path, reviewer.cookie)).status, 401);
    });
    await t.test("SSR authorization rechecks the current role", async () => {
      await prisma.user.update({ where: { id: author.user.id }, data: { role: "SAFEGUARDING_OFFICER" } });
      assert.equal((await request("/admin/dashboard", author.cookie)).status, 403);
      assert.equal((await request("/admin/refunds", author.cookie)).status, 403);
      assert.equal((await request("/admin/unmapped", author.cookie)).status, 403);
      assert.equal(new URL((await request("/admin", author.cookie)).headers.get("location")!, origin).href, `${origin}/admin/beneficiary-cases`);
      await prisma.user.update({ where: { id: author.user.id }, data: { suspended: true } });
      assert.equal(new URL((await request("/admin/beneficiary-cases", author.cookie)).headers.get("location")!, origin).href, `${origin}/login`);
    });

    // Synthetic fixtures are restricted to this disposable database and ignored local artifacts.
    const fixtureReviewer = await actor("SAFEGUARDING_OFFICER");
    const makeCase = async (funded = false, legacyMedia = false) => {
      const counter = await prisma.casePublicIdCounter.upsert({ where: { year: 2098 }, create: { year: 2098, nextNumber: 2 }, update: { nextNumber: { increment: 1 } } });
      const now = new Date();
      return prisma.beneficiaryCase.create({ data: { ...draft, consentRecordedAt: now,
        publicId: `FTF-2098-${String(counter.nextNumber - 1).padStart(3, "0")}`, amountNeeded: funded ? 6000 : 10000, amountRaised: funded ? 6000 : 0,
        ...(legacyMedia ? { photoUrl: "https://example.test/synthetic-legacy-original.jpg", photoAssetId: "synthetic-private-asset", photoAlt: "Synthetic restricted alt" } : {}),
        publishedAt: now, safeguardingApproved: true, safeguardingApprovedAt: now, safeguardingApprovedBy: fixtureReviewer.user.id,
        approvedRevision: 1, reviewStatus: "approved", status: funded ? "funded" : "active", fundedAt: funded ? now : null } });
    };
    const target = await makeCase(false, true);
    const putFirst = async (id: string) => {
      const oldest = await prisma.beneficiaryCase.aggregate({ _min: { publishedAt: true } });
      await prisma.beneficiaryCase.update({ where: { id }, data: { publishedAt: new Date((oldest._min.publishedAt?.getTime() ?? Date.now()) - 1) } });
    };
    await putFirst(target.id);
    const privatePattern = /synthetic-private-evidence|synthetic-private-asset|synthetic-legacy-original|Synthetic restricted alt|consentEvidenceRef|safeguardingApprovedBy|donorEmail|photoAssetId|providerTransactionId/;
    const publicFields = ["publicId", "displayName", "age", "region", "needType", "needDescription", "storyShort", "amountNeeded", "amountRaised", "photoUrl", "photoAlt", "status"];
    await t.test("public list and detail expose only current allowlisted fields without legacy media", async () => {
      const list = await request("/api/support-a-future/cases");
      assert.equal(list.status, 200);
      assert.match(list.headers.get("cache-control")!, /no-store/);
      assert.equal(list.headers.get("referrer-policy"), "no-referrer");
      const page = await list.json();
      assert.deepEqual(Object.keys(page).sort(), ["cases", "checkoutEnabled", "nextCursor"]);
      assert.equal(page.checkoutEnabled, false);
      assert.ok(page.cases.length > 0 && page.cases.length <= 20);
      assert.equal(page.cases[0].publicId, target.publicId);
      for (const row of page.cases) {
        assert.deepEqual(Object.keys(row).sort(), [...publicFields].sort());
        assert.equal(row.photoUrl, null); assert.equal(row.photoAlt, null);
      }
      assert.doesNotMatch(JSON.stringify(page), privatePattern);
      const response = await request(`/api/support-a-future/cases/${target.publicId}`);
      assert.equal(response.status, 200);
      const detail = await response.json();
      assert.deepEqual(Object.keys(detail).sort(), ["case", "checkoutEnabled", "fundable"]);
      assert.deepEqual(Object.keys(detail.case).sort(), [...publicFields, "storyFull"].sort());
      assert.equal(detail.fundable, true);
      assert.equal(detail.checkoutEnabled, false);
      assert.doesNotMatch(JSON.stringify(detail), privatePattern);
      for (const id of [target.publicId, "FTF-2000-000", "invalid"]) {
        const media = await request(`/api/support-a-future/cases/${id}/media`);
        assert.equal(media.status, 404); assert.equal(media.headers.get("location"), null);
        assert.match(media.headers.get("cache-control")!, /no-store/);
        assert.deepEqual(await media.json(), { error: "Case media is unavailable." });
      }
    });
    await t.test("public SSR stays readable, generic, non-indexable and provider-disabled", async () => {
      const funded = await makeCase(true, true); await putFirst(funded.id);
      for (const path of ["/give/support-a-future", `/give/support-a-future/${target.publicId}`, "/give/support-a-future/archive"]) {
        const response = await request(path);
        assert.equal(response.status, 200);
        assert.match(response.headers.get("cache-control")!, /no-store/);
        assert.match(response.headers.get("x-robots-tag")!, /noindex/);
        assert.equal(response.headers.get("referrer-policy"), "no-referrer");
        const html = await response.text();
        assert.match(html, /Synthetic/); assert.match(html, /<article\b/); assert.match(html, /<noscript>/);
        assert.doesNotMatch(html, privatePattern);
        assert.doesNotMatch(html, /<meta[^>]+(?:property="og:image"|name="twitter:image")|<link[^>]+rel="canonical"/i);
        assert.doesNotMatch(html, /<script[^>]+src="[^"]*(?:paystack|google|vercel|analytics)/i);
        assert.doesNotMatch(html, /id="case-(?:amount|email)"/);
        const flight: Response = await fetch(origin + path, { headers: { rsc: "1" } });
        assert.match(flight.headers.get("content-type")!, /text\/html/);
        assert.equal(await flight.text(), "");
      }
      const before = await prisma.supportPaymentIntent.count();
      const blocked = await request("/api/support-a-future/initialize", "", "POST", { publicId: target.publicId, amountInPesewas: 1000, email: "synthetic-donor@example.test", channel: "card" });
      assert.equal(blocked.status, 503); assert.equal((await blocked.json()).code, "not_open");
      assert.equal(await prisma.supportPaymentIntent.count(), before);
      await prisma.beneficiaryCase.update({ where: { id: funded.id }, data: { consentRevokedAt: new Date() } });
      assert.equal((await request(`/api/support-a-future/cases/${funded.publicId}`)).status, 404);
      const archive = await (await request("/api/support-a-future/cases?archive=true")).json();
      assert.ok(archive.cases.every((row: { publicId: string }) => row.publicId !== funded.publicId));
    });
    await t.test("invalid cursors and withdrawn cases fail closed without false funded outcomes", async () => {
      for (const query of ["cursor=not-json", `cursor=${"x".repeat(401)}`, "archive=yes", "unknown=true", "archive=true&archive=false"]) {
        assert.equal((await request(`/api/support-a-future/cases?${query}`)).status, 400);
      }
      const withdrawn = await makeCase(); await putFirst(withdrawn.id);
      await prisma.beneficiaryCase.update({ where: { id: withdrawn.id }, data: { consentRevokedAt: new Date() } });
      const detail = await request(`/api/support-a-future/cases/${withdrawn.publicId}`);
      assert.equal(detail.status, 404); assert.deepEqual(await detail.json(), { error: "This case is unavailable.", code: "case_unavailable" });
      const html = await (await request(`/give/support-a-future/${withdrawn.publicId}`)).text();
      assert.match(html, /This case is unavailable/); assert.doesNotMatch(html, /Synthetic test case|Synthetic learning materials/);
      const list = await (await request("/api/support-a-future/cases")).json();
      assert.ok(list.cases.every((row: { publicId: string }) => row.publicId !== withdrawn.publicId));
      const closed = await makeCase(); await putFirst(closed.id);
      await prisma.beneficiaryCase.update({ where: { id: closed.id }, data: { status: "closed" } });
      const archive = await (await request("/api/support-a-future/cases?archive=true")).json();
      assert.ok(archive.cases.every((row: { publicId: string }) => row.publicId !== closed.publicId));
    });
    const fixture = async (expired = false) => {
      const original = await makeCase(true);
      const paidAt = new Date(Date.now() - (expired ? 15 * 86400000 : 1000));
      const due = refundDeadline(paidAt);
      const gift = await prisma.donation.create({ data: { amount: 10000, amountCreditedToCase: 6000, amountExcess: 4000,
        donorEmail: "synthetic-donor@example.test", beneficiaryCaseId: original.id, paymentReference: `FTF-SAF-${randomUUID()}`,
        paymentStatus: "paid", paidAt, refundDueAt: due, refundStatus: "pending",
        ledgerEntries: { create: [{ amount: 6000, kind: "original_case_credit", beneficiaryCaseId: original.id, operationKey: randomUUID() },
          { amount: 4000, kind: "excess_held", operationKey: randomUUID() }] } } });
      const signed = await signChoiceToken(gift.id, due, paidAt);
      const row = await prisma.excessChoiceToken.create({ data: { donationId: gift.id, nonceHash: signed.nonceHash, expiresAt: due, issuedAt: paidAt } });
      return { url: `${origin}/give/support-a-future/refund/${signed.token}`, token: signed.token, giftId: gift.id, tokenId: row.id, caseId: original.id };
    };
    type ChoiceAction = "refreshChoice" | "loadChoiceTargets" | "submitChoice";
    const manifest = JSON.parse(await readFile(resolve(".next/server/server-reference-manifest.json"), "utf8")) as {
      node: Record<string, { filename: string; exportedName: string }>;
    };
    const actionIds = new Map<ChoiceAction, string>();
    for (const name of ["refreshChoice", "loadChoiceTargets", "submitChoice"] as const) {
      const entry = Object.entries(manifest.node).find(([, value]) => value.filename === "src/app/give/support-a-future/refund/[token]/actions.ts" && value.exportedName === name);
      assert.ok(entry, `The production build must expose ${name}`);
      actionIds.set(name, entry[0]);
    }
    const actionRequest = (url: string, name: ChoiceAction, args: unknown[], requestOrigin: string | null = origin, site = "same-origin") => fetch(url, {
      method: "POST", redirect: "manual", headers: { "next-action": actionIds.get(name)!, "content-type": "text/plain;charset=UTF-8",
        accept: "text/x-component", "sec-fetch-site": site, ...(requestOrigin ? { origin: requestOrigin } : {}) },
      body: JSON.stringify(args), signal: AbortSignal.timeout(15000),
    });
    const actionResult = async (response: Response) => {
      assert.equal(response.status, 200);
      assert.match(response.headers.get("content-type")!, /text\/x-component/);
      assert.match(response.headers.get("cache-control")!, /no-store/);
      assert.equal(response.headers.get("referrer-policy"), "no-referrer");
      assert.match(response.headers.get("x-robots-tag")!, /noindex/);
      const stream = await response.text();
      const result = stream.split("\n").map((line) => line.match(/^[0-9a-f]+:(\{"ok":.*\})$/)?.[1]).find(Boolean);
      assert.ok(result, "Expected a serialized server-action result, not a document fallback");
      return JSON.parse(result);
    };
    const refund = await fixture();
    const general = await fixture();
    const otherCase = await fixture();
    const expired = await fixture(true);
    await t.test("supporter history authenticates current accounts and isolates private retained-giving projections", async () => {
      const { createSessionToken: supporterToken } = await import("../src/lib/supporter-auth");
      const { SignJWT } = await import("jose");
      const account = async () => {
        const row = await prisma.supporter.create({ data: { name: "Synthetic", email: `${randomUUID()}@example.test`, passwordHash: "synthetic-unusable" } });
        return { row, cookie: `ftf-supporter-session=${await supporterToken({ supporterId: row.id, email: row.email, name: row.name })}` };
      };
      const owner = await account();
      const other = await account();
      const gift = await fixture();
      await prisma.donation.update({ where: { id: gift.giftId }, data: { supporterId: owner.row.id } });
      await prisma.donation.createMany({ data: [
        { supporterId: owner.row.id, amount: 1000, paymentStatus: "paid" },
        { supporterId: owner.row.id, amount: 5000, paymentStatus: "pending" },
        { supporterId: owner.row.id, amount: 700, currency: "USD", paymentStatus: "paid" },
        { supporterId: other.row.id, amount: 9900, paymentStatus: "paid" },
      ] });
      const path = "/api/supporter/donations";
      const expiredToken = await new SignJWT({ supporterId: owner.row.id }).setProtectedHeader({ alg: "HS256" })
        .setExpirationTime(1).sign(new TextEncoder().encode(process.env.SUPPORTER_JWT_SECRET));
      const missing = await supporterToken({ supporterId: "missing-supporter", name: "Synthetic", email: "missing@example.test" });
      for (const cookie of ["", "ftf-supporter-session=invalid", `ftf-supporter-session=${expiredToken}`, `ftf-supporter-session=${missing}`,
        `ftf-supporter-session=${await createSessionToken({ userId: editor.user.id, email: editor.user.email, role: "EDITOR" })}`]) {
        const denied = await request(path, cookie);
        assert.equal(denied.status, 401);
        assert.match(denied.headers.get("cache-control")!, /no-store/);
        assert.deepEqual(await denied.json(), { error: "Not authenticated" });
      }
      const response = await request(`${path}?supporterId=${other.row.id}`, owner.cookie);
      assert.equal(response.status, 200);
      assert.match(response.headers.get("cache-control")!, /private.*no-store/);
      assert.equal(response.headers.get("referrer-policy"), "no-referrer");
      assert.match(response.headers.get("x-robots-tag")!, /noindex/);
      const history = await response.json();
      assert.equal(history.donations.length, 4);
      assert.deepEqual(history.totals.sort((a: { currency: string }, b: { currency: string }) => a.currency.localeCompare(b.currency)),
        [{ currency: "GHS", amount: 7000, unreconciledCount: 0 }, { currency: "USD", amount: 700, unreconciledCount: 0 }]);
      const caseGift = history.donations.find((row: { id: string }) => row.id === gift.giftId);
      assert.equal(caseGift.amount, 10000); assert.equal(caseGift.retainedGivingAmount, 6000);
      assert.equal(caseGift.caseAllocation.heldAmount, 4000);
      assert.doesNotMatch(JSON.stringify(history), /donorEmail|paymentReference|beneficiaryCaseId|providerId|nonceHash|consentEvidenceRef|storyShort|photoUrl/);
      const otherHistory = await (await request(path, other.cookie)).json();
      assert.equal(otherHistory.donations.length, 1);
      assert.equal(otherHistory.totals[0].amount, 9900);
      await prisma.supporter.update({ where: { id: owner.row.id }, data: { deletedAt: new Date() } });
      assert.equal((await request(path, owner.cookie)).status, 401, "An existing session cannot read a deleted account");
    });
    await t.test("receipt endpoint and document stay private while provider access is disabled", async () => {
      for (const body of [{}, { reference: "../invalid" }, { reference: "synthetic-valid-reference", amount: 100 }]) {
        assert.equal((await request("/api/paystack/verify", "", "POST", body)).status, 400);
      }
      const reference = `FTF-SAF-${randomUUID()}`;
      const response = await request("/api/paystack/verify", "", "POST", { reference });
      assert.equal(response.status, 503);
      assert.match(response.headers.get("cache-control")!, /no-store/);
      assert.equal(response.headers.get("referrer-policy"), "no-referrer");
      assert.deepEqual(await response.json(), { error: "Payments are unavailable in this environment." });
      const receipt = await request(`/donate/success?reference=${reference}&source=store`);
      assert.equal(receipt.status, 200);
      assert.match(receipt.headers.get("cache-control")!, /no-store/);
      assert.equal(receipt.headers.get("referrer-policy"), "no-referrer");
      assert.match(receipt.headers.get("x-robots-tag")!, /noindex/);
      const html = await receipt.text();
      assert.doesNotMatch(html, /<script[^>]+src="[^"]*(?:paystack|google|vercel|analytics)|<link[^>]+rel="canonical"/i);
      const flight = await fetch(`${origin}/donate/success?reference=${reference}`, { headers: { rsc: "1" } });
      assert.match(flight.headers.get("content-type")!, /text\/html/); assert.equal(await flight.text(), "");
    });
    await t.test("scanner GET is read-only and sensitive responses contain no public metadata", async () => {
      const response = await fetch(refund.url);
      assert.equal(response.status, 200);
      assert.match(response.headers.get("cache-control")!, /no-store/);
      assert.equal(response.headers.get("referrer-policy"), "no-referrer");
      assert.match(response.headers.get("x-robots-tag")!, /noindex/);
      assert.match(response.headers.get("content-security-policy")!, /connect-src 'self'/);
      const html = await response.text();
      assert.match(html, /Refund the excess/);
      assert.match(html, /Redirect to our general fund/);
      assert.match(html, /Redirect to another case/);
      assert.doesNotMatch(html, /<meta[^>]+(?:property="og:image"|name="twitter:image")|<link[^>]+rel="canonical"/i);
      assert.doesNotMatch(html, /<script[^>]+src="[^"]*(?:google|vercel|analytics)/i);
      assert.doesNotMatch(html, /<img\b|synthetic-donor@example.test|synthetic-private-evidence/);
      assert.equal((await prisma.excessChoiceToken.findUniqueOrThrow({ where: { id: refund.tokenId } })).consumedAt, null);
      assert.equal(await prisma.excessResolution.count({ where: { donationId: refund.giftId } }), 0);
      const flight = await fetch(refund.url, { headers: { rsc: "1" } });
      assert.match(flight.headers.get("content-type")!, /text\/html/);
      assert.equal(await flight.text(), "");
      const expiredHtml = await (await fetch(expired.url)).text();
      assert.match(expiredHtml, /unavailable/);
      assert.doesNotMatch(expiredHtml, /Credited to the original case/);
    });
    await t.test("private server-action reads preserve authorization and return only safe projections", async () => {
      const gift = await fixture();
      const refreshed = await actionResult(await actionRequest(gift.url, "refreshChoice", [gift.token]));
      assert.equal(refreshed.ok, true);
      assert.equal(refreshed.context.amount, 10000); assert.equal(refreshed.context.credited, 6000); assert.equal(refreshed.context.excess, 4000);
      assert.equal(refreshed.context.resolution, null);
      const targets = await actionResult(await actionRequest(gift.url, "loadChoiceTargets", [gift.token]));
      assert.equal(targets.ok, true); assert.ok(targets.cases.length > 0 && targets.cases.length <= 20);
      for (const row of targets.cases) {
        assert.deepEqual(Object.keys(row).sort(), ["displayName", "needType", "publicId", "region", "remaining"]);
        assert.ok(row.remaining >= 4000);
      }
      assert.doesNotMatch(JSON.stringify([refreshed, targets]), /donorEmail|paymentReference|beneficiaryCaseId|providerId|nonceHash|consentEvidenceRef|storyShort|photoUrl/);
      assert.equal((await prisma.excessChoiceToken.findUniqueOrThrow({ where: { id: gift.tokenId } })).consumedAt, null);
      assert.equal(await prisma.excessResolution.count({ where: { donationId: gift.giftId } }), 0);
    });
    await t.test("server actions reject forged instructions, unavailable links and cross-site requests", async () => {
      const gift = await fixture();
      const decision = { choice: "refund", confirmed: true };
      for (const input of [{ ...decision, confirmed: false }, { ...decision, amount: 1 }, { ...decision, donationId: general.giftId }, { choice: "case", confirmed: true }]) {
        const result = await actionResult(await actionRequest(gift.url, "submitChoice", [gift.token, input]));
        assert.equal(result.ok, false); assert.equal(result.unavailable, false);
      }
      const revoked = await fixture();
      await prisma.excessChoiceToken.update({ where: { id: revoked.tokenId }, data: { revokedAt: new Date() } });
      for (const token of ["invalid", expired.token, revoked.token]) {
        const result = await actionResult(await actionRequest(gift.url, "submitChoice", [token, decision]));
        assert.equal(result.ok, false); assert.equal(result.unavailable, true);
        assert.doesNotMatch(JSON.stringify(result), /10000|6000|4000|synthetic-donor/);
      }
      for (const [requestOrigin, site] of [[null, "same-origin"], [origin, "cross-site"]] as const) {
        const result = await actionResult(await actionRequest(gift.url, "submitChoice", [gift.token, decision], requestOrigin, site));
        assert.equal(result.ok, false);
      }
      const crossOrigin = await actionRequest(gift.url, "submitChoice", [gift.token, decision], "https://attacker.example", "cross-site");
      assert.ok([403, 500].includes(crossOrigin.status), "Framework origin rejection must not execute the action");
      await crossOrigin.text();
      for (const row of [gift, expired, revoked]) {
        assert.equal(await prisma.excessResolution.count({ where: { donationId: row.giftId } }), 0);
        assert.equal((await prisma.excessChoiceToken.findUniqueOrThrow({ where: { id: row.tokenId } })).consumedAt, null);
      }
    });
    await t.test("concurrent HTTP refund instructions accept one excess-only operation without false settlement", async () => {
      const gift = await fixture();
      const results = await Promise.all([1, 2].map(async () => actionResult(await actionRequest(gift.url, "submitChoice", [gift.token, { choice: "refund", confirmed: true }]))));
      for (const result of results) {
        assert.equal(result.ok, true); assert.equal(result.resolution.choice, "refund"); assert.equal(result.resolution.amount, 4000);
        assert.notEqual(result.resolution.state, "completed"); assert.equal(result.resolution.completedAt, null);
      }
      const replay = await actionResult(await actionRequest(gift.url, "submitChoice", [gift.token, { choice: "general", confirmed: true }]));
      assert.equal(replay.ok, true); assert.equal(replay.resolution.choice, "refund");
      assert.equal(await prisma.excessResolution.count({ where: { donationId: gift.giftId } }), 1);
      assert.ok((await prisma.excessChoiceToken.findUniqueOrThrow({ where: { id: gift.tokenId } })).consumedAt);
      const stored = await prisma.donation.findUniqueOrThrow({ where: { id: gift.giftId }, include: { ledgerEntries: true } });
      assert.equal(stored.amountCreditedToCase, 6000); assert.equal(stored.amountExcess, 4000); assert.equal(stored.paymentStatus, "paid");
      assert.equal(stored.refundedAt, null); assert.equal(stored.ledgerEntries.length, 2);
      assert.equal(await prisma.notificationOutbox.count({ where: { donationId: gift.giftId, template: "refund_requested" } }), 1);
      assert.equal(await prisma.notificationOutbox.count({ where: { donationId: gift.giftId, template: "refund_completed" } }), 0);
      assert.match(await (await fetch(gift.url)).text(), /Your excess refund request is recorded/);
    });
    await t.test("HTTP redirects fail closed without provider verification and do not consume the choice", async () => {
      const gift = await fixture();
      const before = await prisma.beneficiaryCase.findUniqueOrThrow({ where: { id: target.id } });
      for (const choice of ["general", "case"] as const) {
        const result = await actionResult(await actionRequest(gift.url, "submitChoice", [gift.token, { choice, confirmed: true, ...(choice === "case" ? { targetPublicId: target.publicId } : {}) }]));
        assert.equal(result.ok, false);
        assert.doesNotMatch(JSON.stringify(result), /sk_|api\.paystack|synthetic-donor/);
      }
      assert.equal((await prisma.excessChoiceToken.findUniqueOrThrow({ where: { id: gift.tokenId } })).consumedAt, null);
      assert.equal(await prisma.excessResolution.count({ where: { donationId: gift.giftId } }), 0);
      assert.equal(await prisma.donationLedgerEntry.count({ where: { donationId: gift.giftId } }), 2);
      assert.equal((await prisma.beneficiaryCase.findUniqueOrThrow({ where: { id: target.id } })).amountRaised, before.amountRaised);
    });
    await t.test("valid used link shows confirmation; withdrawn case loses its label", async () => {
      const used = await fixture();
      await acceptDonorChoice(used.token, { choice: "refund", confirmed: true });
      assert.match(await (await fetch(used.url)).text(), /Your excess refund request is recorded/);
      const privateGift = await fixture();
      await prisma.beneficiaryCase.update({ where: { id: privateGift.caseId }, data: { consentRevokedAt: new Date(), publishedAt: null } });
      const html = await (await fetch(privateGift.url)).text();
      assert.match(html, /an FTF-administered need/);
      assert.doesNotMatch(html, /Your gift to <!-- -->Synthetic/);
    });
    const finance = await actor("SUPER_ADMIN");
    const held = await fixture();
    const { financialTransaction } = await import("../src/lib/support-a-future/security");
    const { holdDonation, lockDonation } = await import("../src/lib/support-a-future/persistence");
    await financialTransaction(async (tx) => holdDonation(tx, await lockDonation(tx, held.giftId), "provider_dispute"));
    await t.test("held private page explains pause without leaking finance details", async () => {
      const html = await (await fetch(held.url)).text();
      assert.match(html, /Automated money movement is paused/);
      assert.match(html, /provider submission is paused/);
      assert.doesNotMatch(html, /provider_dispute|synthetic-donor@example.test|<img\b/);
      assert.match(html, /disabled=""[^>]*>Redirect to our general fund/);
      assert.equal((await prisma.excessChoiceToken.findUniqueOrThrow({ where: { id: held.tokenId } })).consumedAt, null);
    });
    await t.test("finance API guards, masking, strict fields and held escalation", async () => {
      const root = "/api/admin/refunds";
      const path = `${root}/${held.giftId}`;
      const audit = { action: "audit", confirmed: true, reason: "Synthetic finance escalation only." };
      assert.equal((await request(root)).status, 401);
      assert.equal((await request(root, fixtureReviewer.cookie)).status, 403);
      assert.equal((await request(path, editor.cookie)).status, 403);
      assert.equal((await request(path, finance.cookie, "POST", audit, "https://attacker.example")).status, 403);
      const invalid = await request(path, finance.cookie, "POST", { ...audit, reason: "short" });
      assert.equal(invalid.status, 400);
      assert.ok((await invalid.json()).fields.some((field: { field: string }) => field.field === "reason"));
      assert.equal((await request(path, finance.cookie, "POST", { ...audit, amountExcess: 1 })).status, 400);
      for (const action of ["resolve", "retry", "resend"]) assert.equal((await request(path, finance.cookie, "POST", { ...audit, action })).status, 409);
      assert.equal((await request(`${path}?view=targets`, finance.cookie)).status, 409);
      const response = await request(path, finance.cookie, "POST", audit);
      assert.equal(response.status, 200);
      assert.match((await response.json()).message, /hold remains/);
      const detail = await request(path, finance.cookie);
      assert.match(detail.headers.get("cache-control")!, /no-store/);
      const body = await detail.json();
      assert.ok(body.donation.financialHoldAt);
      assert.equal(body.held, 4000);
      assert.equal(body.donation.refundStatus, "audited");
      assert.equal(body.donation.excessResolution, null);
      assert.doesNotMatch(JSON.stringify(body), /payloadEncrypted|nonceHash|leaseToken/);
      const queue = await request(`${root}?status=attention`, finance.cookie);
      const overview = await queue.text();
      assert.doesNotMatch(overview, /synthetic-donor@example.test|donorEmail/);
      assert.match(overview, /financialHoldAt/);
      assert.match(await (await request(`/admin/refunds/${held.giftId}`, finance.cookie)).text(), /Financial hold - automated movement paused|Only escalation is available/);
    });
    await t.test("zero-excess and completed held records allow audit only without rewriting settlement", async () => {
      const original = await makeCase(true);
      const zero = await prisma.donation.create({ data: { amount: 6000, amountCreditedToCase: 6000, beneficiaryCaseId: original.id,
        paymentReference: `FTF-SAF-${randomUUID()}`, paymentStatus: "paid", paidAt: new Date(),
        ledgerEntries: { create: { amount: 6000, kind: "original_case_credit", beneficiaryCaseId: original.id, operationKey: randomUUID() } } } });
      const completed = await fixture();
      // Seed a historical provider-confirmed result in the disposable database, never bypass production preflight.
      await prisma.$transaction(async (tx) => {
        const operation = await tx.excessResolution.create({ data: { donationId: completed.giftId, choice: "refund", amount: 4000,
          actorType: "system", consentText: "Synthetic historical settlement", consentVersion: "synthetic", consentAt: new Date(),
          state: "completed", completedAt: new Date(), providerId: `synthetic-${randomUUID()}` } });
        await tx.donation.update({ where: { id: completed.giftId }, data: { refundStatus: "refunded", refundedAt: new Date(), refundReference: operation.providerId } });
        await tx.donationLedgerEntry.create({ data: { donationId: completed.giftId, resolutionId: operation.id, kind: "refund_excess", amount: 4000, operationKey: randomUUID() } });
      });
      for (const id of [zero.id, completed.giftId]) {
        await financialTransaction(async (tx) => holdDonation(tx, await lockDonation(tx, id), "provider_dispute"));
        const before = await prisma.donation.findUniqueOrThrow({ where: { id }, include: { ledgerEntries: true, excessResolution: true } });
        const response = await request(`/api/admin/refunds/${id}`, finance.cookie, "POST", { action: "audit", confirmed: true, reason: "Synthetic held settlement investigation." });
        assert.equal(response.status, 200);
        const after = await prisma.donation.findUniqueOrThrow({ where: { id }, include: { ledgerEntries: true, excessResolution: true } });
        assert.equal(after.refundStatus, before.refundStatus);
        assert.deepEqual(after.ledgerEntries, before.ledgerEntries);
        assert.deepEqual(after.excessResolution, before.excessResolution);
        assert.ok(after.financialHoldAt && after.refundAuditedAt);
      }
    });
    await t.test("written consent is validated and an accepted refund cannot be overridden", async () => {
      const gift = await fixture();
      const path = `/api/admin/refunds/${gift.giftId}`;
      const body = { action: "resolve", confirmed: true, reason: "Synthetic donor instruction verification.", resolution: {
        decision: { choice: "general", confirmed: true }, evidenceRef: "synthetic/restricted-evidence", consentAt: new Date().toISOString(), consentAmount: 4000, verifiedWrittenConsent: true,
      } };
      const missing = await request(path, finance.cookie, "POST", { ...body, resolution: { decision: body.resolution.decision } });
      assert.equal(missing.status, 400);
      assert.equal((await request(path, finance.cookie, "POST", { ...body, resolution: { ...body.resolution, consentAmount: 3999 } })).status, 409);
      assert.equal((await request(path, finance.cookie, "POST", { ...body, resolution: { ...body.resolution, consentAt: new Date(0).toISOString() } })).status, 409);
      const invalidDate = await request(path, finance.cookie, "POST", { ...body, resolution: { ...body.resolution, consentAt: "2026-09-24:00.000Z" } });
      assert.equal(invalidDate.status, 400);
      assert.ok((await invalidDate.json()).fields.some((field: { field: string }) => field.field === "consentAt"));
      assert.equal(await prisma.excessResolution.count({ where: { donationId: gift.giftId } }), 0);
      const accepted = await acceptDonorChoice(gift.token, { choice: "refund", confirmed: true });
      const conflict = await request(path, finance.cookie, "POST", body);
      assert.equal(conflict.status, 409);
      assert.equal((await conflict.json()).code, "resolution_conflict");
      assert.equal((await prisma.excessResolution.findUniqueOrThrow({ where: { donationId: gift.giftId } })).id, accepted.id);
    });
    await t.test("restricted export is a consistent historical ledger with period and liability totals", async () => {
      const exporter = await actor("SUPER_ADMIN");
      const query = "/api/admin/refunds?export=ledger&from=2001-01-01&to=2001-02-01";
      assert.equal((await request(query, fixtureReviewer.cookie)).status, 403);
      assert.equal((await request("/api/admin/refunds?export=ledger&from=2001-01-01&to=2001-03-01", exporter.cookie)).status, 400);
      const totals = (csv: string) => new Map(csv.split("\r\n").filter((line) => line.startsWith('"summary"')).map((line) => {
        const cells = line.slice(1, -1).split('\",\"');
        return [cells[6], BigInt(cells[7])] as const;
      }));
      const baselineResponse = await request(query, exporter.cookie);
      assert.equal(baselineResponse.status, 200);
      const baseline = totals(await baselineResponse.text());
      const original = await makeCase();
      const date = new Date("2001-01-10T12:00:00.000Z");
      const gift = await prisma.donation.create({ data: { amount: 10000, amountExcess: 10000, beneficiaryCaseId: original.id,
        donorEmail: "export-private@example.test", paymentReference: `FTF-SAF-${randomUUID()}`, paymentStatus: "paid", paidAt: date,
        refundDueAt: refundDeadline(date), refundStatus: "audited", financialHoldAt: date, financialHoldReason: "synthetic_history",
        ledgerEntries: { create: { kind: "excess_held", amount: 10000, createdAt: date, operationKey: randomUUID() } } } });
      await prisma.auditLog.create({ data: { entity: "SupportAFuture", entityId: gift.id, action: "EXCESS_AUDITED", createdAt: date } });
      const exported = await request(query, exporter.cookie);
      assert.equal(exported.status, 200);
      assert.match(exported.headers.get("content-type")!, /text\/csv/);
      assert.match(exported.headers.get("cache-control")!, /no-store/);
      const csv = await exported.text();
      assert.doesNotMatch(csv, /export-private@example.test/);
      const result = totals(csv);
      for (const key of ["closing_held_excess", "period_new_excess", "closing_overdue_audited", "closing_held_under_reconciliation"]) assert.equal(result.get(key)! - baseline.get(key)!, BigInt(10000), key);
      assert.equal(result.get("opening_held_excess"), baseline.get("opening_held_excess"));
      assert.equal(result.get("closing_overdue_pending"), baseline.get("closing_overdue_pending"));
    });
    await t.test("historical exports conserve boundary movements and ignore later audit and settlement labels", async () => {
      const exporter = await actor("SUPER_ADMIN");
      const path = "/api/admin/refunds?export=ledger&from=2002-01-01&to=2002-02-01";
      const totals = (csv: string) => new Map(csv.split("\r\n").filter((line) => line.startsWith('"summary"')).map((line) => {
        const cells = line.slice(1, -1).split('\",\"');
        return [cells[6], BigInt(cells[7])] as const;
      }));
      const baselineResponse = await request(path, exporter.cookie);
      assert.equal(baselineResponse.status, 200);
      const baseline = totals(await baselineResponse.text());
      const original = await makeCase();
      const destination = await makeCase();
      const historicalGift = async (amount: number, date: string) => prisma.donation.create({ data: {
        amount, amountExcess: amount, beneficiaryCaseId: original.id, paymentReference: `FTF-SAF-${randomUUID()}`,
        paymentStatus: "paid", paidAt: new Date(date), refundDueAt: refundDeadline(new Date(date)), refundStatus: "pending",
        ledgerEntries: { create: { kind: "excess_held", amount, createdAt: new Date(date), operationKey: randomUUID() } },
      } });
      const settle = async (gift: { id: string; amountExcess: number }, choice: "refund" | "general" | "case", date: string) => {
        await prisma.$transaction(async (tx) => {
          const time = new Date(date);
          const operation = await tx.excessResolution.create({ data: { donationId: gift.id, choice, amount: gift.amountExcess,
            targetCaseId: choice === "case" ? destination.id : null, actorType: "admin", actorId: exporter.user.id,
            consentText: "Synthetic historical written instruction", consentVersion: "synthetic", consentAt: time,
            consentEvidenceRef: "synthetic-private-export-consent", state: "completed", createdAt: time, completedAt: time,
            providerId: choice === "refund" ? `synthetic-${randomUUID()}` : null } });
          await tx.donation.update({ where: { id: gift.id }, data: { refundStatus: choice === "refund" ? "refunded" : "donor_redirected",
            ...(choice === "refund" ? { paymentStatus: "refunded", refundedAt: time, refundReference: operation.providerId } : {}) } });
          await tx.donationLedgerEntry.create({ data: { donationId: gift.id, resolutionId: operation.id, amount: gift.amountExcess,
            kind: choice === "refund" ? "refund_excess" : choice === "general" ? "redirect_general" : "redirect_case",
            beneficiaryCaseId: choice === "case" ? destination.id : null, createdAt: time, operationKey: randomUUID() } });
          if (choice === "case") await tx.beneficiaryCase.update({ where: { id: destination.id }, data: { amountRaised: { increment: gift.amountExcess } } });
        });
      };
      const refunded = await historicalGift(1000, "2001-12-20T00:00:00Z");
      const generalGift = await historicalGift(2000, "2002-01-01T00:00:00Z");
      const redirected = await historicalGift(3000, "2002-01-05T00:00:00Z");
      const closing = await historicalGift(4000, "2002-01-10T00:00:00Z");
      const dueAtEnd = await historicalGift(500, "2002-01-18T00:00:00Z");
      const after = await historicalGift(5000, "2002-02-01T00:00:00Z");
      await settle(refunded, "refund", "2002-01-01T00:00:00Z");
      await settle(generalGift, "general", "2002-01-15T00:00:00Z");
      await settle(redirected, "case", "2002-01-31T23:59:59.999Z");
      await settle(closing, "refund", "2002-02-01T00:00:00Z");
      await prisma.auditLog.create({ data: { entity: "SupportAFuture", entityId: closing.id, action: "EXCESS_AUDITED", createdAt: new Date("2002-02-01T00:00:00Z") } });
      await prisma.donation.update({ where: { id: closing.id }, data: { refundAuditedAt: new Date("2002-02-01T00:00:00Z"),
        financialHoldAt: new Date("2002-02-01T00:00:00Z"), financialHoldReason: "synthetic_history" } });
      const response = await request(path, exporter.cookie);
      assert.equal(response.status, 200);
      const csv = await response.text();
      const result = totals(csv);
      const expected = { opening_held_excess: 1000, period_new_excess: 9500, period_refunded_excess: 1000,
        period_redirected_general: 2000, period_redirected_cases: 3000, closing_held_excess: 4500,
        closing_overdue_pending: 4000, closing_overdue_audited: 0, closing_held_under_reconciliation: 0 };
      for (const [key, amount] of Object.entries(expected)) assert.equal(result.get(key)! - baseline.get(key)!, BigInt(amount), key);
      assert.equal(result.get("opening_held_excess")! + result.get("period_new_excess")! - result.get("period_refunded_excess")!
        - result.get("period_redirected_general")! - result.get("period_redirected_cases")!, result.get("closing_held_excess"));
      assert.ok(csv.includes(dueAtEnd.id) && !csv.includes(after.id));
      assert.doesNotMatch(csv, /synthetic-private-export-consent|FTF-SAF-/);
    });
    await t.test("ledger export permits 5000 entries and rejects 5001 without a partial report", async () => {
      const exporter = await actor("SUPER_ADMIN");
      // Find an unused historical day so this regression remains repeatable without deleting financial history.
      const start = new Date("1900-01-01T00:00:00Z");
      let end = new Date(start.getTime() + 86400000);
      while (await prisma.donationLedgerEntry.count({ where: { createdAt: { gte: start, lt: end } } })) {
        start.setUTCDate(start.getUTCDate() + 1); end = new Date(start.getTime() + 86400000);
      }
      const original = await makeCase();
      const seed = async (count: number) => {
        const gifts = Array.from({ length: count }, () => ({ id: `c${randomUUID().replaceAll("-", "")}`, amount: 1, amountCreditedToCase: 1,
          beneficiaryCaseId: original.id, paymentStatus: "paid", paidAt: start, paymentReference: `FTF-SAF-${randomUUID()}` }));
        await prisma.$transaction(async (tx) => {
          await tx.donation.createMany({ data: gifts });
          await tx.donationLedgerEntry.createMany({ data: gifts.map((gift) => ({ donationId: gift.id, kind: "original_case_credit", amount: 1,
            beneficiaryCaseId: original.id, createdAt: start, operationKey: randomUUID() })) });
          await tx.beneficiaryCase.update({ where: { id: original.id }, data: { amountRaised: { increment: count } } });
        }, { timeout: 30000 });
      };
      await seed(5000);
      const path = `/api/admin/refunds?export=ledger&from=${start.toISOString().slice(0, 10)}&to=${end.toISOString().slice(0, 10)}`;
      const accepted = await request(path, exporter.cookie);
      assert.equal(accepted.status, 200);
      assert.equal((await accepted.text()).split("\r\n").filter((line) => line.includes('\",\"original_case_credit\",\"')).length, 5000);
      const auditCount = await prisma.auditLog.count({ where: { action: "EXCESS_LEDGER_EXPORTED", userId: exporter.user.id } });
      await seed(1);
      const rejected = await request(path, exporter.cookie);
      assert.equal(rejected.status, 413);
      assert.match(rejected.headers.get("content-type")!, /application\/json/);
      assert.match(rejected.headers.get("cache-control")!, /no-store/);
      const body = await rejected.json();
      assert.equal(body.code, "export_range"); assert.match(body.error, /no partial export/);
      assert.equal(await prisma.auditLog.count({ where: { action: "EXCESS_LEDGER_EXPORTED", userId: exporter.user.id } }), auditCount);
    });
    const browserFixtures = { origin, targetPublicId: target.publicId, held: held.url, financeCookie: finance.cookie, unheldAdmin: `${origin}/admin/refunds/${general.giftId}`, heldAdmin: `${origin}/admin/refunds/${held.giftId}`, refund: refund.url, general: general.url, otherCase: otherCase.url,
      expired: expired.url, invalid: `${origin}/give/support-a-future/refund/invalid` };
    const artifact = resolve("scripts/dev/support-a-future-browser.json");
    await mkdir(resolve("scripts/dev"), { recursive: true });
    await writeFile(artifact, JSON.stringify(browserFixtures, null, 2));
    console.log("Synthetic browser fixtures are in ignored scripts/dev/support-a-future-browser.json. No live provider credentials are enabled.");
  } finally { await prisma.$disconnect(); }
});
