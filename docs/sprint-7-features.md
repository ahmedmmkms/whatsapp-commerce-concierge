# Sprint 7 Features - Hardening, UAT, Pilot Go-Live

Date: 2025-10-?? (planned)
Owner: AMM
Status: Planned

## Scope
- Performance/load testing and tuning for pilot traffic; meet P95 targets.
- Reliability hardening: timeouts, retries/backoff, circuit breakers, DLQs, backups.
- Compliance (PDPL): export/delete data flows with audit; privacy notices.
- UAT and pilot: checklist pass, feature-flagged rollout, rollback tested.
- Ops/docs: dashboards, alerts, runbooks/playbooks; finalize OpenAPI.

## Out of Scope
- New customer-facing features beyond necessary support-page robustness.
- Advanced analytics UI; only essential dashboards for pilot readiness.

## Performance & Reliability
- Load Tests
  - Tools: k6 or Artillery. Routes: `/webhook/whatsapp`, `/products`, `/cart/*`, `/checkout/init`, `/orders/*`.
  - Targets: P95 product/cart ≤ 200ms; checkout init ≤ 250ms; error rate < 1% at target RPS.
- DB/Cache
  - Index review: orders by phone, returns by orderId; add migrations.
  - Redis policy: TTLs for catalog and idempotency; warm keys as needed.
  - Env: `CACHE_TTL_PRODUCTS_SEC`, `CACHE_TTL_CATEGORIES_SEC` to tune cache durations.
- Resilience
  - Timeouts, retries with exponential backoff on external I/O (Stripe, DB, Redis, webhooks).
  - Circuit breakers for Stripe and WhatsApp outbound; graceful fallbacks and operator visibility.
  - BullMQ DLQs and retry policies; alerts on DLQ size and recurring failures.
- Backups/Restore
  - Neon logical backups; Upstash snapshots; drill with documented RPO/RTO.

## Dashboards & Alerts
- Metrics endpoint: `GET /health/metrics` exposes route counts and p95 approximation.
- Queue DLQ: `GET /queue/dlq/stats`; admin actions `POST /queue/dlq/requeue`, `POST /queue/mirror-failed-to-dlq`.
- Alert hooks (scriptable): add CI job to call metrics endpoints and fail on thresholds.

## Compliance (PDPL)
- Export
  - Admin-only request (token-protected) to generate export package per customer.
  - MVP: returns inline JSON payload; future: signed, expiring URL.
  - Contents: conversation, customer profile, orders, returns, consents, and relevant events.
- Delete/Redact
  - Planned: Request triggers soft-delete and background redaction of PII, with audit trail.
  - MVP endpoint returns 202 with not_implemented until schema/workflow added.
- Consent/Privacy
  - Verify consent log completeness; add export/read APIs as needed.
  - Privacy notices exposed on web and referenced in WA templates.

## Ops & Observability
- Dashboards: SLA, P95 per route, and funnel events (view → cart → checkout → pay).
- Alerts: 5xx rate, webhook failures (Stripe/WA), DLQ growth, Stripe signature verification failures.
- Runbooks: incident handling for webhook outages, payment callback failures, DLQ surges, and rollback.
- OpenAPI: ensure new/admin endpoints are documented with examples.

## Testing & Acceptance
- Performance
  - Load tests meet thresholds; steady resource usage without hot spots.
- Reliability
  - Circuit breakers trip and recover under induced failures; no user-visible crash.
  - DLQs capture persistent failures; alert fires; documented resolution path validated.
- Compliance
  - PDPL export returns correct, complete dataset (MVP inline JSON acceptable).
  - Delete/redaction planned; interim endpoint returns not_implemented (tracked).
- UAT/Pilot
  - UAT checklist PASS with evidence (AR/EN). Feature flags isolate pilot cohort. Rollback validated.
- Scripts
  - `scripts/sprint7-smoke.ps1` runs health/perf sanity and optional compliance checks (non-fatal if unimplemented).
  - `scripts/sprint7-acceptance.ps1` aggregates smoke and targeted verifications.
  - `scripts/sprint7/test-perf-thresholds.ps1` asserts basic P95 limits.
  - Load: `scripts/load/k6-baseline.js` and `scripts/load/artillery-browse-checkout.yml` for realistic profiles.

## Rollout
- Stage first; monitor dashboards and alerts; enable pilot via feature flags.
- Tag releases `sprint-7-start` and `sprint-7-finished`.

## Notes
- Reuse `ADMIN_TOKEN` header for admin-only endpoints.
- Keep all changes documented in DeveloperLog and link evidence of UAT and load results.
