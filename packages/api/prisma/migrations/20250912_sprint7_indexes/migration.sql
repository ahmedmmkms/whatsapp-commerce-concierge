-- Sprint 7: Performance indexes

-- Optimize returns listing by order (filter + sort)
CREATE INDEX IF NOT EXISTS "Return_orderId_createdAt_idx" ON "Return"("orderId", "createdAt");

