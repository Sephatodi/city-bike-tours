# City Bike Tours design and application architecture

## Product structure

The repository contains two deployable applications:

- The Vite React website is deployed to Vercel.
- The Next.js backend and staff dashboard are deployed separately and use Neon Postgres through Drizzle ORM.

The website uses React Router. Public routes include the home page, ride schedule, booking, heritage trail, gallery, site-specific gallery, reviews/messages, customer login, and customer dashboard. Legal routes are `/privacy`, `/terms`, and `/data-deletion`.

## Visual system

The website uses a heritage-inspired palette: dark forest greens, warm cream surfaces and gold accents, with rider/bicycle motifs. Shared navigation and footer components provide consistent access to booking, customer account, gallery and legal information. Mobile navigation is rendered separately for small screens.

The reviews and gallery surfaces use the `rr` theme stylesheet. Date/time labels use the Africa/Gaborone timezone helpers in `src/lib/time.js`.

## Authentication boundaries

Customer authentication and staff authentication are separate:

- Customer email/password and phone OTP use the customer API and customer token.
- Customer Google OAuth uses Neon Auth through the backend proxy. The completion route maps the Neon identity to a customer record and issues the existing customer token.
- Facebook and Apple customer OAuth use the backend `/customer-social` page and NextAuth.
- Staff sign-in remains NextAuth credentials with MFA and database-backed staff roles.

Customer completion handlers reject users whose database role is not `customer`. Do not grant staff permissions from a social-provider claim.

## Data and migrations

Neon Postgres is the source of truth. Drizzle schema definitions live in `backend/db/schema.js`; ordered SQL migrations and their journal live in `backend/db/migrations`. Apply migrations through the backend's `npm run db:migrate` script after reviewing the target database.

## Deployment configuration

The website uses `VITE_API_BASE_URL` to reach the backend. The backend uses `FRONTEND_ORIGIN` and `CORS_ORIGIN_PATTERNS` to control browser origins. Neon Auth requires `AUTH_URL` and `NEON_AUTH_COOKIE_SECRET`. Secrets belong only in deployment environment settings, never in the repository.


## Gallery and review presentation

The shared website palette and typography remain authoritative: forest green, gold `#D4A017`, cream `#F5EDD9`, rust `#C1440E`, Fraunces display type and Outfit body type. Gallery/review panels are translucent surfaces over the global `SiteBackdrop`; do not apply an opaque page background. The animated `.header-bike` riders and custom bicycle cursor must remain visible on `/gallery`, `/gallery/:siteId`, and `/connect`.

The gallery uses a three-visible-slide looping heritage carousel (previous, active, next), synced to the six linked site cards below it. The all-photos wall filters the static site photographs and published picture content by site, uses lazy-loaded 4:3 tiles and a progressive Load more control, and opens a keyboard-operable lightbox. Site detail pages retain their story, photo collection, videos and nearby food-stop section.

The reviews page uses two data-backed presentations: up to three admin-featured quote cards, and standard cream review cards. Featured quotes are never fabricated; admins must explicitly feature an approved review. A profile photo is displayed only when the reviewer explicitly opted in and the account image exists; otherwise a deterministic initials avatar is shown. The customer composer supports an optional 80-character headline and an opt-in avatar checkbox (off by default).

## Cycling-street heritage trail

Only `/heritage-trail` opts into the street-route experience through `HeritageMap trail`. It lazily imports the generated public `src/data/trail-route.json`, draws one continuous blue street route, and moves an SVG bicycle marker along its geometry with Leaflet animation frames. The rider rotates to follow each segment's bearing. Stops pause the rider and highlight the corresponding site button. The standard `HeritageMap` mode remains the original straight-line map used on LandingPage and BookingPage; it must not load route data or create a bicycle marker. Keep the existing Mapbox/OSM tiles, SiteBackdrop riders and bicycle cursor unchanged. Respect reduced motion, pause when the map is off-screen or the tab is hidden, and retain provider attribution.
