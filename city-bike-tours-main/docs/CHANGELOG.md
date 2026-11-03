# Changelog

## October 2026 update

1. Google sign-in through Neon Auth; Facebook and Apple stay on NextAuth; social buttons start at the backend `/customer-social` page.
2. The old customer pages and components of a previous site were removed from the backend; the backend `/` and `/register` redirect to the website.
3. Migration `0015` is now registered in the Drizzle journal (it was being skipped); new migrations `0016` (review details), `0017` (helpful votes) and `0018` (rider photos name a site).
4. Customer dashboard at `/dashboard`, the default page after sign-in.
5. Legal pages: `/privacy`, `/terms`, `/data-deletion`.
6. Reserve page: ride cards with price, rider count, total and Book button in one section; next ride and today marker.
7. Heritage trail: six folders that open one at a time.
8. Gallery: roundabout with six route buttons; a page per site with all pictures; rider photos can name a stop.
9. Reviews page redesigned in the rr theme with a real score summary, filters, helpful votes, verified-rider rule and optional photo.
10. Gaborone-time dates everywhere, live refresh through polling, `Stamp` and `SiteClock`.
11. Show / hide password buttons on the website and in the admin dashboard.
12. Branding: rider favicon and app icons, sky-blue cursor and riders, new fonts, mobile bottom navigation.
13. CORS: `FRONTEND_ORIGIN` plus anchored `CORS_ORIGIN_PATTERNS` for preview deployments.

## SMS codes through Infobip

SMS sign-in codes can now be sent through Infobip as well as Twilio, with automatic fallback to the next configured provider (`SMS_PROVIDER_ORDER`). WhatsApp codes are unchanged. Guide: `docs/SMS-CODES-SETUP.md`.

## November 2026 update

1. Heritage trail: cycling-street route generation, an animated bicycle with per-stop pauses, accessible playback controls, and a compact rider-photo upload section at the top of the Gallery.
2. New rider photo and video uploads use a separate private Vercel Blob store; approved gallery media is served through the backend.
