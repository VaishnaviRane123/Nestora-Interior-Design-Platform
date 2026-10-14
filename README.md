# Nestora — Interior Design Discovery & Booking

Nestora is a Next.js 14 + TypeScript + Prisma/PostgreSQL application for discovering interior concepts, browsing designers, requesting bookings, and estimating project budgets for Indian homes. The visual direction is warm, editorial and material-led.

## Requirements

- Node.js 20 LTS or newer (check the installed Prisma 7 package's engine requirements for your platform)
- PostgreSQL 14+ (local, Neon or Supabase)
- npm

## Clean setup (PowerShell)

```powershell
Copy-Item .env.example .env
# Edit .env and set DATABASE_URL and a strong AUTH_SECRET
npm install
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

Open http://localhost:3000. Do not commit `.env`; use a separate development database for seed data. Demo credentials from the seed script are for local development only and must not be enabled in a public deployment.

## Environment variables

- `DATABASE_URL`: PostgreSQL connection string
- `AUTH_SECRET`: random secret used to sign Auth.js sessions
- `AUTH_TRUST_HOST`: set to `true` for local deployments behind a trusted host
- `AUTH_URL`: local or deployed application URL
- `NEXT_PUBLIC_APP_NAME`: public product name

## Available commands

- `npm run dev` — development server
- `npm run typecheck` — TypeScript check
- `npm run build` — production build
- `npm run db:seed` — idempotent sample-data seeding

## Local imagery

The current starter assets live in `public/images/`; application pages reference local `/images/...` paths so they do not require a third-party image host at runtime. Some starter assets are crops from the provided design-reference screenshots and should be replaced with properly licensed, full-resolution interior photography before public launch.

## Implementation / verification status

This archive includes the existing discovery, booking, estimator, customer dashboard and Auth.js foundation, plus local starter imagery, Nestora's inline SVG wordmark, persistent favorites and board data models, board API endpoints, public shared-board page, designer lead-list page and an honest catalogue/estimate assistant scaffold.

This is **not yet a verified production release**. In particular, a fresh dependency installation, generated Prisma client, full TypeScript/build run, browser end-to-end tests, and security review must be completed in an environment with npm registry access and a working PostgreSQL database. `package-lock.json` is not included because dependencies could not be resolved in the restricted build environment; generate it with `npm install` and commit it before deployment. The `/ask` route is a Phase 4 scaffold, not a real LLM/RAG integration.
