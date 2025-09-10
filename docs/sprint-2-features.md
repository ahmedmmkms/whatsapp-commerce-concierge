# Sprint 2 Features — Catalog + Browse

Date: 2025-09-10
Owner: AMM

Scope
- Catalog ingestion job: ingest demo feed, nightly sync, seed fallback.
- Product query API: `/products` (search/filter/sort/page) and `/products/:id`.
- Categories API: `/categories` (ordered, counts).
- Admin endpoints: `POST /catalog/sync` (key-guarded stub), `GET /catalog/health`.
- WhatsApp browse flows: categories, product details, quick replies (AR/EN) — routing stub planned.
- Web QA preview: minimal list/detail pages; RTL baseline.

Data Model (Prisma)
- Category: `id`, `name`, `slug` (unique), `parentId`; relations to children/products.
- Product: `id`, `sku` (unique), `name`, `description`, `price` (minor units), `currency`, `stock`, `isActive`, `brand?`, `attributes?`, `categoryId`.
- ProductMedia: `id`, `productId`, `url`, `kind` (image|video), `sortOrder`.

Performance
- P95 product lookup < 150ms with warm cache (future: Redis keys).

Testing
- Unit: feed parser/upsert (next), query filters/sorts.
- E2E: `/products`, `/products/:id`, `/categories` basic coverage.

Test Scripts (PowerShell)
- `scripts/sprint2-smoke.ps1` — full Sprint 2 smoke.
- `scripts/sprint2/test-catalog-health.ps1` — health and counts.
- `scripts/sprint2/test-products.ps1` — list/search/sort/page.
- `scripts/sprint2/test-product-detail.ps1` — product by id.
- `scripts/sprint2/test-categories.ps1` — categories list.
- `scripts/sprint2/test-catalog-sync.ps1` — trigger sync (requires `CATALOG_SYNC_KEY`).

Examples
- `pwsh scripts/sprint2-smoke.ps1 -ApiBase https://<api>.vercel.app`
- `pwsh scripts/sprint2/test-catalog-sync.ps1 -ApiBase https://<api>.vercel.app -CatalogSyncKey '<KEY>'`

Seeding Sample Electronics Data
- Local DB (DATABASE_URL must point to your Postgres):
  - `pnpm -C packages/api run db:seed:electronics`
  - Or: `cd packages/api && node scripts/seed-electronics.mjs`
- After seeding, rerun the smoke tests with `-ExpectData`.

Notes
- Env: `CATALOG_SYNC_KEY` (guard sync), `DEFAULT_CURRENCY` (future), `CATALOG_FEED_URL` (future).
- Current commit includes Prisma models + API scaffolds; demo sync implemented; dedicated electronics seeding script added.

Additional Test Scripts
- `scripts/sprint2/test-wa-preview.ps1` — preview WA browse intents (AR/EN) without sending messages.

Changelog Additions
- Added WA intent preview endpoint (`POST /whatsapp/preview`).
- Added Redis caching for catalog queries and warm-up after sync.
- Added nightly sync GitHub Action (`.github/workflows/catalog-nightly-sync.yml`).
