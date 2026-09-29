BEGIN;
ALTER TABLE "Donation"
  ADD COLUMN "financialHoldAt" TIMESTAMP(3),
  ADD COLUMN "financialHoldReason" TEXT,
  ADD CONSTRAINT "donation_financial_hold" CHECK (
    ("financialHoldAt" IS NULL AND "financialHoldReason" IS NULL) OR
    ("financialHoldAt" IS NOT NULL AND "financialHoldReason" IS NOT NULL AND "beneficiaryCaseId" IS NOT NULL)
  );
CREATE INDEX "Donation_financialHoldAt_idx" ON "Donation"("financialHoldAt");
COMMIT;
