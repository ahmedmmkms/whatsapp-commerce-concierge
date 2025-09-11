-- Sprint 7: PDPL redaction flags and audit log

-- Add redaction flags to Customer
ALTER TABLE "Customer"
  ADD COLUMN IF NOT EXISTS "isRedacted" BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS "redactedAt" TIMESTAMP(3);

-- ComplianceAudit table
CREATE TABLE IF NOT EXISTS "ComplianceAudit" (
  "id" TEXT PRIMARY KEY,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "action" VARCHAR(32) NOT NULL,
  "subjectType" VARCHAR(32) NOT NULL,
  "subjectId" VARCHAR(64) NOT NULL,
  "requestedBy" VARCHAR(64),
  "status" VARCHAR(24) NOT NULL,
  "details" JSONB
);

CREATE INDEX IF NOT EXISTS "ComplianceAudit_subject_idx" ON "ComplianceAudit"("subjectType", "subjectId", "createdAt");

