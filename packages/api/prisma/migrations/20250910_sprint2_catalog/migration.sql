-- Sprint 2: Catalog tables (Category, Product, ProductMedia)

-- Category
CREATE TABLE IF NOT EXISTS "Category" (
  "id" TEXT PRIMARY KEY,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "name" VARCHAR(128) NOT NULL,
  "slug" VARCHAR(128) NOT NULL,
  "parentId" TEXT NULL,
  CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "Category_slug_key" ON "Category"("slug");

-- Product
CREATE TABLE IF NOT EXISTS "Product" (
  "id" TEXT PRIMARY KEY,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "sku" VARCHAR(64) NOT NULL,
  "name" VARCHAR(256) NOT NULL,
  "description" TEXT NULL,
  "price" INTEGER NOT NULL,
  "currency" VARCHAR(8) NOT NULL,
  "stock" INTEGER NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "brand" VARCHAR(64) NULL,
  "attributes" JSON NULL,
  "categoryId" TEXT NULL,
  CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "Product_sku_key" ON "Product"("sku");
CREATE INDEX IF NOT EXISTS "Product_categoryId_idx" ON "Product"("categoryId");
CREATE INDEX IF NOT EXISTS "Product_name_idx" ON "Product"("name");

-- ProductMedia
CREATE TABLE IF NOT EXISTS "ProductMedia" (
  "id" TEXT PRIMARY KEY,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "productId" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "kind" VARCHAR(16) NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "ProductMedia_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "ProductMedia_productId_idx" ON "ProductMedia"("productId");

