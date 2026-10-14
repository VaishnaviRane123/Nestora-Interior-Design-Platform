# Nestora admin and catalogue update

## Admin dashboard improvements
- Added responsive summary cards for customers, designers, approved designs, bookings, new consultations, pending designer applications, reviews, and supported cities.
- Added clear admin heading and public-site shortcut.
- Kept consultation triage, designer assignment, designer-application review, pending design review, and booking management in the existing admin workspace.
- Consultation submissions continue to be stored in `ConsultationRequest` and appear in the admin dashboard's new-consultation queue.
- Existing API role checks remain in place; dynamic route parameters were updated to Next.js 15's Promise-based params convention.

## Sample catalogue
- Added 60 idempotent sample design records in `prisma/seed.ts`, using existing designer profiles, categories, styles, prices, and available local image assets.
- These are demonstration catalogue records, not claims of real designer availability or binding quotes.
- The seed script also seeds city/estimate records. Run it against a development database to populate them.

## Setup after replacing project files
1. Back up your current project folder and `.env`. Do not share `.env` secrets.
2. Copy the updated files/folders from this archive into your project, allowing the listed files to be replaced.
3. Run `npm install` and `npx prisma generate`.
4. Check migration status with `npx prisma migrate status`. If migrations are pending, run `npx prisma migrate dev` after checking the migration output. Do not reset the database.
5. Run `npm run db:seed` against your development database. The seed script intentionally refuses to run in production.
6. Run `npm run typecheck`, `npm run build`, then `npm run dev`.

## Important scope note
The admin dashboard provides operational management for the current schema. Email/SMS sending, payment processing, export/reporting, and a full AI assistant need separate provider/configuration work and are not represented as completed by this update.
