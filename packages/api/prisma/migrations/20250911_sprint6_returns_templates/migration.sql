-- Sprint 6: Returns, OrderEvent, Template tables

CREATE TABLE IF NOT EXISTS "Return" (
  "id" TEXT PRIMARY KEY,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "orderId" TEXT NOT NULL,
  "status" VARCHAR(24) NOT NULL,
  "reason" VARCHAR(128),
  "notes" TEXT,
  "rmaCode" VARCHAR(32) NOT NULL,
  CONSTRAINT "Return_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "Return_rmaCode_key" ON "Return"("rmaCode");
CREATE INDEX IF NOT EXISTS "Return_orderId_status_idx" ON "Return"("orderId", "status");

CREATE TABLE IF NOT EXISTS "ReturnItem" (
  "id" TEXT PRIMARY KEY,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "returnId" TEXT NOT NULL,
  "orderItemId" TEXT,
  "sku" VARCHAR(64),
  "qty" INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT "ReturnItem_returnId_fkey" FOREIGN KEY ("returnId") REFERENCES "Return"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "ReturnItem_returnId_idx" ON "ReturnItem"("returnId");

CREATE TABLE IF NOT EXISTS "OrderEvent" (
  "id" TEXT PRIMARY KEY,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "orderId" TEXT NOT NULL,
  "type" VARCHAR(32) NOT NULL,
  "payload" JSONB,
  CONSTRAINT "OrderEvent_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "OrderEvent_orderId_createdAt_idx" ON "OrderEvent"("orderId", "createdAt");

CREATE TABLE IF NOT EXISTS "Template" (
  "id" TEXT PRIMARY KEY,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "key" VARCHAR(64) NOT NULL,
  "locale" VARCHAR(8) NOT NULL,
  "channel" VARCHAR(8) NOT NULL,
  "body" TEXT NOT NULL,
  "variables" JSONB,
  "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
  "updatedBy" VARCHAR(64)
);

CREATE UNIQUE INDEX IF NOT EXISTS "Template_key_locale_channel_key" ON "Template"("key", "locale", "channel");

