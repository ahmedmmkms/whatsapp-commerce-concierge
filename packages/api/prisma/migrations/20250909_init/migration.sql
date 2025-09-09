-- Initial schema for Sprint 1: Customer, Conversation, Consent

-- CreateEnum / extensions if needed (none)

CREATE TABLE IF NOT EXISTS "Customer" (
  "id" TEXT PRIMARY KEY,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "waPhone" VARCHAR(32) NOT NULL,
  "waName" VARCHAR(128)
);

CREATE UNIQUE INDEX IF NOT EXISTS "Customer_waPhone_key" ON "Customer"("waPhone");

CREATE TABLE IF NOT EXISTS "Conversation" (
  "id" TEXT PRIMARY KEY,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "customerId" TEXT NOT NULL,
  "lastMessageAt" TIMESTAMP,
  "state" VARCHAR(64),
  CONSTRAINT "Conversation_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "Conversation_customerId_key" ON "Conversation"("customerId");

CREATE TABLE IF NOT EXISTS "Consent" (
  "id" TEXT PRIMARY KEY,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "customerId" TEXT NOT NULL,
  "granted" BOOLEAN NOT NULL,
  "channel" VARCHAR(32) NOT NULL,
  "policyText" TEXT,
  "policyVersion" VARCHAR(32),
  CONSTRAINT "Consent_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Update triggers for updatedAt (optional in Neon; Prisma usually handles via application update)

