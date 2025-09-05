# Sprint 0 Runbook

Author: AMM

Goals
- CI/CD (PR checks, main deploys)
- Dockerized API/Web + Postgres/Redis
- API skeleton (WhatsApp + Stripe webhooks, health, Swagger)
- Web skeleton (Next.js + shadcn/ui + RTL)
- Env templates and local compose

Prereqs
- Node 20, pnpm, Docker Desktop, Git

Local Setup
1) Install deps: `pnpm i`
2) Copy envs:
   - `cp packages/api/.env.example packages/api/.env`
   - `cp packages/web/.env.example packages/web/.env`
3) Start local stack: `docker compose -f infra/docker-compose.yml up --build`

CI/CD
- GitHub Actions: `.github/workflows/ci.yml` runs lint/test/build on PR/main.
- Deploy: `.github/workflows/deploy.yml` triggers Render (API) via deploy hook; Vercel handles web via GitHub integration.
- Required GitHub secrets:
  - `RENDER_DEPLOY_HOOK_API` (Render deploy hook URL for API)
  - Optional: `SENTRY_AUTH_TOKEN` if uploading sourcemaps

Hosting (free tiers)
- API: Render Web Service (Dockerfile), autosleep on
- Web: Vercel
- DB: Neon (Postgres)
- Cache/Queue: Upstash Redis

WhatsApp Cloud API
- Create Meta dev app → Add WhatsApp → test number.
- Set `WHATSAPP_VERIFY_TOKEN`, `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_ID` in API env.
- Verify webhook: GET `https://<api>/webhook/whatsapp`.

Stripe
- Create test account.
- Set `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` in API env.
- Point webhook to `https://<api>/payments/stripe/webhook`.

Commands
- Build all: `pnpm build`
- Dev all: `pnpm dev`
- Lint all: `pnpm lint`
- Test all: `pnpm test`

Next Steps (post Sprint 0)
- Implement catalog sync, cart, checkout flow.
- Add migrations and seed scripts.
- E2E via Playwright (key flows), RTL/i18n checks.

