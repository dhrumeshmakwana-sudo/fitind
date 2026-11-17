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
- **Database:** SQLite via Drizzle ORM (migrations in `drizzle/`, schema in `server/src/schema.ts`)
- **Auth:** in-app — PBKDF2-SHA256 password hashing, hashed session tokens

## Project structure

```
client/    React app (pages, components, theme)
server/    Server actions, database schema, seed data (foods, exercises, recipes)
drizzle/   SQL migrations 0001–0006
```

## Status

Phases 1–5 are complete and verified end-to-end (including two-user data-isolation tests). Phase 6 — full end-to-end testing and production readiness — is in progress.

FITIND currently runs as a hosted full-stack app on the Muse platform, whose runtime SDK (`@hatch/space-sdk`) provides the server/database plumbing. A standalone public deployment (with the SDK layer ported to a conventional Bun/Node server) is the next step after Phase 6.
