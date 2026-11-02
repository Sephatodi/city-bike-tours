# Changelog

## 2026-11-01

- Added customer Google sign-in through Neon Auth's server-side Next.js integration and backend proxy.
- Kept Facebook and Apple customer OAuth on NextAuth and preserved the existing staff credentials/MFA flow.
- Added a customer Neon Auth completion route that checks account status and role before issuing a customer token.
- Added Privacy, Terms of Use and Data Deletion pages and footer links.
- Extended public reviews with verified-rider status based on matching customer phone numbers to checked-in bookings.
- Added review score summary, rating filters, sorting, helpful votes and optional photo URL metadata.
- Registered an idempotent index migration for review helpful votes.

- Reworked `/gallery` into a three-slide looping heritage carousel synced with the six site cards, plus a filtered photo wall and community picture strip.
- Restored the original forest-green/gold/cream palette, Fraunces/Outfit typography and transparent page surfaces so SiteBackdrop bicycles and the bicycle cursor remain visible.
- Added review headlines, opt-in profile avatars and admin-controlled featured quote cards; registered migration `0019_review_presentation`.
- Added optional Mapbox/ORS cycling-street route generation and a `/heritage-trail`-only animated bicycle that follows one continuous blue route, rotates with its heading, pauses at each stop and includes playback controls and provider attribution; LandingPage and BookingPage map behavior remains unchanged.
