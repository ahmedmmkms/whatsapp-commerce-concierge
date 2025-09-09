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



No Docker: Production-First Test
- API on Vercel (serverless): The repo includes packages/api/api/[[...slug]].ts and packages/api/vercel.json for Node serverless. Create a Vercel project with root packages/api.
  - Env (API): WHATSAPP_VERIFY_TOKEN, WHATSAPP_APP_SECRET, WHATSAPP_TOKEN, WHATSAPP_PHONE_ID, DATABASE_URL (Neon), REDIS_URL (Upstash), CORS_ORIGINS (your web domain), STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET.
  - After linking, Deployment URL will be like https://<api-project>.vercel.app.
- Web on Vercel: Create a Vercel project with root packages/web.
  - Env (Web): NEXT_PUBLIC_API_BASE_URL=https://<api-project>.vercel.app (or keep rewrites in 
ext.config.js if proxying).
- Database (Neon): Create a Neon project; copy pooled postgres://... to API DATABASE_URL. Run migrations from your laptop:
  - pnpm -C packages/api prisma:generate
  - DATABASE_URL="postgres://..." pnpm -C packages/api prisma:migrate:deploy (or db:push for initial tables)
  - For connection tips and role split, see docs/neon-setup.md
- Redis (Upstash): Create a Upstash Redis database. Set REDIS_URL in API env.
- WhatsApp webhook (Meta): Point webhook to https://<api-project>.vercel.app/webhook/whatsapp.
  - Set the verify token in Meta to match WHATSAPP_VERIFY_TOKEN.
  - Optional signature validation: set WHATSAPP_APP_SECRET to enable HMAC check.
- Quick checks:
  - Health: GET https://<api-project>.vercel.app/healthz
  - Queue health: GET https://<api-project>.vercel.app/queue/health
  - Webhook verify: Visit https://<api-project>.vercel.app/webhook/whatsapp?hub.mode=subscribe&hub.verify_token=<token>&hub.challenge=123

Notes
- CORS: Keep CORS_ORIGINS limited to the web domain(s). For direct production tests, set it to your Vercel web URL.
- Logging: Webhook POST logs only message counts (no payload) and includes request IDs.
- Rate limiting: Basic throttling is enabled at the API layer. Adjust in AppModule if needed.
