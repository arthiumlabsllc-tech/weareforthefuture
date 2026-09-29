-- Existing databases must baseline only after a reviewed backup and schema comparison.
-- Never discard or rewrite duplicate financial rows automatically.
BEGIN;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM "Donation" WHERE "paymentReference" IS NOT NULL
             GROUP BY "paymentReference" HAVING COUNT(*) > 1) THEN
    RAISE EXCEPTION 'Step 8 blocked: reconcile duplicate donation payment references before migrating';
  END IF;
END $$;

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'SAFEGUARDING_OFFICER';

-- AlterTable
ALTER TABLE "Donation" ADD COLUMN     "amountCreditedToCase" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "amountExcess" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "beneficiaryCaseId" TEXT,
ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "refundAuditedAt" TIMESTAMP(3),
ADD COLUMN     "refundDueAt" TIMESTAMP(3),
ADD COLUMN     "refundNotes" TEXT,
ADD COLUMN     "refundReference" TEXT,
ADD COLUMN     "refundStatus" TEXT,
ADD COLUMN     "refundedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "CasePublicIdCounter" (
    "year" INTEGER NOT NULL,
    "nextNumber" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "CasePublicIdCounter_pkey" PRIMARY KEY ("year")
);

-- CreateTable
CREATE TABLE "BeneficiaryCase" (
    "id" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "firstName" TEXT,
    "age" INTEGER,
    "region" TEXT NOT NULL,
    "needType" TEXT NOT NULL,
    "needDescription" TEXT NOT NULL,
    "storyShort" TEXT NOT NULL,
    "storyFull" TEXT NOT NULL,
    "amountNeeded" INTEGER NOT NULL,
    "amountRaised" INTEGER NOT NULL DEFAULT 0,
    "amountOversubscribed" INTEGER NOT NULL DEFAULT 0,
    "photoUrl" TEXT,
    "photoAssetId" TEXT,
    "photoAlt" TEXT,
    "pillarId" TEXT,
    "programId" TEXT,
    "consentGiven" BOOLEAN NOT NULL DEFAULT false,
    "consentRecordedAt" TIMESTAMP(3),
    "consentExpiresAt" TIMESTAMP(3),
    "consentRevokedAt" TIMESTAMP(3),
    "consentEvidenceRef" TEXT,
    "safeguardingApproved" BOOLEAN NOT NULL DEFAULT false,
    "safeguardingApprovedAt" TIMESTAMP(3),
    "safeguardingApprovedBy" TEXT,
    "revision" INTEGER NOT NULL DEFAULT 1,
    "approvedRevision" INTEGER,
    "reviewStatus" TEXT NOT NULL DEFAULT 'draft',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "publishedAt" TIMESTAMP(3),
    "closesAt" TIMESTAMP(3),
    "fundedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "BeneficiaryCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportPaymentIntent" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "beneficiaryCaseId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'GHS',
    "email" TEXT NOT NULL,
    "donorName" TEXT,
    "anonymous" BOOLEAN NOT NULL DEFAULT false,
    "supporterId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'created',
    "providerTransactionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupportPaymentIntent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExcessChoiceToken" (
    "id" TEXT NOT NULL,
    "donationId" TEXT NOT NULL,
    "nonceHash" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "resolutionId" TEXT,

    CONSTRAINT "ExcessChoiceToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExcessResolution" (
    "id" TEXT NOT NULL,
    "donationId" TEXT NOT NULL,
    "choice" TEXT NOT NULL,
    "targetCaseId" TEXT,
    "amount" INTEGER NOT NULL,
    "actorType" TEXT NOT NULL,
    "actorId" TEXT,
    "actorTokenId" TEXT,
    "consentText" TEXT NOT NULL,
    "consentVersion" TEXT NOT NULL,
    "consentAt" TIMESTAMP(3) NOT NULL,
    "consentEvidenceRef" TEXT,
    "state" TEXT NOT NULL DEFAULT 'requested',
    "providerId" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "leaseToken" TEXT,
    "leaseUntil" TIMESTAMP(3),
    "nextAttemptAt" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "ExcessResolution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DonationLedgerEntry" (
    "id" TEXT NOT NULL,
    "donationId" TEXT NOT NULL,
    "beneficiaryCaseId" TEXT,
    "resolutionId" TEXT,
    "operationKey" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'GHS',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DonationLedgerEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationOutbox" (
    "id" TEXT NOT NULL,
    "eventKey" TEXT NOT NULL,
    "donationId" TEXT NOT NULL,
    "resolutionId" TEXT,
    "template" TEXT NOT NULL,
    "payloadEncrypted" TEXT,
    "expiresAt" TIMESTAMP(3),
    "state" TEXT NOT NULL DEFAULT 'pending',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leaseToken" TEXT,
    "leaseUntil" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotificationOutbox_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportRateLimit" (
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupportRateLimit_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "BeneficiaryCase_publicId_key" ON "BeneficiaryCase"("publicId");

-- CreateIndex
CREATE INDEX "BeneficiaryCase_status_consentGiven_safeguardingApproved_pu_idx" ON "BeneficiaryCase"("status", "consentGiven", "safeguardingApproved", "publishedAt");

-- CreateIndex
CREATE INDEX "BeneficiaryCase_closesAt_idx" ON "BeneficiaryCase"("closesAt");

-- CreateIndex
CREATE INDEX "BeneficiaryCase_pillarId_idx" ON "BeneficiaryCase"("pillarId");

-- CreateIndex
CREATE INDEX "BeneficiaryCase_programId_idx" ON "BeneficiaryCase"("programId");

-- CreateIndex
CREATE INDEX "BeneficiaryCase_createdAt_idx" ON "BeneficiaryCase"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "SupportPaymentIntent_reference_key" ON "SupportPaymentIntent"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "SupportPaymentIntent_providerTransactionId_key" ON "SupportPaymentIntent"("providerTransactionId");

-- CreateIndex
CREATE INDEX "SupportPaymentIntent_beneficiaryCaseId_idx" ON "SupportPaymentIntent"("beneficiaryCaseId");

-- CreateIndex
CREATE INDEX "SupportPaymentIntent_supporterId_idx" ON "SupportPaymentIntent"("supporterId");

-- CreateIndex
CREATE INDEX "SupportPaymentIntent_status_createdAt_idx" ON "SupportPaymentIntent"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ExcessChoiceToken_nonceHash_key" ON "ExcessChoiceToken"("nonceHash");

-- CreateIndex
CREATE INDEX "ExcessChoiceToken_donationId_idx" ON "ExcessChoiceToken"("donationId");

-- CreateIndex
CREATE INDEX "ExcessChoiceToken_expiresAt_idx" ON "ExcessChoiceToken"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "ExcessResolution_donationId_key" ON "ExcessResolution"("donationId");

-- CreateIndex
CREATE UNIQUE INDEX "ExcessResolution_actorTokenId_key" ON "ExcessResolution"("actorTokenId");

-- CreateIndex
CREATE UNIQUE INDEX "ExcessResolution_providerId_key" ON "ExcessResolution"("providerId");

-- CreateIndex
CREATE INDEX "ExcessResolution_targetCaseId_idx" ON "ExcessResolution"("targetCaseId");

-- CreateIndex
CREATE INDEX "ExcessResolution_state_nextAttemptAt_idx" ON "ExcessResolution"("state", "nextAttemptAt");

-- CreateIndex
CREATE INDEX "ExcessResolution_leaseUntil_idx" ON "ExcessResolution"("leaseUntil");

-- CreateIndex
CREATE UNIQUE INDEX "DonationLedgerEntry_operationKey_key" ON "DonationLedgerEntry"("operationKey");

-- CreateIndex
CREATE INDEX "DonationLedgerEntry_donationId_idx" ON "DonationLedgerEntry"("donationId");

-- CreateIndex
CREATE INDEX "DonationLedgerEntry_beneficiaryCaseId_idx" ON "DonationLedgerEntry"("beneficiaryCaseId");

-- CreateIndex
CREATE INDEX "DonationLedgerEntry_resolutionId_idx" ON "DonationLedgerEntry"("resolutionId");

-- CreateIndex
CREATE INDEX "DonationLedgerEntry_kind_createdAt_idx" ON "DonationLedgerEntry"("kind", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationOutbox_eventKey_key" ON "NotificationOutbox"("eventKey");

-- CreateIndex
CREATE INDEX "NotificationOutbox_donationId_idx" ON "NotificationOutbox"("donationId");

-- CreateIndex
CREATE INDEX "NotificationOutbox_state_nextAttemptAt_idx" ON "NotificationOutbox"("state", "nextAttemptAt");

-- CreateIndex
CREATE INDEX "NotificationOutbox_leaseUntil_idx" ON "NotificationOutbox"("leaseUntil");

-- CreateIndex
CREATE INDEX "SupportRateLimit_expiresAt_idx" ON "SupportRateLimit"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "Donation_paymentReference_key" ON "Donation"("paymentReference");

-- CreateIndex
CREATE UNIQUE INDEX "Donation_refundReference_key" ON "Donation"("refundReference");

-- CreateIndex
CREATE INDEX "Donation_beneficiaryCaseId_idx" ON "Donation"("beneficiaryCaseId");

-- CreateIndex
CREATE INDEX "Donation_refundStatus_refundDueAt_idx" ON "Donation"("refundStatus", "refundDueAt");

-- CreateIndex
CREATE INDEX "Donation_paidAt_idx" ON "Donation"("paidAt");

-- AddForeignKey
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_beneficiaryCaseId_fkey" FOREIGN KEY ("beneficiaryCaseId") REFERENCES "BeneficiaryCase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BeneficiaryCase" ADD CONSTRAINT "BeneficiaryCase_pillarId_fkey" FOREIGN KEY ("pillarId") REFERENCES "Pillar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BeneficiaryCase" ADD CONSTRAINT "BeneficiaryCase_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BeneficiaryCase" ADD CONSTRAINT "BeneficiaryCase_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BeneficiaryCase" ADD CONSTRAINT "BeneficiaryCase_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BeneficiaryCase" ADD CONSTRAINT "BeneficiaryCase_safeguardingApprovedBy_fkey" FOREIGN KEY ("safeguardingApprovedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportPaymentIntent" ADD CONSTRAINT "SupportPaymentIntent_beneficiaryCaseId_fkey" FOREIGN KEY ("beneficiaryCaseId") REFERENCES "BeneficiaryCase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportPaymentIntent" ADD CONSTRAINT "SupportPaymentIntent_supporterId_fkey" FOREIGN KEY ("supporterId") REFERENCES "Supporter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExcessChoiceToken" ADD CONSTRAINT "ExcessChoiceToken_donationId_fkey" FOREIGN KEY ("donationId") REFERENCES "Donation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExcessChoiceToken" ADD CONSTRAINT "ExcessChoiceToken_resolutionId_fkey" FOREIGN KEY ("resolutionId") REFERENCES "ExcessResolution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExcessResolution" ADD CONSTRAINT "ExcessResolution_donationId_fkey" FOREIGN KEY ("donationId") REFERENCES "Donation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExcessResolution" ADD CONSTRAINT "ExcessResolution_targetCaseId_fkey" FOREIGN KEY ("targetCaseId") REFERENCES "BeneficiaryCase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExcessResolution" ADD CONSTRAINT "ExcessResolution_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExcessResolution" ADD CONSTRAINT "ExcessResolution_actorTokenId_fkey" FOREIGN KEY ("actorTokenId") REFERENCES "ExcessChoiceToken"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DonationLedgerEntry" ADD CONSTRAINT "DonationLedgerEntry_donationId_fkey" FOREIGN KEY ("donationId") REFERENCES "Donation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DonationLedgerEntry" ADD CONSTRAINT "DonationLedgerEntry_beneficiaryCaseId_fkey" FOREIGN KEY ("beneficiaryCaseId") REFERENCES "BeneficiaryCase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DonationLedgerEntry" ADD CONSTRAINT "DonationLedgerEntry_resolutionId_fkey" FOREIGN KEY ("resolutionId") REFERENCES "ExcessResolution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationOutbox" ADD CONSTRAINT "NotificationOutbox_donationId_fkey" FOREIGN KEY ("donationId") REFERENCES "Donation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationOutbox" ADD CONSTRAINT "NotificationOutbox_resolutionId_fkey" FOREIGN KEY ("resolutionId") REFERENCES "ExcessResolution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Financial constraints supplement application validation. BIGINT casts avoid sum overflow.
ALTER TABLE "BeneficiaryCase"
  ADD CONSTRAINT "case_money" CHECK ("amountNeeded" > 0 AND "amountRaised" >= 0 AND "amountRaised" <= "amountNeeded" AND "amountOversubscribed" >= 0),
  ADD CONSTRAINT "case_status" CHECK ("status" IN ('draft','active','funded','closed','archived')),
  ADD CONSTRAINT "case_review" CHECK ("reviewStatus" IN ('draft','submitted','approved','rejected')),
  ADD CONSTRAINT "case_revision" CHECK ("revision" > 0 AND ("approvedRevision" IS NULL OR "approvedRevision" <= "revision")),
  ADD CONSTRAINT "case_public_id" CHECK ("publicId" ~ '^FTF-[0-9]{4}-[0-9]{3,}$');
ALTER TABLE "Donation"
  ADD CONSTRAINT "donation_original_allocation" CHECK (
    "amountCreditedToCase" >= 0 AND "amountExcess" >= 0 AND
    ("beneficiaryCaseId" IS NULL OR (
      "amount" > 0 AND "currency" = 'GHS' AND "paymentReference" IS NOT NULL AND "paidAt" IS NOT NULL AND
      "amount"::BIGINT = "amountCreditedToCase"::BIGINT + "amountExcess"::BIGINT AND
      (("amountExcess" = 0 AND "refundDueAt" IS NULL AND "refundStatus" IS NULL) OR
       ("amountExcess" > 0 AND "refundDueAt" IS NOT NULL AND "refundStatus" IS NOT NULL AND
        "refundDueAt" = "paidAt" + INTERVAL '14 days'))))),
  ADD CONSTRAINT "donation_refund_status" CHECK ("refundStatus" IS NULL OR "refundStatus" IN ('pending','audited','refunded','donor_redirected')),
  ADD CONSTRAINT "donation_refund_completion" CHECK ("beneficiaryCaseId" IS NULL OR
    (("refundStatus" IS DISTINCT FROM 'refunded' OR ("refundedAt" IS NOT NULL AND "refundReference" IS NOT NULL)) AND
     ("paymentStatus" <> 'refunded' OR ("amountCreditedToCase" = 0 AND "refundStatus" = 'refunded'))));
ALTER TABLE "SupportPaymentIntent"
  ADD CONSTRAINT "intent_money" CHECK ("amount" > 0 AND "currency" = 'GHS'),
  ADD CONSTRAINT "intent_status" CHECK ("status" IN ('created','initialized','initialization_failed','finalized','quarantined'));
ALTER TABLE "ExcessChoiceToken"
  ADD CONSTRAINT "choice_dates" CHECK ("expiresAt" > "issuedAt"),
  ADD CONSTRAINT "choice_consumption" CHECK (("consumedAt" IS NULL) = ("resolutionId" IS NULL));
CREATE UNIQUE INDEX "choice_one_active_per_donation" ON "ExcessChoiceToken" ("donationId")
  WHERE "consumedAt" IS NULL AND "revokedAt" IS NULL;
ALTER TABLE "ExcessResolution"
  ADD CONSTRAINT "resolution_money" CHECK ("amount" > 0 AND "attempts" >= 0),
  ADD CONSTRAINT "resolution_choice" CHECK ("choice" IN ('refund','general','case') AND (("choice" = 'case') = ("targetCaseId" IS NOT NULL))),
  ADD CONSTRAINT "resolution_actor" CHECK ("actorType" IN ('donor','admin','system') AND
    ("actorType" <> 'donor' OR "actorTokenId" IS NOT NULL) AND
    ("actorType" <> 'system' OR "choice" = 'refund') AND
    ("actorType" <> 'admin' OR "choice" = 'refund' OR "consentEvidenceRef" IS NOT NULL)),
  ADD CONSTRAINT "resolution_state" CHECK ("state" IN ('requested','submitting','processing','failed','needs_attention','completed') AND
    (("state" = 'completed') = ("completedAt" IS NOT NULL)) AND ("choice" = 'refund' OR "state" = 'completed'));
ALTER TABLE "DonationLedgerEntry"
  ADD CONSTRAINT "ledger_money" CHECK ("amount" > 0 AND "currency" = 'GHS'),
  ADD CONSTRAINT "ledger_kind" CHECK ("kind" IN ('original_case_credit','excess_held','refund_excess','redirect_general','redirect_case')),
  ADD CONSTRAINT "ledger_destination" CHECK (("kind" IN ('original_case_credit','redirect_case')) = ("beneficiaryCaseId" IS NOT NULL)),
  ADD CONSTRAINT "ledger_resolution" CHECK (("kind" IN ('refund_excess','redirect_general','redirect_case')) = ("resolutionId" IS NOT NULL));
CREATE UNIQUE INDEX "ledger_one_kind_per_donation" ON "DonationLedgerEntry" ("donationId", "kind");
CREATE UNIQUE INDEX "ledger_one_settlement_per_donation" ON "DonationLedgerEntry" ("donationId")
  WHERE "kind" IN ('refund_excess','redirect_general','redirect_case');
ALTER TABLE "NotificationOutbox"
  ADD CONSTRAINT "outbox_attempts" CHECK ("attempts" >= 0),
  ADD CONSTRAINT "outbox_state" CHECK ("state" IN ('pending','sending','sent','canceled'));

CREATE FUNCTION ftf_guard_case_history() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
  IF NEW."publicId" IS DISTINCT FROM OLD."publicId" OR
     (OLD."amountRaised" > 0 AND NEW."amountNeeded" <> OLD."amountNeeded") OR
     NEW."amountRaised" < OLD."amountRaised" OR NEW."amountOversubscribed" < OLD."amountOversubscribed" THEN
    RAISE EXCEPTION 'Case identifier, credited target and lifetime totals are protected';
  END IF;
  IF ROW(NEW."firstName", NEW."age", NEW."region", NEW."needType", NEW."needDescription", NEW."storyShort", NEW."storyFull",
         NEW."amountNeeded", NEW."pillarId", NEW."programId", NEW."photoUrl", NEW."photoAssetId", NEW."photoAlt",
         NEW."consentGiven", NEW."consentEvidenceRef", NEW."consentRecordedAt", NEW."consentExpiresAt", NEW."consentRevokedAt", NEW."closesAt")
     IS DISTINCT FROM
     ROW(OLD."firstName", OLD."age", OLD."region", OLD."needType", OLD."needDescription", OLD."storyShort", OLD."storyFull",
         OLD."amountNeeded", OLD."pillarId", OLD."programId", OLD."photoUrl", OLD."photoAssetId", OLD."photoAlt",
         OLD."consentGiven", OLD."consentEvidenceRef", OLD."consentRecordedAt", OLD."consentExpiresAt", OLD."consentRevokedAt", OLD."closesAt") THEN
    NEW."revision" := OLD."revision" + 1;
    NEW."approvedRevision" := NULL;
    NEW."safeguardingApproved" := false;
    NEW."safeguardingApprovedAt" := NULL;
    NEW."safeguardingApprovedBy" := NULL;
    NEW."reviewStatus" := 'draft';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER "case_history_guard" BEFORE UPDATE ON "BeneficiaryCase" FOR EACH ROW EXECUTE FUNCTION ftf_guard_case_history();

CREATE FUNCTION ftf_guard_original_allocation() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
  IF OLD."beneficiaryCaseId" IS NOT NULL AND ROW(NEW."amount", NEW."currency", NEW."beneficiaryCaseId",
      NEW."paymentReference", NEW."amountCreditedToCase", NEW."amountExcess", NEW."paidAt", NEW."refundDueAt")
    IS DISTINCT FROM ROW(OLD."amount", OLD."currency", OLD."beneficiaryCaseId",
      OLD."paymentReference", OLD."amountCreditedToCase", OLD."amountExcess", OLD."paidAt", OLD."refundDueAt") THEN
    RAISE EXCEPTION 'Original case payment allocation is immutable';
  END IF;
  IF OLD."refundStatus" IN ('refunded','donor_redirected') AND
     ROW(NEW."refundStatus", NEW."refundedAt", NEW."refundReference", NEW."paymentStatus") IS DISTINCT FROM
     ROW(OLD."refundStatus", OLD."refundedAt", OLD."refundReference", OLD."paymentStatus") THEN
    RAISE EXCEPTION 'Settled excess cannot be reopened';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER "donation_allocation_guard" BEFORE UPDATE ON "Donation" FOR EACH ROW EXECUTE FUNCTION ftf_guard_original_allocation();

CREATE FUNCTION ftf_guard_ledger() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE d "Donation"%ROWTYPE; r "ExcessResolution"%ROWTYPE;
BEGIN
  IF TG_OP <> 'INSERT' THEN RAISE EXCEPTION 'Donation ledger is append-only'; END IF;
  SELECT * INTO STRICT d FROM "Donation" WHERE "id" = NEW."donationId" FOR UPDATE;
  IF d."beneficiaryCaseId" IS NULL THEN RAISE EXCEPTION 'Ledger requires a case payment'; END IF;
  IF NEW."kind" = 'original_case_credit' THEN
    IF NEW."amount" <> d."amountCreditedToCase" OR NEW."beneficiaryCaseId" IS DISTINCT FROM d."beneficiaryCaseId" THEN
      RAISE EXCEPTION 'Original credit mismatch';
    END IF;
  ELSIF NEW."amount" <> d."amountExcess" THEN RAISE EXCEPTION 'Excess amount mismatch';
  END IF;
  IF NEW."resolutionId" IS NOT NULL THEN
    SELECT * INTO STRICT r FROM "ExcessResolution" WHERE "id" = NEW."resolutionId";
    IF r."donationId" <> d."id" OR r."amount" <> NEW."amount" OR r."state" <> 'completed' OR
      NEW."kind" <> (CASE r."choice" WHEN 'refund' THEN 'refund_excess' WHEN 'general' THEN 'redirect_general' ELSE 'redirect_case' END) OR
      NEW."beneficiaryCaseId" IS DISTINCT FROM r."targetCaseId" THEN
      RAISE EXCEPTION 'Settlement does not match the accepted resolution';
    END IF;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER "ledger_guard" BEFORE INSERT OR UPDATE OR DELETE ON "DonationLedgerEntry" FOR EACH ROW EXECUTE FUNCTION ftf_guard_ledger();

CREATE FUNCTION ftf_guard_resolution() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
  IF ROW(NEW."donationId", NEW."choice", NEW."targetCaseId", NEW."amount", NEW."actorType", NEW."actorTokenId",
      NEW."consentText", NEW."consentVersion", NEW."consentAt", NEW."consentEvidenceRef") IS DISTINCT FROM
     ROW(OLD."donationId", OLD."choice", OLD."targetCaseId", OLD."amount", OLD."actorType", OLD."actorTokenId",
      OLD."consentText", OLD."consentVersion", OLD."consentAt", OLD."consentEvidenceRef") THEN
    RAISE EXCEPTION 'Accepted excess decision is immutable';
  END IF;
  IF OLD."state" = 'completed' AND ROW(NEW."state", NEW."completedAt", NEW."providerId") IS DISTINCT FROM
     ROW(OLD."state", OLD."completedAt", OLD."providerId") THEN RAISE EXCEPTION 'Completed resolution is final'; END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER "resolution_guard" BEFORE UPDATE ON "ExcessResolution" FOR EACH ROW EXECUTE FUNCTION ftf_guard_resolution();
COMMIT;
