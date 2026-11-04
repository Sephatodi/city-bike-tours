# City Bike Tours

See [the application functionality and user-flow guide](./docs/APP-FUNCTIONALITY-AND-FLOWS.md) for a page-by-page description of the website, backend, and booking processes.

## Local development

1. Configure Neon in `backend/.env` using `backend/.env.example`.
2. Apply the database migrations from the backend directory: `cd backend && npm run db:migrate`. This uses Neon's HTTP driver.
3. Start the backend in one terminal: `cd backend && npm run dev`.
4. Start the Vite frontend from the repository root in another terminal: `npm run dev`.

In local development, Vite proxies `/api` requests to `http://localhost:3000`. Check the backend and database with `http://localhost:3000/api/health`, or check the full frontend-to-backend proxy at `http://localhost:5173/api/health`. With both services running, run the HTTP smoke checks using `FRONTEND_URL=http://localhost:5173 BACKEND_URL=http://localhost:3000 npm run smoke`.

To regenerate the cycling-street route used only on `/heritage-trail`, use Node.js 22.9+ and run `npm run trail:build`. Configure one of `MAPBOX_TOKEN` or `VITE_MAPBOX_TOKEN`, or `ORS_API_KEY`; optionally select a provider with `TRAIL_PROVIDER`. See [the trail routing setup](./docs/TRAIL-ROUTING-SETUP.md) for provider setup and via points.

Run backend tests with `cd backend && npm test`.

Booking requires a signed-in customer. The backend validates and stores each request, snapshots its route price, checks availability, and sends best-effort rider/admin notifications. Customers can review upcoming and past bookings in `/dashboard`, download calendar entries, and cancel eligible rides; staff confirm or cancel requests in Admin → Bookings. Payments are recorded manually and are due on the ride day; the application does not collect card data. Transactional email and reminder setup is documented in [EMAIL-SETUP.md](./docs/EMAIL-SETUP.md) and [PAYMENTS.md](./docs/PAYMENTS.md). For Twilio SMS/WhatsApp notifications, configure the Twilio credentials and sender values in the backend environment; WhatsApp templates may be required outside the customer-service window. See [the go-live checklist](./docs/GO-LIVE-CHECKLIST.md) before deployment.

## Production deployment

Deploy the backend to Render using the repository-root `render.yaml` Blueprint. It builds the Next.js app from `city-bike-tours-main/backend`, applies registered database migrations before deployment, starts the web service, and checks `/api/health`. Provide the requested environment values in Render; do not commit production secrets. The Blueprint uses an always-on Starter instance so the backend does not sleep between bookings.

Deploy the website as a Vercel project with Root Directory `city-bike-tours-main`, build command `npm run build`, and output directory `dist`. The `vercel.json` in that directory rewrites client-side routes such as `/book` and `/gallery` to the Vite app. Set `VITE_API_BASE_URL` to the Render backend origin and configure `VITE_MAPBOX_TOKEN` there if the production map uses Mapbox.

Set the backend's `NEXTAUTH_URL` and `PUBLIC_BACKEND_URL` to its public origin, and set `FRONTEND_ORIGIN` (and `PUBLIC_FRONTEND_URL` for ride-pass links) to the website origin, including the scheme (for example, `https://city-bike-tours.vercel.app`) and without a path or trailing slash. For multiple website origins, use a comma-separated list. Set `VITE_API_BASE_URL` to the backend origin in the website project's build environment. The website then loads current route names and prices plus published gallery content from the backend; its Admin link opens the backend sign-in page. Redeploy the backend after changing its environment variables and rebuild the website after changing its build variables.

Run the end-to-end readiness checklist in [docs/GO-LIVE-CHECKLIST.md](./docs/GO-LIVE-CHECKLIST.md). It covers domain and OAuth setup, transactional email DNS, cron/reminder configuration, customer journeys, backups, and rollback.

## Administrator access

Set `ADMIN_EMAIL`, `ADMIN_NAME`, and a unique `ADMIN_PASSWORD` (at least 12 characters) in `backend/.env`, apply the database migrations, then run `cd backend && npm run admin:provision`. With the backend running locally on port 3000, sign in at `http://localhost:3000/admin/login`. In production, the website footer's Admin Login link opens the backend login page. Public registration always creates a customer role and cannot grant administrator access.

## Ride passes and check-in

After a booking is confirmed, the customer receives a signed ride-pass link by each configured Twilio channel. The link opens a QR pass at `/ticket/:token`; the backend exposes an admin check-in API for validating and redeeming passes once, on the scheduled date in Gaborone. The camera scanner exists in the frontend-local admin UI but is not currently exposed by the separate backend admin dashboard used in production.

Before enabling check-in, apply migrations from the `backend` directory with `npm run db:migrate`. Set `PUBLIC_FRONTEND_URL` to the public Vite site origin and configure a stable `RIDE_PASS_SECRET` (or retain the same `NEXTAUTH_SECRET` across deployments). WhatsApp requires `TWILIO_WHATSAPP_FROM` and an approved `TWILIO_WHATSAPP_CONTENT_SID` template with placeholders `{{1}}` rider, `{{2}}` route, `{{3}}` date, `{{4}}` riders, `{{5}}` pass URL, and `{{6}}` reference. SMS also requires an SMS-capable `TWILIO_PHONE_NUMBER`. Camera scanning requires HTTPS in production.

## Website pages

| Page | What it is |
|---|---|
| `/` | Home |
| `/schedule` | Reserve: ride cards with live price, rider count, total and Book button in one section, the next ride in Gaborone time, the week at a glance, what's included and common questions. `/pricing` redirects to `/schedule#pricing`. |
| `/heritage-trail` | Six heritage folders; click one to open its photos, story and videos (with a "View all photos" link). |
| `/gallery` | Roundabout of the six sites, six route buttons, food stops, the team's pictures and rider stories. |
| `/gallery/:siteId` | Every picture, video, rider photo and nearby food stop for one heritage site. Unknown ids redirect to `/gallery`. |
| `/connect` | Reviews (real score summary, filters, helpful votes, photo) and messages to the team. |
| `/login`, `/login/callback` | Sign in or create an account; social sign-in returns here with a token. |
| `/dashboard` | Customer profile, own reviews and media, and upcoming/past bookings with cancellation and calendar actions. |
| `/forgot-password`, `/reset-password` | Request a one-time email reset link and choose a replacement password. |
| `/book`, `/ticket/:token`, `/messages` | Booking request, ride pass, inbox. `/routes` redirects to `/book`. |
| `/privacy`, `/terms`, `/data-deletion` | Legal pages (Meta and Google require the privacy and deletion pages). |

The backend serves only the API, the admin dashboard (`/admin`) and the short hand-off page `/customer-social`. Its `/` and `/register` redirect to the website; the old customer pages of a previous cycling-shop site no longer exist.

## Sign-in setup

- **Email + password** always works. **Phone (SMS) codes** go through Twilio and/or Infobip (the next provider is tried if one fails; see [docs/SMS-CODES-SETUP.md](./docs/SMS-CODES-SETUP.md)); **WhatsApp codes** use Twilio.
- **Google** goes through Neon Auth (server-driven flow in `backend/lib/neon-auth-server.js`, `/api/neon-auth`, `/api/customer/neon/complete`). It is switched on by `NEON_AUTH_BASE_URL` and `NEON_AUTH_COOKIE_SECRET`; without them Google falls back to `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` through NextAuth.
- **Facebook and Apple** use NextAuth (`backend/lib/auth.js`). Neon Auth does not support them.
- The website's social buttons open `<backend>/customer-social?provider=...&return=<website origin>`. Do not link directly to `/api/auth/signin/<provider>`: NextAuth only starts OAuth from a POST with a token.
- Step-by-step setup (Neon Console, Google Cloud, Meta, Render, Vercel): [docs/SOCIAL-SIGN-IN-SETUP.md](./docs/SOCIAL-SIGN-IN-SETUP.md).
- Customers never receive admin access: social and phone sign-in always create or match a `customer` account, and staff emails are refused.

## Environment variables (names only, never commit values)

Backend: `DATABASE_URL` or `NEON_DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `FRONTEND_ORIGIN`, `CORS_ORIGIN_PATTERNS`, `PUBLIC_FRONTEND_URL`, `PUBLIC_BACKEND_URL`, `NEON_AUTH_BASE_URL`, `NEON_AUTH_COOKIE_SECRET`, `FACEBOOK_CLIENT_ID`, `FACEBOOK_CLIENT_SECRET`, `APPLE_CLIENT_ID`, `APPLE_CLIENT_SECRET`, `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` (fallback only), `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`, `INFOBIP_API_KEY`, `INFOBIP_BASE_URL`, `INFOBIP_SENDER`, `SMS_PROVIDER_ORDER`, `TWILIO_WHATSAPP_FROM`, `TWILIO_WHATSAPP_OTP_CONTENT_SID`, `BLOB_READ_WRITE_TOKEN`, `BLOB_PRIVATE_READ_WRITE_TOKEN`, `EMAIL_PROVIDER`, `RESEND_API_KEY`, `EMAIL_FROM`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_SECURE`, `ADMIN_NOTIFY_EMAILS`, `CRON_SECRET`, `ADMIN_EMAIL`, `ADMIN_NAME`, `ADMIN_PASSWORD`.

Website (Vercel build): `VITE_API_BASE_URL` (the backend origin) and optionally `VITE_CONTACT_EMAIL` (shown on the legal pages).

`FRONTEND_ORIGIN` must be the website origin exactly (scheme, no path, no trailing slash; commas for several). `CORS_ORIGIN_PATTERNS` may hold anchored https patterns with `*` for Vercel preview addresses, for example `https://city-bike-tours-*-your-team.vercel.app`.

## Database migrations

Run `cd backend && npm run db:migrate` after every deploy that adds a migration. **Every migration file must also be listed in `backend/db/migrations/meta/_journal.json`; Drizzle silently skips files that are not.** Recent migrations: `0015_managed_auth_identity` (`users.managed_auth_id`), `0016_review_details` (review tour, origin, photo, stops, highlights), `0017_review_votes` (helpful votes), `0018_photo_site` (rider photos can name a heritage site), and `0025_launch_features` (customer-linked bookings, email logs, reset tokens, payment/reminder state). Registered migrations are tested for repeatability.

## Customer accounts, reviews, messages and rider photos

- **Reviews:** approved reviews only appear publicly. The score summary (average, distribution, "rated 4★ or higher", highlight shares) is calculated from real reviews and the page shows an empty state when there are none. A "Verified rider" badge is shown only when the author's phone number matches a booking staff checked in. Reviews may carry a ride, origin, stops, highlight tags and one photo (needs `BLOB_READ_WRITE_TOKEN`). Signed-in customers can mark other people's reviews helpful once each.
- **Messages:** customers chat with the team on `/connect`; replies are posted from the admin dashboard.
- **Moderation:** in the admin dashboard, **Customers → Inbox & reviews** has *Rider chats*, *Reviews* (approve, reply, hide; shows the photo and details) and *Rider photos* (approve, hide, delete). Reviews and photos are public only after approval.
- **Rider photos:** uploads use the public Vercel Blob store (`BLOB_READ_WRITE_TOKEN`) and may name a heritage site. They appear in the gallery after staff approval; public downloads are controlled separately by moderation. Existing private-store media continues to use `BLOB_PRIVATE_READ_WRITE_TOKEN`.
- **Time:** all dates and times are shown in Gaborone time (`src/lib/time.js`). Messages refresh about every 20 seconds, reviews, prices and content about every minute and when the tab regains focus.
- **More pictures or videos for a site:** edit that site in `src/data.js` (`imgs`, and `videos: [{ title, src }]` with a YouTube link or video file).
- See also [docs/REVIEWS-AND-GALLERY.md](./docs/REVIEWS-AND-GALLERY.md), [docs/DESIGN.md](./docs/DESIGN.md) and [docs/CHANGELOG.md](./docs/CHANGELOG.md).
