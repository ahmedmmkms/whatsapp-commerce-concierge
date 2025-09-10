-- Add composite index to speed update/remove by sku per cart
CREATE INDEX IF NOT EXISTS "CartItem_cartId_sku_idx" ON "CartItem"("cartId", "sku");

