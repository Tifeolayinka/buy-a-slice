# Environments & Configuration

Three environments, strictly separated. Development and preview must never hold
live Paystack credentials.

| | Development | Preview | Production |
| --- | --- | --- | --- |
| Frontend | `npm run dev` (localhost:3000) | Vercel preview deploys | Vercel production |
| Database | Neon (dev branch or shared dev DB) | Neon preview branch | Neon main branch |
| Paystack | test keys | test keys | live keys |
| Env source | `.env.local` (via `vercel env pull`) | Vercel dashboard | Vercel dashboard |

The database is **Neon Postgres**, provisioned through the Vercel Marketplace
integration (`vercel integration add neon`), which injects `DATABASE_URL`
(pooled, via PgBouncer) and `DATABASE_URL_UNPOOLED` (direct) into the linked
Vercel project. Application queries go through Drizzle ORM (`lib/db/index.ts`
— always use `getDb()`, never a module-scope client) against the **pooled**
URL. Schema pushes (`drizzle.config.ts`) use the **unpooled** URL — pooled
connections run in PgBouncer transaction mode, which doesn't support the
session-level operations DDL can need.

Neon supports database branching: use a branch per environment so preview
deploys and experiments never touch production data.

## Where each variable lives

| Variable | Location | Notes |
| --- | --- | --- |
| `DATABASE_URL` | Vercel env (all) → `.env.local` via `vercel env pull` | Pooled; used by the app at runtime |
| `DATABASE_URL_UNPOOLED` | Vercel env (all) → `.env.local` via `vercel env pull` | Direct; used only for schema pushes |
| `NEXT_PUBLIC_SITE_URL` | Vercel env | Canonical URL, used for metadata/OG |
| `PAYSTACK_PUBLIC_KEY` | Vercel env | Public checkout key (test vs live per env) |
| `PAYSTACK_SECRET_KEY` | Vercel env (server-only) | Used by server routes to initialize/verify transactions. Never in the client bundle |
| `MODERATION_SECRET` | Vercel env (server-only) | Protects `/moderate` and moderation actions |
| `EVENT_SLUG` | Vercel env | Which event record the app serves |

Set values with `vercel env add NAME` (interactive, value never echoed), then
`vercel env pull .env.local --yes` locally.

## First-time developer setup

1. `npm install`
2. `vercel link` (already linked in this repo) then `vercel env pull .env.local --yes`
3. `npx dotenv -e .env.local -- npx drizzle-kit push` — sync the schema (from M3 on)
4. `npm run dev`
5. Visit `/`, `/gift`, `/wall`, `/success`, `/moderate`, and `/design`
   (design-system specimen).

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Next.js dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript, no emit |
| `npm run test` | Vitest suite |
| `npx dotenv -e .env.local -- npx drizzle-kit push` | Push schema to the database |
| `npx dotenv -e .env.local -- npx drizzle-kit studio` | Browse data locally |

`drizzle-kit` and standalone scripts do **not** auto-load `.env.local` — only
Next.js does. Always run them through `dotenv -e .env.local --`.

## Rules

- Secrets never use the `NEXT_PUBLIC_` prefix.
- `vercel env pull` **overwrites** `.env.local`; keep personal overrides in
  `.env.development.local` instead.
- Preview and production use separate Neon branches and separate Paystack
  key pairs.
- `.env.local` is gitignored; only `.env.example` (names, no values) is
  committed.

## Real-time note

Convex was replaced with Neon Postgres (owner decision, 2026-08-14). The
Birthday Wall and live stats therefore use short-interval polling/SWR
revalidation instead of reactive subscriptions. Paystack webhook handling
moves to a Next.js route handler (`app/api/paystack/webhook/route.ts`, M5).
