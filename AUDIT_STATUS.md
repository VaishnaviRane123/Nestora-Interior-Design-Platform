# Nestora remediation status

## Implemented in this archive

- Login form no longer pre-fills or displays demo credentials. Production credential authentication rejects `@nestora.demo` accounts, and the seed script refuses to run when `NODE_ENV=production`.
- Dashboard booking link points to the design catalogue. Login respects a safe local `callbackUrl` so the designer application flow can return users to the intended page.
- Booking API restricts creation to customer accounts, validates preferred dates and phone numbers, saves submitted name/phone to the account, updates customer city/property type, and returns controlled errors.
- Designer registration submits to a server API and creates a pending database application tied to the signed-in account.
- Admin-only APIs approve/reject designer applications and update booking statuses. They verify the current role from the database and write booking status events.
- Designer directory reads verified profiles from PostgreSQL. The design detail page displays verification based on the actual database value. The `city` query parameter initializes the gallery location filter.
- README updated for current booking behavior, Node.js requirement, production seed restrictions, schema update, and deployment checklist.

## Required before using this version

1. Back up the database, install dependencies, then run `npx prisma generate` and `npx prisma db push` to apply the new `DesignerApplication` model. Review schema changes before applying them to a shared or production database.
2. Generate a dependency lockfile in an environment with npm registry access (`npm install --package-lock-only`) and review the dependency tree with `npm audit`. A lockfile could not be generated in this build environment because npm registry access/install timed out; no dependency vulnerability is claimed fixed.
3. Run `npm ci`, `npm run typecheck`, `npm run build`, and browser/API end-to-end tests with a disposable PostgreSQL database. These could not be completed here because dependencies were not installed. The global TypeScript check only confirmed that parsing reached files; it reports missing dependency/type declarations and is not a valid project typecheck.
4. Apply edge/API rate limiting at the hosting provider for signup and public-facing APIs. In-memory rate limiting is intentionally not used because it is unreliable across serverless instances.
5. Review remaining Next/Prisma/pg build warnings in a dependency-installed environment. They cannot be conclusively investigated without the full install/build output.

## Security notes

- Never run the demo seed against production. Use a separate development database.
- Set a unique `AUTH_SECRET` (at least 32 characters), secure production environment variables, and use a production database with backups.
- Admin endpoints check the user's current database role, not only the JWT claim.
