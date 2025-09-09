# Neon Setup Guide (Postgres for Production-First Testing)

Author: AMM

Why Neon
- Serverless Postgres with autosuspend: cost-efficient for pilots.
- Pooled connections work well with Vercel serverless.
- Branching for staging vs prod.

Prereqs
- GitHub repo admin rights (to add secrets)
- Vercel projects created for API and Web
- Local: Node 20, pnpm

1) Create Neon Project
- Sign up at neon.tech and create a project in a region close to Vercel API (e.g., us-east).
- Neon creates a default database and roles: `neondb` (db), `neondb_owner`, `neondb_readonly`.

2) Prefer the Pooler (Serverless Friendly)
- In the Neon console, copy the pooled (PgBouncer) connection string (often labeled "Pooling connection string").
- SSL: ensure it contains `sslmode=require`.

3) Runtime vs Migration Credentials
- Easiest start: use the owner role for both runtime and CI migrations, then split later.
- Recommended split:
  - Runtime user (least privilege): `app_user`
  - Migration user (owner privileges): use `neondb_owner` (or a dedicated migrator role)

Create runtime user (via Neon SQL editor or psql):
```
-- Create limited user for the app
CREATE ROLE app_user LOGIN PASSWORD '<strong-random-password>';
GRANT CONNECT ON DATABASE neondb TO app_user;
GRANT USAGE ON SCHEMA public TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public TO app_user;
-- Ensure future tables/sequences inherit privileges
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT, UPDATE ON SEQUENCES TO app_user;
```

4) Prisma Connection String (Pooler + Serverless)
- Use the pooled URL and add Prisma + PgBouncer hints:
```
postgresql://USER:PASSWORD@HOST:PORT/DB?sslmode=require&pgbouncer=true&connection_limit=1&pool_timeout=5
```
- Example for runtime (Vercel API):
```
DATABASE_URL=postgresql://app_user:...@<pooler-host>:5432/neondb?sslmode=require&pgbouncer=true&connection_limit=1&pool_timeout=5
```
- Example for CI migrations (GitHub secret): use owner credentials on the pooler connection.

5) Configure Environments
- GitHub (CI for migrations): Settings → Secrets and variables → Actions → New repository secret
  - Name: `DATABASE_URL`
  - Value: pooled connection string (owner credentials)
- Vercel (API project): Settings → Environment Variables
  - Key: `DATABASE_URL`
  - Value: pooled connection string (app_user credentials)

6) First Schema Deploy
- Generate Prisma client locally (optional):
  - `pnpm -C packages/api prisma:generate`
- Commit Prisma schema if not yet:
  - `packages/api/prisma/schema.prisma`
- Create and commit initial migration (recommended for ongoing work):
  - Locally set `DATABASE_URL` to a Neon dev branch URL (see next section)
  - `pnpm -C packages/api prisma migrate dev --name init`
  - Commit the new `packages/api/prisma/migrations` directory
- CI will deploy on push to `main` or tags via `.github/workflows/db-deploy.yml`:
  - If migrations exist → `prisma migrate deploy`
  - Else (bootstrap) → `prisma db push`

7) Branching (Staging/Dev)
- In Neon, create a branch (e.g., `staging`) from `main`. Copy its pooled URL.
- Use the staging URL for preview deployments or for local migration creation.
- You can promote branches in Neon if needed.

8) Backups/Restore
- Neon supports point-in-time restore and branch-based snapshots depending on plan.
- For MVP, rely on branch snapshots. For production, enable PITR and scheduled backups.

9) Troubleshooting
- Prisma P1001 (can’t reach DB): ensure `sslmode=require`, correct host/port (pooler), and Neon project is active.
- Auth failed: check user/password and that you’re targeting the correct branch/database.
- Long-lived connections on serverless: always use the pooler; include `pgbouncer=true&connection_limit=1`.
- Migrations failing in CI: verify `DATABASE_URL` secret points to owner credentials and the pooled URL.

10) Quick Commands
- Validate DB URL from shell:
```
psql "postgresql://USER:PASSWORD@HOST:5432/neondb?sslmode=require"
```
- Apply migrations locally to dev branch:
```
set DATABASE_URL=postgresql://...dev-branch... 
pnpm -C packages/api prisma migrate dev --name <change>
```

References
- Prisma + PgBouncer: https://www.prisma.io/docs/guides/performance-and-optimization/connection-management
- Neon Pooler: https://neon.tech/docs/connect/connecting-pooler

