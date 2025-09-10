-- Sprint 3: Cart tables (Cart, CartItem)

CREATE TABLE IF NOT EXISTS "Cart" (
  "id" TEXT PRIMARY KEY,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "customerId" TEXT NOT NULL,
  "conversationId" TEXT NOT NULL,
  "status" VARCHAR(16) NOT NULL DEFAULT 'active',
  "currency" VARCHAR(8) NOT NULL,
  "subtotalMinor" INTEGER NOT NULL DEFAULT 0,
  "taxMinor" INTEGER NOT NULL DEFAULT 0,
  "shippingMinor" INTEGER NOT NULL DEFAULT 0,
  "totalMinor" INTEGER NOT NULL DEFAULT 0,
  "version" INTEGER NOT NULL DEFAULT 0,
  "expiresAt" TIMESTAMP(3),
  CONSTRAINT "Cart_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "Cart_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "Cart_customerId_status_idx" ON "Cart"("customerId", "status");

CREATE TABLE IF NOT EXISTS "CartItem" (
  "id" TEXT PRIMARY KEY,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "cartId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "sku" VARCHAR(64) NOT NULL,
  "nameSnapshot" VARCHAR(256) NOT NULL,
  "priceSnapshotMinor" INTEGER NOT NULL,
  "currency" VARCHAR(8) NOT NULL,
  "qty" INTEGER NOT NULL,
  "lineTotalMinor" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "CartItem_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "CartItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "CartItem_cartId_productId_key" ON "CartItem"("cartId", "productId");
CREATE INDEX IF NOT EXISTS "CartItem_cartId_idx" ON "CartItem"("cartId");

