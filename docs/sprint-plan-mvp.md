# MVP Sprint Plan � WhatsApp Commerce Concierge (P1)

Cadence: 2-week sprints, 6 total (12 weeks)
Team: PM, Tech Lead (Node), 1 FE, 1 BE, 1 QA, 0.5 DevOps
Environments: Local (Docker), Staging (Vercel/Neon/Upstash), Pilot
KPIs (from Sprint 2): Conversion, AOV, chat funnel drop?off, first?reply time
NFRs: PDPL consent, PCI-aware via gateway, 99.9% SLA, P95 API < 300ms
Risks: WA onboarding delays ? sandbox; payments risk ? COD + one provider; free-tier quotas

## Sprint 1 (Weeks 1�2): WA Webhook, Core Dialog, Foundations
Goals
- Stabilize WhatsApp webhook verify/ingest; lay base conversation loop.
- Stand up DB (Neon) + Redis (Upstash) + BullMQ; choose ORM and migrations.
- PDPL consent capture + audit trail; baseline observability.
Deliverables
- API: `/webhook/whatsapp` (verify + message ingest), improved `/healthz`.
- Data: Conversation, Customer models; migration pipeline; seeds.
- Infra: Redis/BullMQ configured; rate limiting; CORS tightened.
- Observability: request logging, trace IDs, error reporting, basic dashboards.
QA/Perf
- Unit tests for webhook verification; load test ~50 RPS P95 < 200ms.
- Security review of token handling and consent storage.

## Sprint 2 (Weeks 3�4): Catalog Sync + Browse
Goals
- Implement catalog ingestion and search; enable conversational browse in WA.
Deliverables
- API: catalog sync job, `/products` query.
- Data: Product model (SKU, price, stock, media), categories.
- WA flows: categories, product details, quick replies (Arabic/English).
- Web: Minimal product preview for internal QA; RTL baseline.
QA/Perf
- Playwright smoke for browse intents; stock/price consistency checks.
- P95 product lookup < 150ms (cached), warm Redis keys.

## Sprint 3 (Weeks 5�6): Conversational Cart
Goals
- Add cart creation/persistence and line-item ops via chat.
Deliverables
- API: `/cart/*` (create, add, update, remove, view), idempotency.
- Data: Cart, CartItem linked to Conversation/Customer.
- WA flows: add to cart, view cart, update qty, remove, shipping estimate stub.
- Pricing: tax/shipping placeholders; currency handling.
QA/Perf
- Unit/E2E for cart ops; concurrency tests; localized templates.
- P95 cart ops < 200ms; Redis caching for catalog.

## Sprint 4 (Weeks 7–8): Web Frontend MVP
Goals
- Deliver a polished, lightweight web front end to complement WA flows.
Deliverables
- Web: Home/landing, categories, product list/detail (media, specs), Arabic/English + RTL.
- Handoff: “Chat to Order” WhatsApp deeplinks with prefilled product context.
- Search/Filters: Client-side search and simple filters (category, price).
- Analytics: Events for product views and handoff clicks.
QA/Perf
- Lighthouse/Core Web Vitals pass; i18n/RTL verification; route load P95 < 200ms.

## Sprint 5 (Weeks 9–10): Checkout (COD + Stripe)
Goals
- Implement checkout with COD baseline and Stripe card (test).
Deliverables
- API: `/checkout` (init, confirm), payments abstraction; `/payments/stripe/webhook` hardened.
- Data: Order, Payment; idempotent order creation; address capture flow.
- WA flows: address/notes collection, payment handoff link (Stripe), COD confirmation.
- Compliance: PCI-aware (provider redirect), PDPL consent replay on checkout.
QA/Perf
- E2E browse → cart → checkout (COD and Stripe test); retry-safe payments.
- P95 checkout init < 250ms (excluding provider redirect).

## Sprint 6 (Weeks 11–12): Orders, Tracking, Returns, Basic CMS
Goals
- Expose order status, returns ticketing, and operator content controls.
Deliverables
- API: `/orders/{id}`, `/orders` (lookup by phone), `/returns` (create, status).
- Data: Return; status events; SLA timers; basic CMS for quick replies/templates.
- WA flows: order status, start return, RMA guidance, human handoff keyword.
- Web: Minimal order lookup page (phone + order ID) for support.
QA/Perf
- Playwright E2E for order status and returns; Arabic RTL content review.
- Ops runbooks and on-call alerts for failed jobs/webhooks.

## Sprint 7 (Weeks 13–14): Hardening, UAT, Pilot Go-Live
Goals
- Close NFRs, observability, and readiness; execute UAT and pilot.
Deliverables
- Perf: Load to projected traffic; DB indexes, Redis TTLs tuned.
- Reliability: Circuit breakers, retries/backoff, DLQs; backup/restore drills.
- Security/Compliance: PDPL data export/delete, consent logs, privacy notices; checklist sign-off.
- Ops: Dashboards (SLA, P95, funnel), alerts, runbooks; incident templates.
- Docs: API OpenAPI finalized; support SOP; WhatsApp number migration playbook.
QA/Acceptance
- UAT pass; rollback tested; pilot launch via feature flags.

## Cross-Cutting Threads (All Sprints)
- i18n/RTL: Arabic-first content and templates; date/number formats.
- Analytics: Funnel events (view product, add to cart, start checkout, pay). Dashboards for conversion and AOV.
- Accessibility: Message template readability; web pages WCAG AA where applicable.
- Documentation: Keep docs and DeveloperLog updated per PR.

## Post-MVP Backlog
- Add Tamara/Tabby/Mada adapters behind payment gateway.
- Product recommendations; upsell flows; inventory webhooks.
- SLA auto-remediation; improved NLP intents.
