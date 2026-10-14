# Nestora product roadmap (2026)

## Included in this updated starter
- Pinterest-inspired visual discovery homepage and responsive masonry design cards.
- Design search and filters, including a corrected new-home/renovation filter.
- Save/unsave design ideas and a Saved Inspiration page (stored in the current browser using localStorage; not synced across devices or accounts).
- Room makeover planner with local photo preview, style selection, colour palettes and matching design discovery.
- Existing budget estimator, designer discovery, sign-up/login, booking request routes, dashboard and admin route retained.
- Mobile-friendly navigation and responsive layouts.

## Room makeover limitation
The makeover planner is a working UI prototype. It does not currently generate or edit an image with AI. The uploaded photo preview remains in the browser and is not sent to a server. A true image-to-image AI makeover needs an image-generation provider, server-side API route, secret key, consent/privacy handling, moderation and usage limits. Keep provider keys on the server and never expose them in `NEXT_PUBLIC_*` variables.

## Before public launch
- Move saved designs from browser storage to a user-linked database model if cross-device sync is needed.
- Add rate limiting, audit logs and authorization checks to all protected server actions/API routes.
- Review npm audit findings and the middleware Edge Runtime warnings.
- Use verified, licensed interior photos and confirm remote image loading in production.
- Add image upload storage, real designer verification, reviews, email notifications and payment integration only after their workflows are ready.
- Validate estimates with local professionals and label all estimates as indicative.
