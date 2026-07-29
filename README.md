# Journey to Mordor

A multi-player Walk to Mordor tracker: friends connect Strava, sync foot miles, add manual miles, and share a fellowship leaderboard on the road from Hobbiton to Mount Doom (1,779 miles).

Built with Next.js (App Router), Prisma, Neon Postgres, and Strava OAuth — ready to deploy on Vercel.

## Features

- Strava OAuth (`read` + `activity:read_all`)
- Foot activities only: Walk, Run, Hike, TrailRun, VirtualRun, Snowshoe
- Manual mile entries
- Middle-earth milestone progress
- Fellowship create/join via invite code + leaderboard
- Rate-limit-aware Strava sync (button-only, 5-minute cooldown, incremental fetch)

## Local setup

1. Copy env and fill in values:

   ```bash
   cp .env.example .env
   ```

2. Create a [Neon](https://neon.tech) Postgres database. Put the **pooled** URL in `DATABASE_URL` and the **direct** URL in `DIRECT_URL`.

3. Create a [Strava API application](https://www.strava.com/settings/api):
   - Authorization Callback Domain: `localhost`
   - Set `STRAVA_CLIENT_ID`, `STRAVA_CLIENT_SECRET`
   - `STRAVA_REDIRECT_URI=http://localhost:3000/api/auth/strava/callback`

4. Set `SESSION_SECRET` to a random string (≥ 32 chars).

5. Install, migrate, run:

   ```bash
   pnpm install
   pnpm db:migrate
   pnpm dev
   ```

Open [http://localhost:3000](http://localhost:3000).

## Deploy on Vercel

### 1. Database (Neon)

- Create a Neon project (or install Neon from the Vercel Marketplace).
- Add to the Vercel project env:
  - `DATABASE_URL` — pooled connection string
  - `DIRECT_URL` — direct connection string (for migrations)

### 2. Strava

Strava allows **one** Authorization Callback Domain per API app.

- Production domain: `YOUR_PROJECT.vercel.app` (or your custom domain)
- Callback URL: `https://YOUR_PROJECT.vercel.app/api/auth/strava/callback`
- Set `STRAVA_CLIENT_ID`, `STRAVA_CLIENT_SECRET`, `STRAVA_REDIRECT_URI` in Vercel

OAuth is supported on **production** (and localhost with a local/dev Strava app). Preview deployment URLs will not match a single callback domain.

### 3. App secrets

| Variable | Notes |
| --- | --- |
| `SESSION_SECRET` | ≥ 32 chars |
| `NEXT_PUBLIC_APP_URL` | `https://YOUR_PROJECT.vercel.app` |
| `STRAVA_*` | As above |
| `DATABASE_URL` / `DIRECT_URL` | Neon |

### 4. Migrate & deploy

```bash
pnpm db:migrate   # against Neon using DIRECT_URL
vercel deploy     # or push to the connected Git branch
```

`postinstall` / `build` run `prisma generate` so the client is available on Vercel.

## Strava API budget

Default shared limits: ~100 read requests / 15 minutes, ~1,000 / day.

This app never syncs on page load. Users click **Sync Strava**; the server enforces a cooldown and caps pagination so a small fellowship stays within quota.

## Scripts

| Script | Purpose |
| --- | --- |
| `pnpm dev` | Local Next.js server |
| `pnpm build` | Generate Prisma client + production build |
| `pnpm db:migrate` | `prisma migrate deploy` |
| `pnpm db:generate` | `prisma generate` |
