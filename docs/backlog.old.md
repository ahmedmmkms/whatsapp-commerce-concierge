# Backlog — Issues by Sprint (Copy into GitHub)

## Sprint 1
- [Sprint 1] WhatsApp webhook verify + message ingest
  - Build `/webhook/whatsapp` GET verify + POST ingest; unit tests; fixtures.
- [Sprint 1] Choose ORM + migrations + seeds
  - Pick Prisma/TypeORM; add Conversation/Customer; migration workflow.
- [Sprint 1] Redis + BullMQ wiring
  - Queue module; retry/backoff defaults; health endpoint.
- [Sprint 1] PDPL consent capture
  - Consent model, storage, retrieval; audit trail; policy text.
- [Sprint 1] Observability baseline
  - Request logging, error handler, trace IDs; dashboard sketches.

## Sprint 2
- [Sprint 2] Catalog ingestion job
  - Ingest demo feed; nightly sync; seed fallback.
- [Sprint 2] Product query API
  - `/products` with search/filter/sort; Redis cache.
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
- [Sprint 4] Payments abstraction + COD
  - Checkout init/confirm; order reserve; COD path.
- [Sprint 4] Stripe adapter + webhook
  - Payment link/handoff; webhook verification; retries.
- [Sprint 4] Address capture dialog
  - Validate + store address; order notes.

## Sprint 5
- [Sprint 5] Orders API
  - `/orders/{id}` and by phone lookup; status events.
- [Sprint 5] Returns API + flow
  - `/returns` create/status; RMA guidance messages.
- [Sprint 5] Basic CMS for quick replies
  - CRUD simple templates; AR/EN content.
- [Sprint 5] Support web page (order lookup)
  - Minimal page for support team.

## Sprint 6
- [Sprint 6] Perf/load testing and tuning
  - Indexes, cache TTLs, P95 targets.
- [Sprint 6] Reliability hardening
  - Circuit breakers, retries/backoff, DLQs, backups.
- [Sprint 6] Compliance + UAT + pilot
  - PDPL workflows, privacy notices, UAT checklist pass.
---
## Bootstrap to GitHub
Requires: Personal Access Token with repo scope in `GITHUB_TOKEN`.

Dry run:
`pwsh scripts/bootstrap-github-work-items.ps1 -DryRun`

Create milestones/issues (start date optional):
`pwsh scripts/bootstrap-github-work-items.ps1 -StartDate 2025-09-15`

The script infers `owner/repo` from `git remote origin`. Override with:
`pwsh scripts/bootstrap-github-work-items.ps1 -Owner yourname -Repo yourrepo`

Labels
- The bootstrap script auto-creates common labels (backend, frontend, infra, qa, docs, whatsapp, catalog, cart, checkout, payments, orders, returns, cms, observability, performance, security, i18n) and applies them to issues based on keywords in the title/body.

Windows PowerShell (no pwsh)
- Set token: `$env:GITHUB_TOKEN = '<YOUR_PAT_WITH_repo_scope>'`
- One-shot run: `powershell -NoProfile -ExecutionPolicy Bypass -File scripts\bootstrap-github-work-items.ps1 -DryRun`
- Or run in session: `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass; .\scripts\bootstrap-github-work-items.ps1 -DryRun`
