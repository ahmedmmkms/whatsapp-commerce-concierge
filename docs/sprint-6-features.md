# Sprint 6 Features - Orders, Returns, Basic CMS, Support Page

Date: 2025-10-??
Owner: AMM

## Scope
- Orders and returns user flows exposed via API and WhatsApp.
- Lightweight CMS for operator quick replies/templates (AR/EN) with WA flow wiring.
- Minimal support web page to look up order status by phone + order ID.
- Keep hardening/UAT to Sprint 7 as per backlog.

## Out of Scope
- Load/perf testing, circuit breakers, PDPL workflows (targeted for Sprint 7).
- Advanced CMS UI/RBAC; rich content management.

## API Endpoints
- Orders
  - `GET /orders/:id`
    - Support-safe read; redacted PII; includes status and items snapshot.
  - `GET /orders?phone=E164`
    - Rate-limited; returns recent orders summary for the phone.
- Returns
  - `POST /returns`
    - Inputs: orderId, items (optional), reason, notes.
    - Validates eligibility (time window, single open return), creates RMA id.
  - `GET /returns/:id`
  - `GET /returns?orderId=...`
- CMS Templates
  - `GET /cms/templates`
  - `POST /cms/templates` (simple admin token)
  - `PUT /cms/templates/:id`, `DELETE /cms/templates/:id`

## Data Model (Prisma)
- Return: id, orderId, status (`requested|approved|rejected|in_transit|received|refunded`), reason, notes, rmaCode, timestamps, audit.
- ReturnItem: returnId, orderItemId?, sku, qty.
- OrderEvent: orderId, type (status_changed|note|webhook), payload Json, createdAt.
- Template: key, locale (`ar|en`), channel (`wa|web`), body, variables Json, isActive, updatedBy, updatedAt.

## WhatsApp Flows
- Intents/keywords: status, return, agent (AR/EN equivalents).
- Status flow: prompt for order id if missing; reply with template and order summary.
- Returns flow: reason capture, eligibility check, generate RMA; send guidance template.
- Human handoff: on keyword, mark conversation and stop bot replies.

## Validation & Security
- DTOs validated via ValidationPipe; enforce phone format (E.164) and required fields.
- Redaction for support responses (no addresses or full names where not needed).
- Rate limits: order lookups by phone and returns creation per phone/order.
- Simple admin token for CMS write operations.

## Observability
- Metrics: orders_by_status, returns_by_status, returns_rejected_count, template_resolve_failures.
- Logs: intent matches, template key/locale chosen, rate-limit hits, RMA creation.

## Testing & Acceptance
- Unit
  - Template resolution and locale fallback.
  - Returns eligibility rules and DTO validation.
  - Redaction logic for order lookups.
- Integration
  - Orders and Returns endpoints with DB migrations.
  - WA flow handlers use templates and produce expected messages.
- E2E
  - Order lookup via WA and web support page produces matching summaries.
  - Create return for eligible order; transition to approved/rejected.

## Test Scripts (PowerShell)
- `scripts/sprint6-acceptance.ps1` – runs smoke + focused tests for orders lookup, returns creation, and CMS templates.
- `scripts/sprint6-smoke.ps1` – creates a quick COD order then validates lookup and (if present) returns creation endpoint behavior.

## Rollout
- Dev/staging first; enable returns behind a feature flag if needed.
- Seed core AR/EN templates (order_status, start_return, rma_instructions, human_handoff).
- Tag releases `sprint-6-start` and `sprint-6-finished`.

## Changelog Additions (expected)
- Endpoints: Orders lookup by id/phone; Returns create/status; CMS templates CRUD.
- Data model: Return, ReturnItem, OrderEvent, Template.

