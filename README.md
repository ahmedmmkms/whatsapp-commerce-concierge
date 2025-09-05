# WhatsApp Commerce Concierge (P1)

Author: AMM

Sprint 0 scaffolding for a WhatsApp-first conversational commerce MVP.

Key components:
- packages/api: NestJS API (WhatsApp + Stripe webhooks, health, OpenAPI)
- packages/web: Next.js 14 web (shadcn/ui, Tailwind, RTL)
- infra: Docker Compose for local (Postgres, Redis, API, Web)
- .github/workflows: CI (lint/test/build) and deploy hooks

See docs/sprint-0-runbook.md for setup and deployment.

