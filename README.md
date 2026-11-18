# WhatsApp Commerce Concierge — Bilingual Commerce on WhatsApp + Web

An independent MVP that lets shoppers browse, order, track and return products through WhatsApp or a web storefront, in Arabic or English, with one backend behind both.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10-E0234E)](https://nestjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748)](https://prisma.io)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black)](https://vercel.com)
[![License](https://img.shields.io/github/license/ahmedmmkms/whatsapp-commerce-concierge)](LICENSE)

 - Live Demo (Web): <https://whatsapp-commerce-concierge-web.vercel.app>
 - API (Swagger): <https://whatsapp-commerce-concierge-api.vercel.app/docs>

## Product Brief

_Status: independent MVP with a live demo. Not yet used by real customers; the problem and metrics below are assumptions a pilot would test._

**Problem.** Many shoppers in the region would rather ask and order over WhatsApp than fill in a web form, but small merchants handle those chats by hand, so orders, returns and support requests get lost in message threads.

**Who it's for.** Arabic- and English-speaking shoppers of an electronics store, and the store staff who handle orders, returns and support.

**Key decisions and trade-offs**
- **One backend for WhatsApp and web.** A chat can hand off to the web cart and checkout instead of rebuilding checkout inside WhatsApp. Trade-off: two front doors to design and test.
- **Arabic-first with RTL from day one.** More design work up front, but no costly retrofit later.
- **Cash on delivery next to card payments** (Stripe, test mode), because the target market can't be assumed to pay by card.
- **Privacy built into the MVP.** PDPL-aware data export and deletion ship with the first release instead of after launch.
- **Scripted acceptance per sprint.** Each sprint closed only when its acceptance script passed.

**Deliberately out of scope:** live payments, multiple merchants, and AI recommendations.

**What a pilot would measure:** chat-to-order conversion, share of orders started in WhatsApp vs. web, drop-off at the chat-to-checkout handoff, and time to resolve a return or support request.

## Screenshots

Below are representative desktop screenshots (PNG) from `site_screens/`.

<p>
  <strong>Home (Desktop)</strong><br/>
  <img src="site_screens/whatsapp-commerce-concierge-web.vercel.app__desktop.png" alt="Home desktop" width="960" />
</p>

<p>
  <strong>Products (Desktop)</strong><br/>
  <img src="site_screens/whatsapp-commerce-concierge-web.vercel.app_products__desktop.png" alt="Products desktop" width="960" />
</p>

<p>
  <strong>Product Detail (Desktop)</strong><br/>
  <img src="site_screens/whatsapp-commerce-concierge-web.vercel.app_products_d80decea-0ad2-4c43-8892-8ec1509e0335__desktop.png" alt="Product detail desktop" width="960" />
</p>

<p>
  <strong>Cart (Desktop)</strong><br/>
  <img src="site_screens/whatsapp-commerce-concierge-web.vercel.app_cart__desktop.png" alt="Cart desktop" width="960" />
</p>

## Table of Contents

- Why This Matters
- Feature Highlights
- Tech Stack at a Glance
- Architecture Overview
- Directory Structure
- Requirements & Prerequisites
- Quickstart (TL;DR)
- Configuration & Scripts
- API / Routes
- Data Model
- Quality, Testing & Coverage
- Performance & DX
- Security & Privacy
- Accessibility & i18n
- CI/CD & Deployment
- Roadmap
- License
- About the Author / Work With Me

---

## Why It Matters

- Conversational commerce with WhatsApp + Web to accelerate conversion.
- WCAG‑friendly, bilingual (AR/EN) UX with RTL support — built for MENA audiences.
- APIs designed with idempotency, rate limits, and observability from the start.
- PDPL‑aware data export/delete flows and audit trails.
- Cloud‑native deployment (Vercel/Neon/Upstash) with CI/CD and infra scripts.
- Fast by default: caching, SSR, API budgets, and perf/load testing hooks.

## Feature Highlights

- 🟢 WhatsApp Cloud API webhook: signature verification, intents (browse, cart, status, returns, agent), operator preview UI.
- 🛒 Web storefront: products, filters, detail pages, cart, checkout (COD/Stripe), orders/returns lookup for support.
- 🧱 CMS-lite for WhatsApp templates (AR/EN) with admin token guard.
- 📦 Orders & Returns APIs (Prisma), RMA, eligibility rules, audit events.
- 🔐 Compliance (PDPL) endpoints for export/delete with `ComplianceAudit`.
- 📈 Analytics hooks (dataLayer) + acceptance scripts across sprints.
- 🌍 i18n with RTL toggle; Arabic-first visuals; accessible components.
- 🧰 DevEx & Ops: Swagger, health/metrics, Redis cache, BullMQ skeleton, serverless adapter for Vercel, Docker compose for local DB/Redis.

## Tech Stack at a Glance

| Area | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), React, TypeScript, TailwindCSS |
| Backend | NestJS, TypeScript, Express (serverless-adapted) |
| Data/ORM | Prisma, PostgreSQL (Neon recommended) |
| Messaging/Queues | BullMQ + Redis (Upstash recommended) |
| Payments | Stripe (test) + COD (abstraction in Checkout service) |
| Caching | Redis wrapper with TTLs and idempotency keys |
| Testing | Jest (unit), acceptance scripts (PowerShell), load (k6/Artillery placeholders) |
| Infra/Deploy | Vercel (API/Web), Dockerfiles, docker-compose for local |
| CI/CD | GitHub Actions (build/test), Prisma DB deploy, PR hygiene checks |
| Observability | Sentry placeholders, request/trace logging, metrics endpoint |
| i18n & RTL | Custom provider (AR/EN core) |
| Security | CORS, rate limiting, admin token guard, HMAC webhook signatures |

## Architecture Overview

Monorepo with clear separation of concerns:

- `packages/web`: Next.js app (App Router) — UI, SSR fetchers, i18n/RTL, design system.
- `packages/api`: NestJS services — controllers → services → Prisma repos; serverless adapter for Vercel.

The backend follows a layered approach (controllers, services, modules) with Prisma for data, Redis for caching/idempotency, and integrations (WhatsApp/Stripe). The web uses server components where appropriate and client components for interactions.

```mermaid
graph LR
  U["User (Web/WhatsApp)"] --> W["Next.js Web"]
  U --> H["WhatsApp Webhook"]
  W --> A["NestJS API"]
  H --> A
  A --> S["Services: Orders / Returns / Cart / Catalog / Checkout / CMS"]
  S --> P[("PostgreSQL · Prisma")]
  S --> R[("Redis · Cache/Queues")]
  S --> Stripe["Stripe"]
  S --> WACloud["WhatsApp Cloud"]
```

## Directory Structure

```
packages/
  web/                    # Next.js 14 web app (App Router)
    app/                  # Pages and routes
    components/           # UI + landing sections, i18n, theme
    styles/               # Tailwind CSS + theme variables
    next.config.js        # Rewrites /api → API URL
  api/                    # NestJS API (serverless)
    src/                  # Modules: catalog, cart, checkout, orders, returns, cms, compliance, whatsapp, health
    prisma/               # Schema + migrations
    api/[[...slug]].ts    # Vercel serverless adapter
  ...
scripts/                  # Acceptance & smoke scripts per sprint
docs/                     # Backlog, sprint notes, playbooks
infra/                    # Docker compose and DB seeds
```

## Requirements & Prerequisites

- Node.js 18+ (recommended LTS)
- pnpm (via Corepack): `corepack enable`
- PostgreSQL (Neon recommended) and Redis (Upstash recommended) for prod
- Vercel accounts (separate projects for API and Web)

### .env.example (sanitized)

API (packages/api):
- DATABASE_URL=postgres://user:pass@host:5432/db
- REDIS_URL=rediss://:pass@host:6379
- CORS_ORIGINS=http://localhost:3000,https://your-web.vercel.app
- ADMIN_TOKEN=change-me
- RETURNS_ELIGIBLE_DAYS=30
- STRIPE_SECRET_KEY=sk_test_...
- CHECKOUT_SUCCESS_URL=https://your-web.vercel.app/orders/{ORDER_ID}
- CHECKOUT_CANCEL_URL=https://your-web.vercel.app/checkout?cancel=1
- SENTRY_DSN=
- WA_VERIFY_TOKEN=change-me (if needed)
- WA_APP_SECRET=change-me (for HMAC verification)

Web (packages/web):
- NEXT_PUBLIC_API_URL=https://your-api.vercel.app
- NEXT_PUBLIC_API_BASE_URL=https://your-api.vercel.app
- NEXT_PUBLIC_WA_NUMBER=9715XXXXXXXX
- NEXT_PUBLIC_RTL=0
- NEXT_PUBLIC_ADMIN_PREVIEW_TOKEN=optional

## Quickstart (TL;DR)

Install
- corepack enable
- pnpm install

Dev (split terminals)
- API: cd packages/api && pnpm dev
- Web: cd packages/web && pnpm dev

Build all
- pnpm -r --parallel build

Run tests (where available)
- pnpm -r test

Local DB/Redis (optional)
- docker compose -f infra/docker-compose.yml up -d

Seed data
- cd packages/api && node scripts/seed-electronics.mjs

## Configuration & Scripts

Notable scripts (check each package.json for the full list):
- Root: `pnpm -r --parallel build`
- API:
  - `pnpm dev` — local NestJS server
  - `pnpm build` — tsc compile
  - `pnpm prisma migrate deploy` — run migrations
  - `node scripts/seed-electronics.mjs` — demo products
  - `node scripts/seed-templates.mjs` — WhatsApp templates
- Web:
  - `pnpm dev` — Next.js dev server
  - `pnpm build` — production build
- Acceptance:
  - `pwsh scripts/acceptance-all.ps1 -ApiBase <API_URL>`
  - Sprint 8: `pwsh scripts/sprint8-acceptance.ps1 -ApiBase <API_URL> -WebBase <WEB_URL>`

## API / Routes

Public
- GET /healthz — liveness
- GET /products, GET /products/:id — catalog
- GET /categories — categories
- POST /cart/items, PATCH/DELETE /cart/items/:id, GET /cart — cart ops
- POST /checkout/init — create order (COD/Stripe)
- GET /orders/:id — order detail
- GET /orders?phone=E164 — redacted orders list by phone
- POST /returns — start a return; GET /returns/:id; GET /returns?orderId=…
- GET /whatsapp/preview — operator preview (text/lang)

Admin (x-admin-token)
- GET/POST/PUT/DELETE /cms/templates — WhatsApp templates CRUD
- GET /compliance/pdpl/status — PDPL capabilities
- POST /compliance/pdpl/export — PDPL export (inline JSON)
- POST /compliance/pdpl/delete — schedule redaction

WhatsApp Webhook
- GET/POST /webhook/whatsapp — verify + ingest (HMAC signature)

Docs
- Swagger at /docs (API project)

## Data Model (Prisma overview)

Highlights (not exhaustive):
- Catalog: Category, Product, ProductMedia
- Customers & Conversations: Customer, Conversation, Consent
- Cart & Orders: Cart, CartItem, Order, OrderItem, Payment, Address
- Returns: Return, ReturnItem
- CMS: Template (key/locale/channel/body/variables/isActive)
- Compliance: ComplianceAudit (action, status, subject, timestamps)

Migrations live in `packages/api/prisma/migrations`, applied via Prisma.

## Quality, Testing & Coverage

- Unit tests (Jest) around utilities (e.g., webhook signature).
- Acceptance scripts per sprint under `/scripts` (PowerShell).
- Load testing profiles (k6/Artillery) as placeholders.
- GitHub Actions run builds/tests and (optionally) DB deploy workflows.

## Performance & DX

- SSR (Next.js), minimal client JS for landing; lazy images below the fold.
- Redis caching with TTLs for products/categories; idempotency keys for cart ops.
- P95 budgets and acceptance hooks (Sprint 7).
- DeveloperLog and docs to capture decisions and keep handoffs smooth.

## Security & Privacy

- CORS allowlist; rate limiting via Nest’s Throttler.
- HMAC verification for WhatsApp signatures with rawBody preservation.
- Admin guards via `x-admin-token`.
- PDPL export/delete flows with auditing.

## Accessibility & i18n

- i18n provider (AR/EN), RTL toggle; Arabic-first content patterns.
- Keyboard navigable UI with visible focus states.
- Operator pages (WA preview, templates) keep semantics + aria labels.
- Optional Axe scans; can be re-enabled in acceptance as needed.

## CI/CD & Deployment

- GitHub Actions: CI (build/test), Prisma DB deploy, PR hygiene checks.
- Vercel: serverless API using `@vendia/serverless-express`, Web app via Next.js.
- Infra docs: Neon (Postgres) config guide; Upstash (Redis) notes; Dockerfiles for local.

## License

This project is licensed under the terms of the repository’s LICENSE. See [LICENSE](LICENSE).

## About

Built by **Ahmed Mahmoud Moustafa**, technical product manager and systems engineer, as part of an independent product portfolio. More case studies and projects: [github.com/ahmedmmkms](https://github.com/ahmedmmkms) · [LinkedIn](https://www.linkedin.com/in/ahmedmmkms/)

---

