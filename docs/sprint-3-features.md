# Sprint 3 Features — Conversational Cart

Date: 2025-09-10
Owner: AMM

Scope
- Cart service and endpoints: create/add/update/remove/view with idempotency.
- Data model: Cart and CartItem linked to Customer/Conversation.
- WhatsApp flows: add/view/update/remove; shipping estimate stub; AR/EN.
- Pricing utilities: currency handling; subtotal/tax/shipping/total placeholders.
- QA: unit/E2E/concurrency tests; PowerShell smoke scripts.

Data Model (Prisma)
- Cart: id (uuid), customerId (FK), conversationId (FK), status (active|abandoned|ordered), currency, subtotalMinor, taxMinor, shippingMinor, totalMinor, version, expiresAt, createdAt, updatedAt.
- CartItem: id (uuid), cartId (FK), productId (FK), sku, nameSnapshot, priceSnapshotMinor, currency, qty, lineTotalMinor, createdAt, updatedAt.
- Constraints: unique (cartId, productId); check qty > 0; index (customerId, status).

API Endpoints
- POST /cart — create or return active cart for caller context (WA sender or provided customer).
- GET /cart — return active cart with items.
- POST /cart/items — add/upsert item by productId or sku; Idempotency-Key supported.
- PATCH /cart/items/:itemId — update quantity; qty=0 removes.
- DELETE /cart/items/:itemId — remove item.
- GET /cart/estimate-shipping — stubbed estimate based on subtotal thresholds.

WhatsApp Flows
- Add to cart: “add <sku>” and quick reply on product detail.
- View cart: “cart” shows items, totals, actions.
- Update/remove: “qty <sku> <n>”, “remove <sku>”.
- i18n: Arabic/English templates consistent with Sprint 2 preview patterns.

Performance
- P95 cart operations < 200ms (excluding cold-start), concurrency-safe via transactions.

Testing
- Unit: CartService (create/add/update/remove/totaling), currency utils, shipping stub.
- E2E: cart lifecycle + idempotency under retry; parallel updates on same SKU.

Test Scripts (PowerShell)
- scripts/sprint3-smoke.ps1 — full Sprint 3 smoke (cart lifecycle + estimate).
- scripts/sprint3/test-cart.ps1 — focused CRUD/idempotency tests.

Examples
- pwsh scripts/sprint3-smoke.ps1 -ApiBase https://<api>.vercel.app
- pwsh scripts/sprint3/test-cart.ps1 -ApiBase https://<api>.vercel.app -IdempotencyKey test-key-123

Notes
- Env: DEFAULT_CURRENCY, CART_TTL_DAYS (e.g., 7), CART_IDEMPOTENCY_TTL_MIN (e.g., 15).
- Currency stored in minor units; line totals and cart totals computed server-side.
- Bind carts to WhatsApp sender/Conversation to avoid cross-device confusion.

Changelog Additions (Planned)
- Added Cart and CartItem models; migrations applied.
- Added /cart endpoints with idempotency; shipping estimate stub.
- Extended /whatsapp/preview to simulate cart flows (AR/EN).

---

WhatsApp Commands (Examples)
- add: `add ABC-123`
- cart: `cart`
- update qty: `qty ABC-123 2`
- remove: `remove ABC-123`
- Preview: `POST /whatsapp/preview { from?: "+9715...", text: "add ABC-123", lang: "en" }`

API Examples
- Create/Get cart:
  - `POST /cart` → `{ ok: true, cart: { id, currency, items: [] } }`
  - `GET /cart` → `{ ok: true, cart: { id, items: [{ id, sku, qty, lineTotalMinor }], subtotalMinor, totalMinor } }`
- Add item:
  - `POST /cart/items` body: `{ productId: "pid-1", qty: 1 }` or `{ sku: "ABC-123", qty: 1 }`
  - Optional header: `Idempotency-Key: <uuid>`
  - Response: `{ ok: true, item: { id, sku, qty, lineTotalMinor } }`
- Update qty:
  - `PATCH /cart/items/:itemId` body: `{ qty: 2 }`
- Remove item:
  - `DELETE /cart/items/:itemId`
- Shipping estimate:
  - `GET /cart/estimate-shipping` → `{ ok: true, estimate: { currency, shippingMinor, freeThresholdMinor } }`

Performance Notes
- Indexes: `(CartItem.cartId, sku)` speeds qty/remove by SKU.
- Shipping rules: Free over 100 (major units), otherwise flat 20.

Testing Scripts
- `scripts/sprint3-smoke.ps1` — cart lifecycle + estimate.
- `scripts/sprint3/test-cart.ps1` — CRUD/idempotency.
- `scripts/sprint3/test-wa-cart.ps1` — WA preview add/cart/qty/remove.

Env Notes
- Recommended: set `REDIS_URL` for idempotent `POST /cart/items` retries.
