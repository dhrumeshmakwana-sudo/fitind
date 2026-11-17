# FITIND

**Train Smart. Eat Right. Track Everything.**

A full-stack Indian fitness, nutrition and workout platform — real accounts, a 142-food Indian database counted the way you actually eat it (katori, roti, piece), workout plans with live set logging, and progress that comes only from your real logs. Nothing is faked: no dummy data, no dead buttons.

Built by [Dhrumesh Makwana](https://github.com/dhrumeshmakwana-sudo).

## Features

- **Accounts & onboarding** — email + password signup/login (hashed passwords, 30-day sessions), 4-step onboarding, profile & settings, per-user data fully isolated
- **Dashboard** — calorie & macro targets estimated with the Mifflin–St Jeor equation (manual override always wins), calorie ring, weight trend, water, training summary
- **Food** — 142 Indian foods with per-100 g nutrition and household servings, search with veg / vegan / high-protein filters, favourites, custom foods, and a full food diary (breakfast / lunch / snacks / dinner)
- **Workouts** — 61-exercise library with form cues and common mistakes, 11 ready plans (Push/Pull/Legs, Upper/Lower, Full Body, Bro Split, Home) plus custom routines, live session logging with a rest timer, history and personal records
- **Progress** — charts drawn only from real records (weight, calories, workouts, hydration), body measurements
- **Recipes & challenges** — 26 Indian recipes whose nutrition is calculated from their actual ingredients, a weekly meal plan, and 30-day / 75-day challenges you tick off by hand
- **Admin & privacy** — a server-protected admin area, complete JSON export of all your data, session management (log out other devices), and account deletion that truly deletes

## Tech stack

- **Frontend:** React 19, TypeScript, Tailwind CSS 4, React Query, Recharts
- **Backend:** TypeScript server actions on the Bun runtime, Zod validation
- **Database:** SQLite/libSQL via Drizzle ORM (migrations in `drizzle/`, schema in `server/src/schema.ts`) — a local file in development, [Turso](https://turso.tech) when deployed
- **Auth:** in-app — PBKDF2-SHA256 password hashing, hashed session tokens

## Project structure

```
client/    React app (pages, components, theme)
server/    Server actions, database schema, seed data (foods, exercises, recipes)
           standalone.ts — plain Bun server entrypoint for self-hosting
vendor/    Vendored @hatch/space-sdk shim (standalone replacement for the Muse runtime SDK)
drizzle/   SQL migrations 0001–0006
api/ + vercel.json — the action RPC as a Vercel Function (database on Turso)
Dockerfile — optional container packaging for any Docker host
```

## Status

All 6 phases are complete and verified end-to-end (~120 checks, including two-user data-isolation tests). FITIND also runs on the Muse platform; the standalone port below is the same code with the Muse runtime SDK replaced by a small vendored shim (`vendor/space-sdk/`) plus a shared request core (`server/app.ts`) served by a plain Bun server locally (`server/standalone.ts`) or a Vercel Function when deployed (`api/actions.ts`).

## Run standalone (local)

```bash
bun install
bun run build:client   # produces client/dist
bun start              # http://localhost:3000
```

With no env vars set, the server creates a local SQLite database at `./data/app.db` (override with `DATABASE_PATH`) and applies the `drizzle/` migrations on first run. To use a Turso database locally instead, set `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` — the same libSQL code path serves both.

## Deploy free on Vercel + Turso

The whole stack is free-forever — no card, no trial that converts:

- **Database — Turso (free tier):** sign up at [turso.tech](https://turso.tech) with GitHub, create a database (e.g. `fitind`), and note its `libsql://…` URL and an auth token (dashboard → database → "Create Token", or `turso db tokens create fitind` with the Turso CLI).
- **Hosting — Vercel (free Hobby tier):** Vercel functions have no persistent local files, which is exactly why the database lives on Turso instead of a local file. The built client is served as static files; the action RPC runs as a single Vercel Function (`api/actions.ts`) over the same request core as the local Bun server (`server/app.ts`).

Steps:

1. Push this repo to GitHub.
2. At [vercel.com](https://vercel.com): **Add New → Project**, import this repo. No settings to change — `vercel.json` already sets everything:
   - `installCommand: bun install` and `buildCommand: bun run build:client` (the repo pins `packageManager: bun@1.3.10` and commits `bun.lock`, so Vercel installs and builds with Bun — the client bundler is Bun-based);
   - `outputDirectory: client/dist`;
   - rewrites: `/actions` → `/api/actions` (the RPC endpoint the client calls) and an SPA fallback to `/index.html`.
3. In **Project Settings → Environment Variables**, set:
   - `TURSO_DATABASE_URL` — your `libsql://…` Turso URL
   - `TURSO_AUTH_TOKEN` — your Turso auth token
4. Deploy. On the first request the function applies all migrations to the Turso database; the food/exercise/recipe catalogues seed themselves lazily through normal use.

**Honest caveats:** the free Hobby tier is for personal projects and has generous-but-finite function/bandwidth limits — plenty for sharing with friends. Serverless functions can cold-start (~a second) after idle time; data is always safe on Turso.
