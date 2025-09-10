-- Sprint 2: Catalog sync log
CREATE TABLE IF NOT EXISTS "CatalogSyncLog" (
  "id" TEXT PRIMARY KEY,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "ok" BOOLEAN NOT NULL,
  "productsUpserted" INTEGER NOT NULL,
  "categoriesUpserted" INTEGER NOT NULL,
  "note" TEXT NULL
);

