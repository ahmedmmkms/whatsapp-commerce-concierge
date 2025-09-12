# Sprint 8 Features - UI Polish & Ops Readiness

Date: 2025-09-?? (planned)
Owner: AMM
Status: Planned

## Scope
- Support page UX/i18n/accessibility polish; improve triage usability.
- WhatsApp templates refinement (AR/EN) and lightweight preview UI.
- Analytics and telemetry for support flows and WA intents.
- Acceptance scripts and docs to capture changes and rollout guidance.

## Deliverables
- Frontend
  - Internationalized support page with RTL layout, Arabic copy, better errors, loading/empty states.
  - Replace raw JSON with order summary cards; surface correlation ID (X-Request-ID).
  - Shared UI components (buttons, inputs); keyboard focus and ARIA labels.
- WhatsApp/CMS
  - Reviewed and updated templates: order_status, start_return, rma_instructions, human_handoff (AR/EN).
  - Web preview page (admin-protected) to call `/whatsapp/preview` with sample data.
- Analytics/Observability
  - Events for support lookup start/success/fail (with reason and requestId).
  - Dashboard notes for support success rate, time-to-first-reply, support→WA funnel.
- QA/Docs
  - `scripts/sprint8-smoke.ps1`, `scripts/sprint8-acceptance.ps1` including basic axe checks for /support.
  - `docs/sprint-8-features.md` (this file) and a support triage SOP with correlation ID guidance.

## Out of Scope
- New customer-facing features beyond support page and templates polish.
- Payment gateway additions or inventory integrations.

## Acceptance
- Support page
  - Arabic/English labels and content verified; RTL layout correct.
  - Lookup shows order summaries (id, date, status, total) and displays X-Request-ID.
  - Clear errors for 404/429/5xx with suggested next steps; keyboard/ARIA checks pass (axe no critical issues).
- Templates
  - AR/EN templates render with correct placeholders, punctuation, and line breaks in `/whatsapp/preview`.
  - Seed update/migration applied; no regressions in WA intents e2e.
- Analytics
  - Events emitted on support lookups; basic dashboard queries yield expected counts.
- Scripts/Docs
  - Sprint 8 smoke/acceptance scripts run and pass against staging.
  - Triage SOP available and referenced from backlog.

## Rollout
- Deploy during low-traffic window; verify support lookups, preview page, and template rendering.
- Tag releases `sprint-8-start` and `sprint-8-finished`.

