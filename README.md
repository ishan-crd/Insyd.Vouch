# Vouch

Instagram post & reel metrics as an API. Customers paste links (or call `POST /v1/scrape`), Vouch pulls every field,
optionally re-checks tracked posts every 2 hours, and bills **$4 per 1,000 results**.

Next.js 16 (App Router) · Supabase (Auth + Postgres) · upstream scraper: Apify `instagram-reel-scraper`.

## Setup

```bash
pnpm install
cp .env.example .env.local   # fill in the values below
pnpm dev                     # http://localhost:3100
```

| Variable | Where it comes from |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase → Project settings → API keys |
| `SUPABASE_SECRET_KEY` | Supabase → API keys → Secret key (`sb_secret_…`). Server only. |
| `APIFY_TOKEN` | Apify console → Settings → API & Integrations |
| `NEXT_PUBLIC_APP_URL` | Public URL of the app. Used for auth redirects and upstream webhooks (skipped on localhost). |
| `WEBHOOK_SECRET`, `CRON_SECRET` | Any long random strings |

Database schema lives in `supabase/migrations/` (already applied to the linked project).

## How it works

- **jobs** = one upstream scraper run. **runs** = what a customer sees and pays for. A one-off scrape is one job → one run.
  The tracking scheduler batches every due post across all customers into one job, then gives each customer their own run,
  so the upstream per-run start fee is paid once per cycle.
- A job finishes via the upstream webhook (`/api/webhooks/upstream`), or is swept by the scheduler, or is refreshed when a
  customer views the run or polls the API. `processJob` claims the job atomically, stores items in `run_items`, bills the run,
  writes `snapshots` for tracked posts, and fires customer webhooks.
- **Scheduler**: `GET /api/cron/tick` (Bearer `CRON_SECRET`) every 10 min via `vercel.json`. Sub-daily crons need Vercel Pro;
  on Hobby, point any external cron (or Supabase `pg_cron` + `pg_net`) at the same URL.
- Public API is served at `/v1/*` (rewritten to `/api/v1/*`). Reference: `/docs`.

## Pricing knobs

`src/lib/pricing.ts`: `PRICE_PER_1K_RESULTS` (4), `SHARES_ADDON_PER_1K` (10), `TRACK_INTERVAL_MINUTES` (120).

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Dev server on port 3100 |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm check` / `pnpm check:fix` | Biome lint + format (fix applies safe fixes) |
| `pnpm lint` | ESLint (Next.js + React hooks rules) |
| `pnpm verify` | All of the above, then a production build |
