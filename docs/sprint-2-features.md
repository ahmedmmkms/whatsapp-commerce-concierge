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

Notes
- Env: `CATALOG_SYNC_KEY` (guard sync), `DEFAULT_CURRENCY` (future), `CATALOG_FEED_URL` (future).
- Current commit includes Prisma models + API scaffolds; sync job to be implemented.
