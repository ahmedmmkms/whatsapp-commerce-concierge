# Backlog – Revised (Web Frontend as Sprint 4)

## Sprint 1
- [Sprint 1] WhatsApp webhook verify + message ingest
  - GET verify, POST ingest; basic logging/ack.
- [Sprint 1] Choose ORM + migrations + seeds
  - Decide between Prisma/TypeORM; create initial schema and seed.
- [Sprint 1] Redis + BullMQ wiring
  - Queue module; health endpoint.
- [Sprint 1] PDPL consent capture
  - Consent endpoint + storage; per-phone.
- [Sprint 1] Observability baseline
  - Request IDs, logging interceptor, Sentry placeholder.

## Sprint 2
- [Sprint 2] Catalog ingestion job
  - Seed demo categories/products; nightly sync placeholder.
- [Sprint 2] Product query API
  - `/products` list + `/products/:id` detail; pagination/search.
- [Sprint 2] WA browse intents (AR/EN)
  - Categories, product details, quick replies.
- [Sprint 2] Web preview for QA
  - Minimal product page; RTL baseline.

## Sprint 3
- [Sprint 3] Cart service + endpoints
  - `/cart/*` create/add/update/remove/view; idempotency; tests.
- [Sprint 3] WA cart flows
  - Add/view/update/remove; shipping estimate stub.
- [Sprint 3] Pricing/currency handling
  - Tax/shipping placeholders; currency utils.

## Sprint 4
- [Sprint 4] Web frontend MVP (AR/EN + RTL)
  - Home, categories, product list/detail; client search/filters; WA deeplinks; analytics events.

## Sprint 5
- [Sprint 5] Payments abstraction + COD
  - Checkout init/confirm; order reserve; COD path.
- [Sprint 5] Stripe adapter + webhook
  - Payment link/handoff; signature verification; retries/idempotency.
- [Sprint 5] Address capture dialog
  - Validate + store address; order notes.

## Sprint 6
- [Sprint 6] Orders API
  - `GET /orders/:id` (support-safe, redacted PII); include items snapshot and status.
  - `GET /orders?phone=E164` (rate-limited) returns recent orders summary.
  - Order timeline events (status_changed, webhook) persisted for audit.
  - Emit/order status events on COD confirm and Stripe webhook transitions.
- [Sprint 6] Returns API + flow
  - Models: Return, ReturnItem; statuses `requested|approved|rejected|in_transit|received|refunded`.
  - `POST /returns` with eligibility checks (window, one-open-return rule); generate RMA.
  - `GET /returns/:id`, `GET /returns?orderId=...` for status queries.
  - Guardrails: rate-limit by phone/order; basic abuse mitigation.
- [Sprint 6] Basic CMS (quick replies/templates)
  - CRUD minimal Template model (key, locale, channel, body, variables, isActive).
  - Seed AR/EN templates: order_status, start_return, rma_instructions, human_handoff.
  - Resolve templates in WA flows with variable interpolation + locale fallback.
- [Sprint 6] Support web page (order lookup)
  - Next.js route `/support/order-lookup` (phone + orderId); calls Orders API.
  - Anti-enumeration: simple throttling/captcha; handle API errors gracefully.
- [Sprint 6] Tests/Docs/Obs (lightweight)
  - Update OpenAPI for new endpoints; add acceptance scripts under `scripts/`.
  - Metrics: orders_by_status, returns_by_status; logs for template/intent/rate-limit.
  - Docs: `docs/sprint-6-features.md`; runbook notes for returns eligibility + templates.

## Sprint 7
- [Sprint 7] Perf/load testing and tuning
  - Indexes, cache TTLs, P95 targets.
- [Sprint 7] Reliability hardening
  - Circuit breakers, retries/backoff, DLQs, backups.
- [Sprint 7] Compliance + UAT + pilot
  - PDPL workflows, privacy notices, UAT checklist pass.

## Sprint 8
- [Sprint 8] UI Polish (Support + WA templates)
  - Support page UX polish: RTL labels, Arabic copy, accessibility pass.
  - Visual tweaks and readability for template-driven messages (AR/EN).
  - Minor styling consistency across web pages (buttons, spacing, states).

---
## Bootstrap to GitHub
Requires: Personal Access Token with repo scope in `GITHUB_TOKEN`.

Dry run (offline, no API calls):
`pwsh scripts/bootstrap-github-work-items.ps1 -DryRun -Offline -OnlySprint 5 -Owner you -Repo yourrepo`

Create milestones/issues (start date optional):
`pwsh scripts/bootstrap-github-work-items.ps1 -StartDate 2025-09-15`

The script infers `owner/repo` from `git remote origin`. Override with:
`pwsh scripts/bootstrap-github-work-items.ps1 -Owner yourname -Repo yourrepo`

Labels
- The bootstrap script auto-creates common labels (backend, frontend, infra, qa, docs, whatsapp, catalog, cart, checkout, payments, orders, returns, cms, observability, performance, security, i18n) and applies them to issues based on keywords in the title/body.

Windows PowerShell (no pwsh)
- Set token: `$env:GITHUB_TOKEN = '<YOUR_PAT_WITH_repo_scope>'`
- One-shot run: `powershell -NoProfile -ExecutionPolicy Bypass -File scripts\bootstrap-github-work-items.ps1 -DryRun -Offline -OnlySprint 5 -Owner you -Repo yourrepo`
- Or run in session: `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass; .\scripts\bootstrap-github-work-items.ps1 -DryRun -Offline -OnlySprint 5 -Owner you -Repo yourrepo`
