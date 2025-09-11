# Sprint 5 Features – Checkout, Payments (COD + Stripe), Address

Date: 2025-10-?? (planned)
Owner: TBD

## Scope
- Checkout MVP bridging WhatsApp and web: create idempotent orders from the cart, capture address, and complete payment via COD or Stripe (test mode).
- Payments abstraction with a provider-agnostic gateway (Stripe first), safe handoff (no card data stored), and reliable webhook handling.
- Observability and resilience: signature verification, idempotency, retries/backoff, and request correlation.

## Out of Scope
- Full Orders/Returns APIs and support page (moved to Sprint 6).
- Multi-address book, saved payment methods, or advanced fraud checks.

## API Endpoints
- `POST /checkout/init`
  - Input: idempotency key (header), optional address payload if already collected.
  - Behavior: reserve an `Order` from current `Cart`; compute totals; create `Payment` record.
  - Response (COD): order summary + COD confirmation instructions.
  - Response (Stripe): payment URL/intent data for redirect.
- `POST /checkout/confirm`
  - COD: confirm order (status `confirmed`), enqueue follow-up; Stripe uses webhook instead.
- `POST /payments/stripe/webhook`
  - Verify signature using `STRIPE_WEBHOOK_SECRET` with raw body; handle succeeded/failed/canceled events idempotently.
- `GET /orders/:id`
  - Minimal getter for QA to verify state after payment.

## Data Model (Prisma)
- `Address`: name, phone, line1/line2, city, region, country, postalCode.
- `Order`: id, customerId, conversationId, cartId, addressId?, currency, subtotalMinor, taxMinor, shippingMinor, totalMinor, status (`pending|pending_cod|confirmed|paid|canceled|failed`), paymentState, externalPaymentId?, metadata Json, timestamps.
- `OrderItem`: orderId, productId?, sku, nameSnapshot, priceSnapshotMinor, qty, lineTotalMinor.
- `Payment`: orderId, provider (`stripe|cod`), intentId (unique), status (`requires_action|processing|succeeded|failed|canceled`), amountMinor, currency, attempts, lastError?.

## WhatsApp Flows
- Collect address (structured prompts with validation); allow notes.
- Choice: COD vs Stripe; on Stripe, send payment link; on COD, confirm and provide summary.
- Final confirmation message after webhook/confirm, with order id and next steps.

## Validation & Security
- Use `ValidationPipe` for DTOs; enforce required address fields.
- Stripe signature verification against raw body; fail closed on mismatch.
- Idempotency via header key scoped to customer/cart; deduplicate order/payment creation.

## Observability
- Request-id propagation; structured logs on checkout and webhooks.
- Metrics: checkout init count, webhook events, payment success rate.

## Testing & Acceptance
- Unit: totals calculation, idempotent init, DTO validation, signature verify.
- Integration: Stripe webhook event handling, state transitions, retry-safe processing.
- E2E: 
  - COD: browse → cart → checkout COD → order confirmed → WA message.
  - Stripe: browse → cart → checkout Stripe → pay test card → webhook → order paid → WA message.
- Acceptance:
  - Idempotent `POST /checkout/init` with same key does not duplicate orders.
  - Stripe test events update order/payment correctly.
  - No sensitive card data persisted; Stripe signature verified.
  - P95 checkout init < 250ms (excluding provider redirect).

## Test Scripts (PowerShell)
- `scripts/sprint5-acceptance.ps1` – runs all sprint 5 tests. Example:
  - `pwsh scripts/sprint5-acceptance.ps1 -ApiBase http://localhost:3001 -DoStripe`
- `scripts/sprint5-smoke.ps1` – quick COD smoke and optional Stripe URL check.
- `scripts/sprint5/test-cod-checkout.ps1` – focused COD flow.
- `scripts/sprint5/test-address-validation.ps1` – ensures DTO validation returns 400 for missing fields.
- `scripts/sprint5/test-stripe-init.ps1` – verifies Stripe checkout URL when configured.

## Risks & Mitigations
- Webhook delivery timing: idempotent processors, retries with backoff, DLQ on repeated failures.
- Misconfiguration of secrets: explicit startup checks; robust error logs with request-id.
- Free-tier resource limits: short timeouts, lean SQL, minimal payloads, caching where safe.

## Env Vars
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- (Existing) `DATABASE_URL`, `REDIS_URL`, `CORS_ORIGINS`, WhatsApp config

## Rollout
- Dev/staging first with Stripe test keys; enable COD behind a flag for early pilot; tag release `sprint-5-start` and `sprint-5-finished`.
