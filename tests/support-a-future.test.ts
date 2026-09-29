import test from "node:test";
import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import { CHOICE_WINDOW_MS, MAX_PESEWAS, parseGhs, refundDeadline, splitAllocation, caseDraftSchema, projectCaseAllocation, retainedGivingAmount, caseReceiptMessage, canCelebrateCaseReceipt, type DonationAccounting } from "../src/lib/support-a-future/domain";
import { hasPermission, adminRoutePermission, adminHome } from "../src/lib/admin-rbac";
import { isSensitiveUrl } from "../src/lib/privacy";

test("integer money, boundaries and allocation conservation", () => {
  assert.equal(parseGhs("12.34"), 1234);
  for (const invalid of ["0", "-1", "1.001", "1e3", "Infinity", "21474836.48"]) assert.equal(parseGhs(invalid), null);
  assert.equal(parseGhs("21474836.47"), MAX_PESEWAS);
  assert.deepEqual(splitAllocation(10000, 10000, 4000), { credited: 6000, excess: 4000, raised: 10000 });
  assert.deepEqual(splitAllocation(10000, 10000, 10000), { credited: 0, excess: 10000, raised: 10000 });
  assert.equal(splitAllocation(100, 10000, 0, false).credited, 0);
  for (const amount of [-1, 0, 0.5, MAX_PESEWAS + 1, NaN]) assert.throws(() => splitAllocation(amount, 10000, 0));
  assert.throws(() => splitAllocation(1, 10, 11));
  const paid = new Date("2026-01-01T12:13:14.123Z");
  assert.equal(refundDeadline(paid).getTime() - paid.getTime(), CHOICE_WINDOW_MS);
  const officer = { userId: "officer", email: "officer@example.test", role: "SAFEGUARDING_OFFICER" as const };
  assert.equal(hasPermission(officer, "cases.review"), true);
  for (const permission of ["refunds.manage", "users.manage", "donations.view", "dashboard.view"] as const) assert.equal(hasPermission(officer, permission), false);
  assert.equal(caseDraftSchema.safeParse({ amountRaised: 1, safeguardingApproved: true }).success, false);
});

test("receipt projection uses settlement ledger, never mutable refund labels", () => {
  const gift: DonationAccounting = { amount: 10000, currency: "GHS", paymentStatus: "paid", beneficiaryCaseId: "private",
    amountCreditedToCase: 6000, amountExcess: 4000, financialHoldAt: null, refundStatus: "refunded", refundDueAt: null,
    excessResolution: { state: "processing", choice: "refund" }, ledgerEntries: [
      { kind: "original_case_credit", amount: 6000, currency: "GHS" }, { kind: "excess_held", amount: 4000, currency: "GHS" },
    ] };
  const pending = projectCaseAllocation(gift)!;
  assert.equal(pending.refundedAmount, 0);
  assert.equal(pending.heldAmount, 4000);
  assert.equal(pending.retainedAmount, 10000);
  assert.equal(retainedGivingAmount(gift), 6000);
  assert.equal(canCelebrateCaseReceipt({ state: "allocated", allocation: pending }), false);
  assert.match(caseReceiptMessage({ state: "allocated", allocation: pending }), /not yet confirmed/);
  const refunded = { ...gift, refundStatus: "pending", ledgerEntries: [...gift.ledgerEntries, { kind: "refund_excess", amount: 4000, currency: "GHS" }] };
  assert.equal(projectCaseAllocation(refunded)!.refundedAmount, 4000);
  assert.equal(projectCaseAllocation(refunded)!.retainedAmount, 6000);
  assert.throws(() => projectCaseAllocation({ ...gift, amountExcess: 3999 }));
  assert.throws(() => projectCaseAllocation({ ...gift, ledgerEntries: [...gift.ledgerEntries, { kind: "refund_excess", amount: 4001, currency: "GHS" }] }));
  assert.throws(() => projectCaseAllocation({ ...gift, ledgerEntries: [{ kind: "original_case_credit", amount: 6000, currency: "USD" }] }));
  const held = projectCaseAllocation({ ...refunded, financialHoldAt: new Date() })!;
  assert.equal(held.retainedAmount, null); assert.equal(held.allocatedAmount, null); assert.equal(held.refundedAmount, 4000);
  assert.match(caseReceiptMessage({ state: "allocated", allocation: held }), /reconciliation/);
  for (const status of ["pending", "failed", "refunded"]) assert.equal(retainedGivingAmount({ ...gift, beneficiaryCaseId: null, paymentStatus: status }), 0);
  assert.equal(projectCaseAllocation({ ...gift, beneficiaryCaseId: null }), null, "Legacy payments never gain invented case allocations");
  const exact = projectCaseAllocation({ ...gift, amount: 6000, amountExcess: 0, refundStatus: null, excessResolution: null,
    ledgerEntries: [gift.ledgerEntries[0]] })!;
  assert.equal(canCelebrateCaseReceipt({ state: "allocated", allocation: exact }), true);
  assert.equal(canCelebrateCaseReceipt({ state: "pending", allocation: null }), false);
  assert.equal(canCelebrateCaseReceipt({ state: "reconciliation_required", allocation: null }), false);
  assert.equal(canCelebrateCaseReceipt({ state: "allocated", allocation: { ...exact, financialHold: true, retainedAmount: null, allocatedAmount: null } }), false);
  assert.equal(canCelebrateCaseReceipt({ state: "allocated", allocation: projectCaseAllocation(refunded)! }), false);
});

test("resumed checkout handles synchronous, duplicate, late and failed provider callbacks", async (t) => {
  const { resumeCasePayment } = await import("../src/components/give/case-client");
  type Instance = Parameters<typeof resumeCasePayment>[0];
  type Callbacks = Parameters<Instance["resumeTransaction"]>[1];
  for (const scenario of ["loaded", "cancel", "error", "success", "throw", "timeout", "unmount"] as const) {
    await t.test(scenario, (t) => {
      t.mock.timers.enable({ apis: ["setTimeout"] });
      let callbacks: Callbacks = {};
      let cancellations = 0;
      let successes = 0;
      const restored: string[] = [];
      const transaction = { getStatus: () => ({ status: null }) };
      const instance: Instance = {
        resumeTransaction: (code, handlers) => {
          assert.equal(code, "synthetic-bound-access-code"); callbacks = handlers;
          if (scenario === "throw") throw new Error("Synthetic SDK failure");
          if (scenario === "loaded") handlers.onLoad?.();
          if (scenario === "cancel") handlers.onCancel?.();
          if (scenario === "error") handlers.onError?.({ message: "Do not disclose provider details" });
          if (scenario === "success") handlers.onSuccess?.({ reference: "untrusted-callback-reference" });
          return transaction;
        },
        cancelTransaction: (current) => { assert.equal(current, transaction); cancellations++; callbacks.onCancel?.(); },
      };
      const stop = resumeCasePayment(instance, "synthetic-bound-access-code", () => { successes++; }, (message) => restored.push(message));
      if (scenario === "unmount") stop();
      t.mock.timers.tick(20001);
      if (scenario === "loaded") {
        assert.equal(restored.length, 0, "Synchronous load clears the timer before resume returns");
        assert.equal(cancellations, 0);
        callbacks.onSuccess?.({ reference: "another-untrusted-reference" });
      }
      const expectedSuccesses = ["loaded", "success"].includes(scenario) ? 1 : 0;
      const expectedRestores = ["cancel", "error", "throw", "timeout"].includes(scenario) ? 1 : 0;
      callbacks.onSuccess?.({ reference: "late-reference" }); callbacks.onError?.({ message: "late error" }); callbacks.onCancel?.();
      assert.equal(successes, expectedSuccesses);
      assert.equal(restored.length, expectedRestores);
      assert.equal(cancellations, ["cancel", "error", "timeout", "unmount"].includes(scenario) ? 1 : 0);
      assert.ok(restored.every((text) => !text.includes("provider details")));
      stop(); stop();
      assert.ok(cancellations <= 1, "Cleanup is idempotent even when cancellation calls back synchronously");
    });
  }
});

test("PostgreSQL accounting, authorization and provider lifecycle", { timeout: 120_000 }, async (t) => {
  // Fail closed before importing the database singleton. Never fall back to .env/Neon.
  const url = process.env.SUPPORT_TEST_DATABASE_URL;
  assert.ok(url, "Set SUPPORT_TEST_DATABASE_URL to the disposable migrated PostgreSQL database");
  const parsed = new URL(url);
  assert.ok(["localhost", "127.0.0.1"].includes(parsed.hostname) && /^\/ftf_step8(?:_[a-z0-9]+)?$/.test(parsed.pathname), "Only a local isolated Step 8 database is allowed");
  process.env.DATABASE_URL = url;
  process.env.PAYSTACK_SECRET_KEY = `sk_test_${randomBytes(24).toString("hex")}`;
  delete process.env.VERCEL_ENV;
  process.env.SUPPORT_A_FUTURE_ENABLED = "true";
  process.env.SUPPORT_A_FUTURE_ORIGIN = "http://localhost:3128";
  process.env.SUPPORT_REFUND_TOKEN_SECRET = randomBytes(32).toString("hex");
  process.env.SUPPORT_OUTBOX_ENCRYPTION_KEY = randomBytes(32).toString("base64");
  process.env.CRON_SECRET = randomBytes(32).toString("hex");
  process.env.SENDGRID_API_KEY = "synthetic-not-used";
  process.env.SENDGRID_FROM_EMAIL = "synthetic@example.test";
  process.env.SUPPORT_FINANCE_ALERT_EMAIL = "finance@example.test";
  process.env.ADMIN_JWT_SECRET = randomBytes(32).toString("hex");
  const { prisma } = await import("../src/lib/db");
  const payments = await import("../src/lib/support-a-future/payments");
  const resolutions = await import("../src/lib/support-a-future/resolutions");
  const security = await import("../src/lib/support-a-future/security");
  const cases = await import("../src/lib/support-a-future/cases");
  const { processRefund, handleRefundEvent, handleDisputeEvent } = await import("../src/lib/support-a-future/refunds");
  const { dispatchNotifications } = await import("../src/lib/support-a-future/notifications");
  const originalFetch = globalThis.fetch;
  type ProviderPayment = { id: number; reference: string; amount: number; currency: string; paid_at: string;
    status: string; channel: string; customer: { email: string }; metadata: Record<string, unknown> };
  type Refund = { id: number; transaction: number; amount: number; currency: string; status: string; merchant_note: string; refunded_at?: string; dispute?: unknown };
  const providerPayments = new Map<string, ProviderPayment>();
  const providerRefunds = new Map<string, Refund[]>();
  const providerDisputes = new Map<string, { id: number; transaction: number }>();
  let providerUnavailable = false;
  let preflightHook: (() => Promise<void>) | null = null;
  let historyHook: (() => Promise<void>) | null = null;
  const refundCalls: { reference: string; amount: number }[] = [];
  let refundMode = "pending";
  let providerSequence = Date.now();
  globalThis.fetch = async (input, init) => {
    const request = new URL(String(input));
    assert.equal(request.origin, "https://api.paystack.co", "No unmocked network traffic is permitted");
    const json = (data: unknown) => new Response(JSON.stringify({ status: true, data }), { status: 200 });
    if (request.pathname === "/transaction/initialize") {
      const body = JSON.parse(String(init?.body));
      assert.ok(await prisma.supportPaymentIntent.findUnique({ where: { reference: body.reference } }), "Intent is durable before provider call");
      providerPayments.set(body.reference, { id: ++providerSequence, reference: body.reference, amount: body.amount,
        currency: body.currency, paid_at: new Date().toISOString(), status: "success", channel: "card", customer: { email: body.email }, metadata: body.metadata });
      return json({ reference: body.reference, access_code: "synthetic-code", authorization_url: "https://checkout.paystack.com/synthetic" });
    }
    if (request.pathname.startsWith("/transaction/verify/")) {
      const payment = providerPayments.get(decodeURIComponent(request.pathname.split("/").at(-1)!));
      assert.ok(payment, "Unknown synthetic payment");
      return json(payment);
    }
    if (request.pathname.startsWith("/dispute/transaction/")) {
      if (providerUnavailable) throw new Error("Synthetic provider outage");
      if (preflightHook) { const hook = preflightHook; preflightHook = null; await hook(); }
      return json([...providerDisputes.values()].filter((row) => String(row.transaction) === request.pathname.split("/").at(-1)));
    }
    if (request.pathname.startsWith("/dispute/")) {
      const dispute = providerDisputes.get(request.pathname.split("/").at(-1)!);
      assert.ok(dispute);
      return json(dispute);
    }
    if (request.pathname.startsWith("/transaction/")) {
      const payment = [...providerPayments.values()].find((row) => String(row.id) === request.pathname.split("/").at(-1));
      assert.ok(payment);
      return json(payment);
    }
    if (request.pathname === "/refund" && init?.method === "POST") {
      const body = JSON.parse(String(init.body));
      assert.ok(Number.isInteger(body.amount) && body.amount > 0, "Refund amount is always explicit");
      refundCalls.push({ reference: body.transaction, amount: body.amount });
      const row: Refund = { id: ++providerSequence, transaction: providerPayments.get(body.transaction)!.id,
        amount: body.amount, currency: body.currency, status: refundMode === "failed" ? "failed" : "pending", merchant_note: body.merchant_note };
      if (refundMode !== "timeout-before") providerRefunds.set(body.transaction, [...(providerRefunds.get(body.transaction) ?? []), row]);
      if (refundMode.startsWith("timeout")) throw new Error("Synthetic timeout; do not retry submission");
      return json(row);
    }
    if (request.pathname === "/refund") {
      if (historyHook) { const hook = historyHook; historyHook = null; await hook(); }
      assert.ok(request.searchParams.get("transaction"), "Refund history is bound to the documented transaction ID filter");
      const payment = [...providerPayments.values()].find((row) => String(row.id) === request.searchParams.get("transaction"));
      assert.ok(payment);
      return json(providerRefunds.get(payment.reference) ?? []);
    }
    if (request.pathname.startsWith("/refund/")) {
      const row = [...providerRefunds.values()].flat().find((item) => String(item.id) === request.pathname.split("/").at(-1));
      assert.ok(row, "Unknown synthetic refund");
      return json(row);
    }
    throw new Error(`Unmocked provider path: ${request.pathname}`);
  };
  try {
    const reviewer = await prisma.user.create({ data: { email: `${randomUUID()}@example.test`, role: "SAFEGUARDING_OFFICER", passwordHash: "synthetic-unusable" } });
    const makeCase = async (amountNeeded = 10000, links: { pillarId?: string; programId?: string } = {}) => {
      const counter = await prisma.casePublicIdCounter.upsert({ where: { year: 2099 }, create: { year: 2099, nextNumber: 2 }, update: { nextNumber: { increment: 1 } } });
      const now = new Date();
      return prisma.beneficiaryCase.create({ data: { publicId: `FTF-2099-${String(counter.nextNumber - 1).padStart(3, "0")}`,
        firstName: "Synthetic", region: "Ashanti", needType: "Learning", needDescription: "Synthetic test only",
        storyShort: "Synthetic test only", storyFull: "Synthetic test only", amountNeeded, ...links,
        consentGiven: true, consentRecordedAt: now, consentEvidenceRef: "synthetic-private-evidence", safeguardingApproved: true,
        safeguardingApprovedAt: now, safeguardingApprovedBy: reviewer.id, approvedRevision: 1, publishedAt: now, status: "active", reviewStatus: "approved" } });
    };
    const putFirst = async (id: string) => {
      const oldest = await prisma.beneficiaryCase.aggregate({ _min: { publishedAt: true } });
      await prisma.beneficiaryCase.update({ where: { id }, data: { publishedAt: new Date((oldest._min.publishedAt?.getTime() ?? Date.now()) - 1) } });
    };
    const initialize = async (record: { publicId: string }, amount = 10000) => payments.initializeCasePayment({ publicId: record.publicId, amountInPesewas: amount, email: "donor@example.test" });
    const tokenFor = async (id: string) => {
      const row = await prisma.notificationOutbox.findFirstOrThrow({ where: { donationId: id, template: "excess_choices" }, orderBy: { createdAt: "desc" } });
      return (JSON.parse(security.decryptOutbox(row.payloadEncrypted!, row.eventKey)) as { token: string }).token;
    };
    const excessGift = async (amount = 10000) => {
      const record = await makeCase(amount);
      const first = await initialize(record, amount);
      const second = await initialize(record, amount);
      await payments.finalizeCasePayment(first.reference);
      const gift = await payments.finalizeCasePayment(second.reference);
      return { gift, token: await tokenFor(gift.id), record };
    };
    const checkConservation = async (id: string) => {
      const donation = await prisma.donation.findUniqueOrThrow({ where: { id }, include: { ledgerEntries: true } });
      assert.equal(donation.amount, donation.amountCreditedToCase + donation.amountExcess);
      const held = donation.ledgerEntries.filter((entry) => entry.kind === "excess_held").reduce((sum, entry) => sum + entry.amount, 0);
      const settled = donation.ledgerEntries.filter((entry) => ["refund_excess", "redirect_general", "redirect_case"].includes(entry.kind)).reduce((sum, entry) => sum + entry.amount, 0);
      assert.ok(settled <= held);
      assert.equal(held, donation.amountExcess);
      return donation;
    };
    await t.test("admin authorization re-reads current roles and fails closed", async () => {
      const auth = await import("../src/lib/admin-auth");
      const { proxy } = await import("../src/proxy");
      const { NextRequest } = await import("next/server");
      const admin = await prisma.user.create({ data: { email: `${randomUUID()}@example.test`, role: "SUPER_ADMIN", passwordHash: "synthetic-unusable" } });
      const token = await auth.createSessionToken({ userId: admin.id, email: admin.email, role: admin.role });
      const request = (path: string) => new NextRequest(`http://localhost:3128${path}`, { headers: { cookie: `ftf-admin-session=${token}` } });
      assert.equal((await proxy(request("/admin/refunds"))).status, 200);
      await prisma.user.update({ where: { id: admin.id }, data: { role: "SAFEGUARDING_OFFICER" } });
      assert.equal((await auth.getActiveAdminSession(token))?.role, "SAFEGUARDING_OFFICER");
      assert.equal((await proxy(request("/admin/refunds"))).status, 403);
      assert.equal((await proxy(request("/admin/dashboard"))).status, 403);
      assert.equal((await proxy(request("/admin/beneficiary-cases"))).status, 200);
      assert.equal((await proxy(request("/admin/unknown"))).status, 403);
      assert.equal((await proxy(request("/admin"))).headers.get("location"), "http://localhost:3128/admin/beneficiary-cases");
      await prisma.user.update({ where: { id: admin.id }, data: { suspended: true } });
      assert.equal(await auth.getActiveAdminSession(token), null);
      assert.equal((await proxy(request("/admin/beneficiary-cases"))).headers.get("location"), "http://localhost:3128/login");
      const secret = process.env.ADMIN_JWT_SECRET;
      delete process.env.ADMIN_JWT_SECRET;
      try { assert.equal(await auth.verifySessionToken(token), null); await assert.rejects(auth.createSessionToken({ userId: admin.id, email: admin.email, role: admin.role })); }
      finally { process.env.ADMIN_JWT_SECRET = secret; }
      assert.equal(adminRoutePermission("/admin/refunds-other"), null);
      assert.equal(adminHome("SAFEGUARDING_OFFICER"), "/admin/beneficiary-cases");
    });
    await t.test("private navigation returns no Flight data and denies tracking URLs", async () => {
      const { proxy } = await import("../src/proxy");
      const { NextRequest } = await import("next/server");
      const path = "/give/support-a-future/refund/synthetic-credential";
      const response = await proxy(new NextRequest(`http://localhost:3128${path}`, { headers: { rsc: "1" } }));
      assert.match(response.headers.get("content-type")!, /text\/html/);
      assert.equal(await response.text(), "");
      assert.equal(response.headers.get("referrer-policy"), "no-referrer");
      assert.match(response.headers.get("cache-control")!, /no-store/);
      assert.match(response.headers.get("content-security-policy")!, /connect-src 'self'/);
      for (const url of [path, "/donate/success?reference=private", "/give/support-a-future/FTF-2099-001"]) assert.equal(isSensitiveUrl(url), true);
      assert.equal(isSensitiveUrl("/give"), false);
      const post = await proxy(new NextRequest(`http://localhost:3128${path}`, { method: "POST" }));
      assert.equal(post.headers.get("x-middleware-next"), "1", "Server action POST is not replaced by the navigation boundary");
    });
    await t.test("draft screening and financial readiness fail closed", async () => {
      const { validateCaseContent } = await import("../src/lib/support-a-future/case-workflow");
      const record = await makeCase();
      const draft = caseDraftSchema.parse({ firstName: record.firstName, age: null, region: record.region, needType: record.needType,
        needDescription: record.needDescription, storyShort: record.storyShort, storyFull: record.storyFull,
        amountNeeded: record.amountNeeded, pillarId: null, programId: null, consentGiven: true,
        consentEvidenceRef: record.consentEvidenceRef, consentRecordedAt: record.consentRecordedAt!.toISOString(),
        consentExpiresAt: null, closesAt: null, photoAssetId: null, photoAlt: null });
      validateCaseContent(draft);
      for (const unsafe of ["Contact donor@example.test", "Call +233 555 123 456", "Date of birth 12/12/2014", "See https://example.test/private"]) {
        assert.throws(() => validateCaseContent({ ...draft, storyFull: unsafe }));
      }
      assert.throws(() => validateCaseContent({ ...draft, photoAssetId: "ftf/beneficiary-cases/unverified" }));
      delete process.env.SUPPORT_FINANCE_ALERT_EMAIL;
      try { assert.throws(() => security.assertCheckoutReady()); }
      finally { process.env.SUPPORT_FINANCE_ALERT_EMAIL = "finance@example.test"; }
    });
    await t.test("receipt verifies original payment and reads delayed, split and refunded accounting without mutation", async () => {
      const { POST } = await import("../src/app/api/paystack/verify/route");
      const { NextRequest } = await import("next/server");
      const record = await makeCase();
      const first = await initialize(record, 4000);
      const second = await initialize(record, 10000);
      const receipt = async () => {
        const response = await POST(new NextRequest("http://localhost:3128/api/paystack/verify", { method: "POST", body: JSON.stringify({ reference: second.reference }) }));
        assert.equal(response.status, 200); assert.match(response.headers.get("cache-control")!, /no-store/);
        assert.equal(response.headers.get("referrer-policy"), "no-referrer");
        return response.json();
      };
      process.env.SUPPORT_A_FUTURE_ENABLED = "false";
      try {
        const waiting = await receipt();
        assert.equal(waiting.verified, true); assert.equal(waiting.paymentKind, "case");
        assert.deepEqual(waiting.caseReceipt, { state: "pending", allocation: null });
        assert.equal(await prisma.donation.count({ where: { paymentReference: second.reference } }), 0);
        await payments.finalizeCasePayment(first.reference);
        const gift = await payments.finalizeCasePayment(second.reference);
        const allocated = (await receipt()).caseReceipt.allocation;
        assert.equal(allocated.creditedAmount, 6000); assert.equal(allocated.heldAmount, 4000);
        assert.equal(allocated.allocatedAmount, 6000); assert.equal(allocated.retainedAmount, 10000);
        const operation = await resolutions.acceptDonorChoice(await tokenFor(gift.id), { choice: "refund", confirmed: true });
        await processRefund(operation.id);
        assert.equal((await receipt()).caseReceipt.allocation.refundedAmount, 0);
        providerRefunds.get(second.reference)![0].status = "processed";
        await processRefund(operation.id);
        const settled = await receipt();
        assert.equal(settled.amount, 10000); assert.equal(settled.caseReceipt.allocation.refundedAmount, 4000);
        assert.equal(settled.caseReceipt.allocation.retainedAmount, 6000);
        assert.equal(settled.caseReceipt.allocation.heldAmount, 0);
        await prisma.beneficiaryCase.update({ where: { id: record.id }, data: { consentRevokedAt: new Date() } });
        const withdrawn = await receipt();
        assert.deepEqual(withdrawn.caseReceipt, settled.caseReceipt);
        assert.doesNotMatch(JSON.stringify(withdrawn), /Synthetic|story|photo|beneficiaryCaseId|providerTransactionId|consentEvidenceRef/);
        assert.equal(refundCalls.filter((call) => call.reference === second.reference).length, 1);
      } finally { process.env.SUPPORT_A_FUTURE_ENABLED = "true"; }
    });
    await t.test("receipt and supporter totals preserve redirects, full-excess refunds and financial holds", async () => {
      const supporter = await prisma.supporter.create({ data: { name: "Synthetic", email: `${randomUUID()}@example.test`, passwordHash: "synthetic-unusable" } });
      const ids: string[] = [];
      for (const choice of ["general", "case", "refund"] as const) {
        const { gift, token } = await excessGift(4000);
        ids.push(gift.id);
        await prisma.donation.update({ where: { id: gift.id }, data: { supporterId: supporter.id } });
        const target = choice === "case" ? await makeCase(4000) : null;
        const operation = await resolutions.acceptDonorChoice(token, { choice, confirmed: true, ...(target ? { targetPublicId: target.publicId } : {}) });
        if (choice === "refund") {
          await processRefund(operation.id);
          providerRefunds.get(gift.paymentReference!)![0].status = "processed";
          await processRefund(operation.id);
          providerPayments.get(gift.paymentReference!)!.status = "refunded";
        }
        const receipt = await payments.verifyPaymentReceipt(gift.paymentReference!);
        assert.equal(receipt.verified, true); assert.equal(receipt.caseReceipt?.state, "allocated");
        assert.equal(receipt.caseReceipt?.allocation?.retainedAmount, choice === "refund" ? 0 : 4000);
        assert.equal(receipt.caseReceipt?.allocation?.redirectedAmount, choice === "refund" ? 0 : 4000);
        assert.equal(canCelebrateCaseReceipt(receipt.caseReceipt!), false);
      }
      const history = await payments.supporterDonationHistory(supporter.id);
      assert.equal(history.donations.length, 3);
      assert.deepEqual(history.totals, [{ currency: "GHS", amount: 8000, unreconciledCount: 0 }]);
      const { holdDonation, lockDonation } = await import("../src/lib/support-a-future/persistence");
      await security.financialTransaction(async (tx) => holdDonation(tx, await lockDonation(tx, ids[0]), "provider_dispute"));
      const heldHistory = await payments.supporterDonationHistory(supporter.id);
      assert.deepEqual(heldHistory.totals, [{ currency: "GHS", amount: 4000, unreconciledCount: 1 }]);
      assert.equal(heldHistory.donations.find((gift) => gift.id === ids[0])!.retainedGivingAmount, null);
      const heldGift = await prisma.donation.findUniqueOrThrow({ where: { id: ids[0] } });
      providerPayments.get(heldGift.paymentReference!)!.status = "reversed";
      const heldReceipt = await payments.verifyPaymentReceipt(heldGift.paymentReference!);
      assert.equal(heldReceipt.caseReceipt?.allocation?.financialHold, true);
      assert.equal(heldReceipt.caseReceipt?.allocation?.retainedAmount, null);
      assert.equal(heldReceipt.caseReceipt?.allocation?.redirectedAmount, 4000);
      assert.doesNotMatch(JSON.stringify(heldHistory), /paymentReference|beneficiaryCaseId|ledgerEntries|donorEmail|providerId/);
      assert.deepEqual((await payments.supporterDonationHistory("unknown-supporter")).donations, []);
    });
    await t.test("general, campaign and store receipt contracts remain separate and currencies are not summed together", async () => {
      const supporter = await prisma.supporter.create({ data: { name: "Synthetic", email: `${randomUUID()}@example.test`, passwordHash: "synthetic-unusable" } });
      const campaign = await prisma.donationCampaign.create({ data: { name: "Synthetic campaign", slug: `synthetic-${randomUUID()}`, goalAmount: 10000 } });
      for (const kind of ["general", "campaign", "store"] as const) {
        const reference = `legacy-${randomUUID()}`;
        providerPayments.set(reference, { id: ++providerSequence, reference, amount: 1000, currency: "GHS", paid_at: new Date().toISOString(),
          status: "success", channel: "mobile_money", customer: { email: supporter.email }, metadata: {} });
        if (kind === "store") await prisma.order.create({ data: { orderId: `synthetic-${randomUUID()}`, customerName: "Synthetic", email: supporter.email,
          phone: "0000000000", deliveryMethod: "pickup", items: [], subtotal: 1000, deliveryFee: 0, total: 1000, paymentReference: reference } });
        else await prisma.donation.create({ data: { amount: 1000, paymentStatus: "paid", paymentReference: reference, supporterId: supporter.id, ...(kind === "campaign" ? { campaignId: campaign.id } : {}) } });
        const receipt = await payments.verifyPaymentReceipt(reference);
        assert.equal(receipt.paymentKind, kind === "store" ? "store" : "donation");
        assert.equal(receipt.amount, 1000); assert.equal(receipt.channel, "mobile_money");
        assert.equal(receipt.customer.email, supporter.email); assert.equal(receipt.caseReceipt, null);
        assert.equal(await payments.casePaymentStatus(reference), null);
      }
      for (const status of ["pending", "failed", "refunded"]) await prisma.donation.create({ data: { amount: 3000, paymentStatus: status, supporterId: supporter.id } });
      await prisma.donation.create({ data: { amount: 700, currency: "USD", paymentStatus: "paid", supporterId: supporter.id } });
      const history = await payments.supporterDonationHistory(supporter.id);
      assert.equal(history.totals.find((row) => row.currency === "GHS")!.amount, 2000);
      assert.equal(history.totals.find((row) => row.currency === "USD")!.amount, 700);
      assert.equal(history.donations.find((row) => row.campaign)?.campaign?.slug, campaign.slug);
      assert.ok(history.donations.every((row) => row.caseAllocation === null));
    });
    await t.test("receipt rejects invalid references and cannot present mismatched case payments as allocated", async () => {
      const { POST } = await import("../src/app/api/paystack/verify/route");
      const { NextRequest } = await import("next/server");
      for (const body of [{}, { reference: 123 }, { reference: "../private" }, { reference: "x".repeat(101) }, { reference: "valid-reference", amount: 1 }]) {
        assert.equal((await POST(new NextRequest("http://localhost:3128/api/paystack/verify", { method: "POST", body: JSON.stringify(body) }))).status, 400);
      }
      const record = await makeCase(); const init = await initialize(record);
      providerPayments.get(init.reference)!.amount--;
      const mismatch = await payments.verifyPaymentReceipt(init.reference);
      assert.deepEqual(mismatch.caseReceipt, { state: "reconciliation_required", allocation: null });
      assert.equal(await prisma.donation.count({ where: { paymentReference: init.reference } }), 0);
      const unknown = `FTF-SAF-${randomUUID()}`;
      providerPayments.set(unknown, { ...providerPayments.get(init.reference)!, reference: unknown });
      assert.equal((await payments.verifyPaymentReceipt(unknown)).caseReceipt?.state, "reconciliation_required");
      const response = await POST(new NextRequest("http://localhost:3128/api/paystack/verify", { method: "POST", body: JSON.stringify({ reference: "unknown-synthetic" }) }));
      assert.equal(response.status, 503); assert.doesNotMatch(await response.text(), /Unknown synthetic payment|unknown-synthetic/);
    });
    await t.test("exact funding and concurrent replay are idempotent", async () => {
      const record = await makeCase();
      const init = await initialize(record);
      const gifts = await Promise.all(Array.from({ length: 6 }, () => payments.finalizeCasePayment(init.reference)));
      assert.equal(new Set(gifts.map((gift) => gift.id)).size, 1);
      assert.equal(gifts[0].amountExcess, 0);
      assert.equal(await prisma.donationLedgerEntry.count({ where: { donationId: gifts[0].id } }), 1);
      assert.equal(await prisma.notificationOutbox.count({ where: { donationId: gifts[0].id } }), 0);
      assert.equal((await prisma.beneficiaryCase.findUniqueOrThrow({ where: { id: record.id } })).status, "funded");
      await checkConservation(gifts[0].id);
    });
    await t.test("two simultaneous payments cap credit and conserve excess", async () => {
      const record = await makeCase();
      const a = await initialize(record, 7000);
      const b = await initialize(record, 7000);
      const gifts = await Promise.all([payments.finalizeCasePayment(a.reference), payments.finalizeCasePayment(b.reference)]);
      assert.equal(gifts.reduce((sum, gift) => sum + gift.amountCreditedToCase, 0), 10000);
      assert.equal(gifts.reduce((sum, gift) => sum + gift.amountExcess, 0), 4000);
      const updated = await prisma.beneficiaryCase.findUniqueOrThrow({ where: { id: record.id } });
      assert.equal(updated.amountRaised, 10000);
      assert.equal(updated.amountOversubscribed, 4000);
      for (const gift of gifts) await checkConservation(gift.id);
    });
    await t.test("split refund requests only the excess and waits for processing", async () => {
      refundMode = "pending";
      const record = await makeCase();
      const a = await initialize(record, 4000);
      const b = await initialize(record, 10000);
      await payments.finalizeCasePayment(a.reference);
      const gift = await payments.finalizeCasePayment(b.reference);
      assert.equal(gift.amountCreditedToCase, 6000);
      assert.equal(gift.amountExcess, 4000);
      const token = await tokenFor(gift.id);
      const operation = await resolutions.acceptDonorChoice(token, { choice: "refund", confirmed: true });
      await Promise.all([processRefund(operation.id), processRefund(operation.id)]);
      assert.deepEqual(refundCalls.filter((call) => call.reference === b.reference), [{ reference: b.reference, amount: 4000 }]);
      const pending = await checkConservation(gift.id);
      assert.equal(pending.refundStatus, "pending");
      assert.equal(pending.refundedAt, null);
      providerRefunds.get(b.reference)![0].status = "processed";
      await processRefund(operation.id);
      const done = await checkConservation(gift.id);
      assert.equal(done.refundStatus, "refunded");
      assert.equal(done.paymentStatus, "paid");
      assert.equal(done.amountCreditedToCase, 6000);
      providerRefunds.get(b.reference)![0].status = "pending";
      await processRefund(operation.id);
      assert.equal((await checkConservation(gift.id)).refundStatus, "refunded");
      assert.equal((await resolutions.getChoiceContext(token)).resolution?.state, "completed");
    });
    await t.test("all three choices, concurrent tabs and single-use token", async () => {
      const { gift, token } = await excessGift();
      await resolutions.getChoiceContext(token);
      assert.equal((await prisma.excessChoiceToken.findFirstOrThrow({ where: { donationId: gift.id } })).consumedAt, null, "GET does not consume");
      const results = await Promise.all([
        resolutions.acceptDonorChoice(token, { choice: "general", confirmed: true }),
        resolutions.acceptDonorChoice(token, { choice: "refund", confirmed: true }),
      ]);
      assert.equal(results[0].id, results[1].id);
      assert.equal(await prisma.excessResolution.count({ where: { donationId: gift.id } }), 1);
      const { gift: second, token: secondToken } = await excessGift(4000);
      const target = await makeCase(4000);
      const redirect = await resolutions.acceptDonorChoice(secondToken, { choice: "case", targetPublicId: target.publicId, confirmed: true });
      assert.equal(redirect.state, "completed");
      assert.equal((await prisma.beneficiaryCase.findUniqueOrThrow({ where: { id: target.id } })).amountRaised, 4000);
      assert.equal((await checkConservation(second.id)).amountCreditedToCase, 0);
      assert.equal(await prisma.donation.count({ where: { beneficiaryCaseId: target.id } }), 0, "Redirect is not a new gross donation");
    });
    await t.test("destination capacity race rolls back without token consumption", async () => {
      const one = await excessGift(4000);
      const two = await excessGift(4000);
      const target = await makeCase(4000);
      const results = await Promise.allSettled([one, two].map(({ token }) => resolutions.acceptDonorChoice(token,
        { choice: "case", targetPublicId: target.publicId, confirmed: true })));
      assert.equal(results.filter((result) => result.status === "fulfilled").length, 1);
      const losing = results[0].status === "rejected" ? one : two;
      assert.equal((await prisma.excessChoiceToken.findFirstOrThrow({ where: { donationId: losing.gift.id } })).consumedAt, null);
      await resolutions.acceptDonorChoice(losing.token, { choice: "general", confirmed: true });
    });
    await t.test("redirect provider failure preserves authorization and retry succeeds", async () => {
      const { gift, token } = await excessGift();
      providerUnavailable = true;
      try { await assert.rejects(resolutions.acceptDonorChoice(token, { choice: "general", confirmed: true }), /could not confirm/); }
      finally { providerUnavailable = false; }
      assert.equal(await prisma.excessResolution.count({ where: { donationId: gift.id } }), 0);
      assert.equal((await prisma.excessChoiceToken.findFirstOrThrow({ where: { donationId: gift.id } })).consumedAt, null);
      assert.equal((await checkConservation(gift.id)).financialHoldAt, null);
      assert.equal((await resolutions.acceptDonorChoice(token, { choice: "general", confirmed: true })).state, "completed");
    });
    await t.test("external refunds and disputes block both redirects without consuming consent", async () => {
      for (const kind of ["refund", "dispute", "changed"] as const) {
        const { gift, token } = await excessGift();
        const payment = providerPayments.get(gift.paymentReference!)!;
        if (kind === "refund") providerRefunds.set(payment.reference, [{ id: ++providerSequence, transaction: payment.id, amount: 100, currency: "GHS", status: "processed", merchant_note: "Manual refund" }]);
        if (kind === "dispute") { const id = ++providerSequence; providerDisputes.set(String(id), { id, transaction: payment.id }); }
        if (kind === "changed") payment.status = "reversed";
        await assert.rejects(resolutions.acceptDonorChoice(token, { choice: "general", confirmed: true }), /reconciliation/);
        const target = await makeCase();
        await assert.rejects(resolutions.acceptDonorChoice(token, { choice: "case", targetPublicId: target.publicId, confirmed: true }), /reconciliation/);
        assert.ok((await checkConservation(gift.id)).financialHoldAt);
        assert.equal((await prisma.excessChoiceToken.findFirstOrThrow({ where: { donationId: gift.id } })).consumedAt, null);
        assert.equal(await prisma.excessResolution.count({ where: { donationId: gift.id } }), 0);
        const operation = await resolutions.acceptDonorChoice(token, { choice: "refund", confirmed: true });
        assert.equal(operation.state, "needs_attention");
        await processRefund(operation.id);
        assert.equal(refundCalls.filter((call) => call.reference === gift.paymentReference).length, 0);
        assert.equal((await checkConservation(gift.id)).refundStatus, "pending");
      }
    });
    await t.test("a hold arriving during provider preflight prevents redirect commit", async () => {
      const { gift, token } = await excessGift();
      const { holdDonation, lockDonation } = await import("../src/lib/support-a-future/persistence");
      preflightHook = async () => { await security.financialTransaction(async (tx) => holdDonation(tx, await lockDonation(tx, gift.id), "provider_dispute")); };
      await assert.rejects(resolutions.acceptDonorChoice(token, { choice: "general", confirmed: true }), /reconciliation/);
      assert.equal(await prisma.excessResolution.count({ where: { donationId: gift.id } }), 0);
      assert.equal((await prisma.excessChoiceToken.findFirstOrThrow({ where: { donationId: gift.id } })).consumedAt, null);
    });
    await t.test("a concurrent accepted refund is not mistaken for an external refund", async () => {
      const { gift, token } = await excessGift();
      let winner = "";
      historyHook = async () => {
        const operation = await resolutions.acceptDonorChoice(token, { choice: "refund", confirmed: true });
        winner = operation.id;
        await processRefund(operation.id);
      };
      const result = await resolutions.acceptDonorChoice(token, { choice: "general", confirmed: true });
      assert.equal(result.id, winner);
      assert.equal(result.choice, "refund");
      assert.equal(providerRefunds.get(gift.paymentReference!)?.length, 1, "The redirect preflight observed the concurrent refund history");
      assert.equal((await checkConservation(gift.id)).financialHoldAt, null);
    });
    await t.test("known external refund persists a hold even if the dispute endpoint fails", async () => {
      const { gift, token } = await excessGift();
      providerRefunds.set(gift.paymentReference!, [{ id: ++providerSequence, transaction: providerPayments.get(gift.paymentReference!)!.id,
        amount: 100, currency: "GHS", status: "processed", merchant_note: "External action" }]);
      providerUnavailable = true;
      try { await assert.rejects(resolutions.acceptDonorChoice(token, { choice: "general", confirmed: true }), /reconciliation/); }
      finally { providerUnavailable = false; }
      assert.ok((await checkConservation(gift.id)).financialHoldAt);
      assert.equal((await prisma.excessChoiceToken.findFirstOrThrow({ where: { donationId: gift.id } })).consumedAt, null);
    });
    await t.test("a dispute attached to our refund stops settlement", async () => {
      const { gift, token } = await excessGift();
      const operation = await resolutions.acceptDonorChoice(token, { choice: "refund", confirmed: true });
      await processRefund(operation.id);
      const refund = providerRefunds.get(gift.paymentReference!)![0];
      refund.status = "processed"; refund.dispute = { id: ++providerSequence };
      await processRefund(operation.id);
      assert.ok((await checkConservation(gift.id)).financialHoldAt);
      assert.equal(await prisma.donationLedgerEntry.count({ where: { donationId: gift.id, kind: "refund_excess" } }), 0);
    });
    await t.test("private target selection excludes the original case and rejects held gifts", async () => {
      const record = await makeCase();
      const init = await initialize(record);
      await prisma.beneficiaryCase.update({ where: { id: record.id }, data: { status: "closed" } });
      const gift = await payments.finalizeCasePayment(init.reference);
      const token = await tokenFor(gift.id);
      // Reopening a temporarily closed need does not retroactively change its earlier allocation.
      await prisma.beneficiaryCase.update({ where: { id: record.id }, data: { status: "active" } });
      await putFirst(record.id);
      assert.equal((await cases.getCasePage({ minimumCapacity: gift.amountExcess })).cases[0]?.publicId, record.publicId, "The original is eligible and would appear without exclusion");
      assert.ok((await resolutions.getChoiceTargets(token)).cases.every((item) => item.publicId !== record.publicId));
      const { holdDonation, lockDonation } = await import("../src/lib/support-a-future/persistence");
      await security.financialTransaction(async (tx) => holdDonation(tx, await lockDonation(tx, gift.id), "provider_dispute"));
      await assert.rejects(resolutions.getChoiceTargets(token), /reconciliation/);
      assert.equal((await resolutions.getChoiceContext(token)).financialHold, true);
    });
    await t.test("external events after settlement preserve history and create an explicit hold", async () => {
      for (const choice of ["general", "case", "refund"] as const) {
        const { gift, token } = await excessGift();
        const target = choice === "case" ? await makeCase() : null;
        const operation = await resolutions.acceptDonorChoice(token, { choice, ...(target ? { targetPublicId: target.publicId } : {}), confirmed: true });
        if (choice === "refund") {
          await processRefund(operation.id);
          providerRefunds.get(gift.paymentReference!)![0].status = "processed";
          await processRefund(operation.id);
        }
        const before = await checkConservation(gift.id);
        const external: Refund = { id: ++providerSequence, transaction: providerPayments.get(gift.paymentReference!)!.id,
          amount: 100, currency: "GHS", status: "processed", merchant_note: "Manual provider action" };
        providerRefunds.set(gift.paymentReference!, [...(providerRefunds.get(gift.paymentReference!) ?? []), external]);
        await handleRefundEvent({ id: external.id });
        await handleRefundEvent({ id: external.id });
        const after = await checkConservation(gift.id);
        assert.ok(after.financialHoldAt);
        assert.equal(after.refundStatus, before.refundStatus);
        assert.equal(after.ledgerEntries.length, before.ledgerEntries.length);
        assert.equal((await prisma.excessResolution.findUniqueOrThrow({ where: { id: operation.id } })).state, "completed");
        assert.equal(await prisma.notificationOutbox.count({ where: { donationId: gift.id, template: "financial_hold" } }), 1);
        const messages: string[] = [];
        await dispatchNotifications({ donationId: gift.id, send: async (message) => { messages.push(message.text); } });
        assert.ok(messages.some((message) => message.includes("movement is paused")));
      }
    });
    await t.test("dispute events freeze accepted refunds and quarantine payments before allocation", async () => {
      const { gift, token } = await excessGift();
      const operation = await resolutions.acceptDonorChoice(token, { choice: "refund", confirmed: true });
      const id = ++providerSequence;
      providerDisputes.set(String(id), { id, transaction: providerPayments.get(gift.paymentReference!)!.id });
      await handleDisputeEvent({ id });
      await processRefund(operation.id);
      assert.equal(refundCalls.filter((call) => call.reference === gift.paymentReference).length, 0);
      assert.ok((await checkConservation(gift.id)).financialHoldAt);
      const record = await makeCase();
      const initialized = await initialize(record);
      const early = ++providerSequence;
      providerDisputes.set(String(early), { id: early, transaction: providerPayments.get(initialized.reference)!.id });
      await handleDisputeEvent({ id: early });
      assert.equal((await prisma.supportPaymentIntent.findUniqueOrThrow({ where: { reference: initialized.reference } })).status, "quarantined");
      await assert.rejects(payments.finalizeCasePayment(initialized.reference));
      assert.equal(await prisma.donation.count({ where: { paymentReference: initialized.reference } }), 0);
      assert.equal((await prisma.beneficiaryCase.findUniqueOrThrow({ where: { id: record.id } })).amountRaised, 0);
    });
    await t.test("unknown submission reconciles, never issues a second POST", async () => {
      for (const mode of ["timeout-after", "timeout-before", "failed"]) {
        refundMode = mode;
        const { gift, token } = await excessGift();
        const operation = await resolutions.acceptDonorChoice(token, { choice: "refund", confirmed: true });
        await processRefund(operation.id);
        await processRefund(operation.id);
        assert.equal(refundCalls.filter((call) => call.reference === gift.paymentReference).length, 1);
        assert.equal((await checkConservation(gift.id)).refundStatus, "pending");
        if (mode === "timeout-after") {
          providerRefunds.get(gift.paymentReference!)![0].status = "processed";
          await processRefund(operation.id);
          assert.equal((await checkConservation(gift.id)).paymentStatus, "refunded");
        }
      }
      refundMode = "pending";
    });
    await t.test("delayed payment deadline, audited fallback and duplicate scheduler", async () => {
      const record = await makeCase();
      const init = await initialize(record);
      const paidAt = new Date(Date.now() - CHOICE_WINDOW_MS - 1000);
      providerPayments.get(init.reference)!.paid_at = paidAt.toISOString();
      await prisma.supportPaymentIntent.update({ where: { reference: init.reference }, data: { createdAt: new Date(paidAt.getTime() - 1000) } });
      await prisma.beneficiaryCase.update({ where: { id: record.id }, data: { consentRevokedAt: new Date() } });
      const gift = await payments.finalizeCasePayment(init.reference);
      assert.equal(gift.refundDueAt!.getTime(), paidAt.getTime() + CHOICE_WINDOW_MS);
      assert.equal(await prisma.excessChoiceToken.count({ where: { donationId: gift.id } }), 0);
      await prisma.donation.update({ where: { id: gift.id }, data: { refundStatus: "audited", refundAuditedAt: new Date() } });
      const operations = await Promise.all([resolutions.acceptAutomaticRefund(gift.id), resolutions.acceptAutomaticRefund(gift.id)]);
      assert.equal(operations[0].id, operations[1].id);
      assert.equal(operations[0].choice, "refund");
    });
    await t.test("eligibility parity, revision invalidation and private allowlist", async () => {
      const variants = [{}, { consentGiven: false }, { consentRevokedAt: new Date() }, { consentExpiresAt: new Date(0) },
        { safeguardingApproved: false }, { approvedRevision: null }, { publishedAt: null }, { deletedAt: new Date() },
        { closesAt: new Date(0) }, { status: "closed" }, { consentRecordedAt: new Date(Date.now() + 60_000) }];
      for (const variant of variants) {
        const record = await makeCase();
        await prisma.beneficiaryCase.update({ where: { id: record.id }, data: variant });
        const current = await prisma.beneficiaryCase.findUniqueOrThrow({ where: { id: record.id }, include: cases.caseLinks });
        const now = new Date();
        const queried = await prisma.beneficiaryCase.findFirst({ where: { AND: [{ id: record.id }, cases.caseFundableWhere(now)] } });
        assert.equal(!!queried, cases.isCaseFundable(current, now));
        const projection = JSON.stringify(cases.publicCase(current, true));
        for (const field of ["consentEvidenceRef", "safeguardingApprovedBy", "photoAssetId", "createdBy"]) assert.equal(projection.includes(field), false);
      }
      const record = await makeCase();
      const edited = await prisma.beneficiaryCase.update({ where: { id: record.id }, data: { storyShort: "Changed synthetic content" } });
      assert.equal(edited.revision, 2);
      assert.equal(edited.safeguardingApproved, false);
    });
    await t.test("programme membership withdrawal blocks browse, archive, initialization, allocation and redirect", async () => {
      const last = await prisma.pillar.aggregate({ _max: { number: true } });
      const pillar = await prisma.pillar.create({ data: { number: (last._max.number ?? 0) + 1, title: "Synthetic pillar", slug: `synthetic-${randomUUID()}`,
        summary: "Synthetic", challenge: "Synthetic", whatWeDo: "Synthetic", whoItServes: "Synthetic", whereItWorks: "Synthetic" } });
      const program = await prisma.program.create({ data: { name: "Synthetic programme", slug: `synthetic-${randomUUID()}`, description: "Synthetic only",
        pillars: { create: { pillarId: pillar.id } } } });
      const links = { pillarId: pillar.id, programId: program.id };
      const active = await makeCase(10000, links);
      const funded = await makeCase(10000, links);
      const pendingPayment = await initialize(active);
      const paid = await initialize(funded);
      await payments.finalizeCasePayment(paid.reference);
      await putFirst(active.id); await putFirst(funded.id);
      assert.equal((await cases.getCasePage()).cases[0]?.publicId, active.publicId);
      assert.equal((await cases.getCasePage({ archive: true })).cases[0]?.publicId, funded.publicId);
      const { gift, token } = await excessGift();
      await prisma.programPillar.delete({ where: { programId_pillarId: links } });
      assert.equal(await cases.getPublicCase(active.publicId), null);
      assert.equal(await cases.getPublicCase(funded.publicId), null);
      assert.ok((await cases.getCasePage()).cases.every((item) => item.publicId !== active.publicId));
      assert.ok((await cases.getCasePage({ archive: true })).cases.every((item) => item.publicId !== funded.publicId));
      assert.ok((await resolutions.getChoiceTargets(token)).cases.every((item) => item.publicId !== active.publicId));
      await assert.rejects(initialize(active));
      await assert.rejects(resolutions.acceptDonorChoice(token, { choice: "case", targetPublicId: active.publicId, confirmed: true }));
      assert.equal((await prisma.excessChoiceToken.findFirstOrThrow({ where: { donationId: gift.id } })).consumedAt, null);
      const late = await payments.finalizeCasePayment(pendingPayment.reference);
      assert.equal(late.amountCreditedToCase, 0);
      assert.equal(late.amountExcess, late.amount);
      await checkConservation(late.id);
    });
    await t.test("filtered-empty pages retain a cursor and no-photo projection covers historical assets", async () => {
      const oldest = await prisma.beneficiaryCase.aggregate({ _min: { publishedAt: true } });
      const start = (oldest._min.publishedAt?.getTime() ?? Date.now()) - 100;
      const records = [];
      for (let i = 0; i < 21; i++) {
        const row = await makeCase(i === 20 ? 10000 : 1);
        await prisma.beneficiaryCase.update({ where: { id: row.id }, data: { publishedAt: new Date(start + i) } });
        records.push(row);
      }
      const first = await cases.getCasePage({ minimumCapacity: 10000 });
      assert.equal(first.cases.length, 0);
      assert.ok(first.nextCursor, "A filtered-empty page is not exhaustion");
      const second = await cases.getCasePage({ cursor: first.nextCursor, minimumCapacity: 10000 });
      assert.equal(second.cases[0]?.publicId, records[20].publicId);
      const legacy = cases.publicCase({ ...records[20], photoUrl: "https://example.test/private-original.jpg", photoAssetId: "synthetic-legacy", photoAlt: "Private legacy alt" }, true);
      assert.equal(legacy.photoUrl, null); assert.equal(legacy.photoAlt, null);
      assert.doesNotMatch(JSON.stringify(legacy), /private-original|synthetic-legacy|Private legacy alt/);
      for (const cursor of ["not-json", "x".repeat(401), Buffer.from(JSON.stringify({ publicId: records[0].publicId, publishedAt: "invalid" })).toString("base64url")]) await assert.rejects(cases.getCasePage({ cursor }));
      // Keep disposable fixtures from crowding later browser pages.
      await prisma.beneficiaryCase.updateMany({ where: { id: { in: records.map((row) => row.id) } }, data: { status: "closed" } });
    });
    await t.test("database invariants reject tampering and preserve generic donations", async () => {
      const { gift } = await excessGift();
      await assert.rejects(prisma.donation.update({ where: { id: gift.id }, data: { amountExcess: 1 } }));
      await assert.rejects(prisma.donationLedgerEntry.updateMany({ where: { donationId: gift.id }, data: { amount: 1 } }));
      await assert.rejects(prisma.beneficiaryCase.update({ where: { id: gift.beneficiaryCaseId! }, data: { amountNeeded: 20000 } }));
      const record = await makeCase();
      await assert.rejects(prisma.beneficiaryCase.update({ where: { id: record.id }, data: { amountRaised: 10001 } }));
      const generic = await prisma.donation.create({ data: { amount: 1000, paymentReference: `generic-${randomUUID()}`, paymentStatus: "paid" } });
      assert.equal(generic.beneficiaryCaseId, null);
      await assert.rejects(prisma.donation.create({ data: { amount: 1000, paymentReference: generic.paymentReference } }));
    });
    await t.test("token binding, expiry, revocation, encryption and origin rejection", async () => {
      const { gift, token } = await excessGift();
      const other = await excessGift();
      const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString());
      const { SignJWT } = await import("jose");
      const substituted = await new SignJWT({ ...payload, sub: other.gift.id }).setProtectedHeader({ alg: "HS256" })
        .sign(new TextEncoder().encode(process.env.SUPPORT_REFUND_TOKEN_SECRET!));
      await assert.rejects(resolutions.getChoiceContext(substituted));
      await assert.rejects(security.verifyChoiceToken(token, new Date(gift.refundDueAt!.getTime() + 1000)));
      await assert.rejects(resolutions.getChoiceContext(`${token.slice(0, -4)}xxxx`));
      await prisma.excessChoiceToken.updateMany({ where: { donationId: gift.id }, data: { revokedAt: new Date() } });
      await assert.rejects(resolutions.getChoiceContext(token));
      const encrypted = security.encryptOutbox("private", "event-a");
      assert.equal(security.decryptOutbox(encrypted, "event-a"), "private");
      assert.throws(() => security.decryptOutbox(encrypted, "event-b"));
      assert.throws(() => security.requireSameOrigin(new Headers({ origin: "https://attacker.example" })));
      security.requireSameOrigin(new Headers({ origin: "http://localhost:3128", "sec-fetch-site": "same-origin" }));
    });
    await t.test("mismatched verification quarantines and cannot fall through", async () => {
      const record = await makeCase();
      const init = await initialize(record);
      providerPayments.get(init.reference)!.amount = 9999;
      await assert.rejects(payments.finalizeCasePayment(init.reference));
      assert.equal((await prisma.supportPaymentIntent.findUniqueOrThrow({ where: { reference: init.reference } })).status, "quarantined");
      assert.equal(await prisma.donation.count({ where: { paymentReference: init.reference } }), 0);
      assert.equal(await payments.isCasePayment(init.reference), true);
    });
    await t.test("outbox failure is retryable and never changes accounting", async () => {
      const { gift } = await excessGift();
      const before = await checkConservation(gift.id);
      const failed = await dispatchNotifications({ donationId: gift.id, send: async () => { throw new Error("Synthetic mail failure"); } });
      assert.equal(failed.failed, 1);
      await prisma.notificationOutbox.updateMany({ where: { donationId: gift.id }, data: { nextAttemptAt: new Date(0) } });
      const messages: string[] = [];
      const success = await dispatchNotifications({ donationId: gift.id, send: async (message) => { messages.push(message.text); } });
      assert.equal(success.sent, 1);
      assert.match(messages[0], /Refund the excess/);
      assert.match(messages[0], /Redirect to our general fund/);
      assert.match(messages[0], /Redirect to another eligible case/);
      assert.equal((await checkConservation(gift.id)).amountExcess, before.amountExcess);
      assert.equal((await prisma.notificationOutbox.findFirstOrThrow({ where: { donationId: gift.id } })).payloadEncrypted, null);
    });
  } finally {
    globalThis.fetch = originalFetch;
    await prisma.$disconnect();
  }
});
