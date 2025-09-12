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
  - k6/Artillery load tests for `/webhook/whatsapp`, `/products`, `/cart/*`, `/checkout/init`, `/orders/*` with thresholds.
  - DB indexes review (e.g., orders by phone, returns by orderId) and migrations.
  - Redis cache policy: TTLs for catalog/product and idempotency windows; config toggles.
  - Perf budgets: enforce P95 targets in CI smoke.
- [Sprint 7] Reliability hardening
  - Timeouts, retries/backoff on external I/O (Stripe, DB, Redis, webhooks).
  - Circuit breakers for Stripe and WhatsApp outbound with graceful degradation.
  - BullMQ DLQs with retry policies and alerting; operational dashboards.
  - Backups + restore drill (Neon logical backup, Upstash snapshot); document RPO/RTO.
- [Sprint 7] Compliance (PDPL)
  - Data export job + signed, expiring download link; audit entries.
  - Delete/redaction workflow (soft-delete + background redaction) with audit.
  - Consent logs review and export for audit; privacy notices (web + WA templates).
- [Sprint 7] UAT & Pilot
  - UAT checklist and evidence; Arabic/English end-to-end cases.
  - Feature flags for pilot cohort; rollback test to previous tag.
  - WhatsApp number migration playbook (senders, templates, verification, fallback).
- [Sprint 7] Ops & Docs
  - Dashboards: SLA, P95 per route, and funnel (view → cart → checkout → pay).
  - Alerts for 5xx spikes, webhook failures, DLQ growth, Stripe signature failures.
  - OpenAPI finalize with examples; support SOP and incident runbooks.
- [Sprint 7] Support page robustness
  - Better error states, i18n messages, and correlation ID display for support triage.
- [Sprint 7] Scripts
  - Add `scripts/sprint7-smoke.ps1` and `scripts/sprint7-acceptance.ps1` (aggregate perf/compliance checks).

## Sprint 8
- [Sprint 8] Support page polish (frontend, i18n, accessibility)
  - Internationalize labels/messages; Arabic copy review; enforce RTL form layout.
  - Replace raw JSON with order summary cards; show correlation ID (X-Request-ID) on result/error.
  - Better errors for 404/429/5xx; include throttling/captcha hints; loading and empty states.
  - Use shared UI components; keyboard focus styles and ARIA; axe pass.
- [Sprint 8] WhatsApp templates polish + preview (whatsapp, cms, i18n)
  - Review/update AR/EN templates for 'order_status', 'start_return', 'rma_instructions', 'human_handoff' (punctuation, line breaks, placeholders).
  - Add web preview page (admin-protected) to exercise `/whatsapp/preview` by key/locale with sample data.
  - Seed updated templates; migration to adjust texts safely.
- [Sprint 8] Analytics & telemetry (analytics, observability)
  - Track support lookup events (start/success/fail) with reason and requestId; WA intent events from preview.
  - Dashboard additions: support success rate, time-to-first-reply, funnel from support to WA chat.
- [Sprint 8] QA scripts and acceptance (qa, scripts)
  - Add `scripts/sprint8-smoke.ps1` and `scripts/sprint8-acceptance.ps1`; include axe accessibility checks for /support.
  - Update `scripts/acceptance-all.ps1` to include Sprint 8.
- [Sprint 8] Docs & Ops (docs, ops)
  - `docs/sprint-8-features.md` with scope, acceptance, and rollout notes.
  - Support triage SOP: correlation ID usage, known errors, and customer messaging templates.

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
