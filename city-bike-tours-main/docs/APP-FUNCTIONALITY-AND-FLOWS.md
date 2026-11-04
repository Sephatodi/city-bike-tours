# City Bike Tours — Application Functionality & User Flows

This guide describes the application as it is currently implemented in this repository. It distinguishes the public Vite website from the Next.js backend, because they are separate applications and contain different customer booking flows.

## 1. Application overview

| Application | Location | Purpose |
| --- | --- | --- |
| Public website | Repository root (`src/`) | Visitor information, route and price discovery, booking requests, static heritage gallery, and ride-pass display |
| Backend and admin | `backend/` | Next.js API, PostgreSQL persistence, authentication (email, phone and WhatsApp codes, Google through Neon Auth, Facebook and Apple through NextAuth), admin operations, email/SMS integrations, uploads, reviews and messages. |

For the two-project deployment, the public website is built from the repository root and the backend from `backend/`. The root `vercel.json` rewrites website paths to the Vite app so browser routes can be refreshed directly.

### Public website navigation

- `/` — Home
- `/schedule` — Reserve: ride cards with live price and booking, next ride, weekly schedule, meeting point (`/pricing` redirects here)
- `/heritage-trail` — Six heritage folders
- `/gallery` and `/gallery/:siteId` — Heritage roundabout, one page per site with all pictures, team content and rider stories
- `/connect` — Reviews and messages
- `/book` — Public booking-request form (`/routes` redirects here)
- `/login`, `/dashboard` — Sign in and the customer dashboard, including bookings
- `/forgot-password`, `/reset-password` — Request and complete a password reset
- `/privacy`, `/terms`, `/data-deletion` — Legal pages
- `/ticket/:token` — Ride pass for a confirmed booking
- `/admin/login`, `/admin` — Forward to backend admin when `VITE_API_BASE_URL` is configured

On phones a docked bottom bar (Trail, Gallery, Reviews, Book) complements the header. All dates and times are shown in Gaborone time.

The shared website header provides navigation, a mobile menu, and a Book Now call to action. The footer links to the principal visitor pages and opens the backend admin login when configured.

## 2. Public website pages

### Home — `/`

- Introduces the two current ride offerings: the guided Heritage City Ride and Casual Saturday.
- Provides calls to action for booking, the heritage trail section, schedule, and routes.
- Explains the tour and meeting point.
- Shows six heritage-site profiles with images, short descriptions, and historical background.
- Provides a static photo gallery with a tab for each site and an image lightbox.
- Shows an interactive map with the Main Mall start/end point and heritage markers. Selecting a marker shows site details.
- Includes scroll-reveal effects and the custom bicycle cursor effect.

The homepage gallery is built into the website from local/static site data. It is distinct from `/gallery`, whose published entries come from the backend.

### Reserve — `/schedule`

- One combined section, "When would you like to ride?", holds both rides: the guided Heritage City Ride (Wednesday–Friday, 9:00 AM or 2:00 PM, maximum 10 riders) and the flexible Casual Saturday ride. Each card shows the live price per rider (from the backend routes endpoint), duration, distance and sites, a rider stepper with the running total, and a Book button that opens `/book`.
- A "Next ride" line and a live Gaborone clock are worked out from the current Gaborone time; the week-at-a-glance strip marks today.
- Below: meeting point (Main Mall, Gaborone City Centre), route map and ride statistics, "What's included" comparison table, lessons note and common questions.
- `/pricing` redirects to `/schedule#pricing`; `/routes` redirects to `/book`.

### Heritage trail — `/heritage-trail`

- "Six stops. Six perspectives." Six folders side by side; clicking one opens it (the others fold aside) with a photo roundabout, the story, address and optional videos. Previous, Next, Close and Escape work; each opened folder links to `/gallery/:siteId`.
- The map dynamically loads the generated cycling-street route, animates a bicycle and ridden-progress line, and pauses at each heritage site. Play/Pause, Restart, speed, Follow, site selection and Reset view are available. Playback pauses when the page is hidden or the map is off-screen; reduced-motion users start playback manually. If route data is unavailable, the map shows its original straight-line route with no moving bicycle. Home and booking maps never enable trail playback.

### Gallery — `/gallery`

- "Six sites. One living story.": a 3D roundabout of the six heritage sites (the front slide shows the number and name), details for the site in front, and six route buttons. Each button, and the front photo, opens that site's own page.
- Rider photo stories and the featured heritage-photo carousel share the top row; the two panels have matching dimensions on desktop. Selecting any site photo in the carousel opens that site's history and photo page. The full-width Gallery follows below with the website photo portfolio, initially showing ten images and a "Load more images" control, plus team-published videos and articles (`GET /api/content`). New rider uploads use the public Vercel Blob store and appear in the Gallery after staff approval; approval enables public downloads. Legacy private-store uploads remain accessible through short-lived signed API links.

### Site gallery — `/gallery/:siteId`

- Header with the site's number, address, tagline and history; a photo grid with a count, "Load more photos" and a full-size viewer; videos if the site has any; approved rider photos tagged to the site; nearby food stops; a call to action to the Reserve page. Unknown ids redirect to `/gallery`.

### Reviews and messages — `/connect`

- Score summary, filter pills, sorting and review cards, all computed from approved reviews (empty state when none). A "Verified rider" badge only appears when the reviewer's phone number matches a booking staff checked in. Customers can mark reviews helpful, share a review, and see the team's reply with its time.
- The composer (signed-in customers) takes a star rating, ride, origin, ride date, stops, highlight tags, a story and an optional photo. New reviews wait for approval in the admin dashboard.
- "Message the team" is a chat with day dividers and times; it refreshes about every 20 seconds.

### Sign in — `/login` and `/login/callback`

- Email and password; phone and WhatsApp one-time codes (a 6-digit code valid for 10 minutes, with rate limits; SMS goes through Twilio and/or Infobip with fallback, WhatsApp through Twilio); Google through Neon Auth; Facebook and Apple through NextAuth. Social buttons open the backend page `/customer-social`, which starts the right flow and returns to `/login/callback#token=...`. After sign-in the customer lands on `/dashboard`.

### Customer dashboard — `/dashboard`

- Welcome, profile (name, email, phone, picture), sign-out, quick links, the customer's own reviews and media, and upcoming/past bookings with status, Gaborone ride date, price snapshot, payment state, calendar download and cancellation where within the cancellation window. Signed-out visitors are sent to `/login?next=/dashboard`.

### Password reset

- `/forgot-password` requests a one-time reset email without disclosing whether an account exists. Reset tokens are single-use and expire; the token is invalidated on password change.
- `/reset-password` validates the emailed token and accepts a replacement password.

### Legal pages — `/privacy`, `/terms`, `/data-deletion`

- Plain-language privacy policy, terms and data-deletion instructions, linked from the footer and required by Meta and Google for social sign-in.

### Booking — `/book`

The booking form requires a signed-in customer. No card details or online payment are collected.

Form content and behavior:

1. The rider selects a route, date, rider count and (where offered) preferred time.
2. The website displays the configured price and estimated total; the backend independently validates input, ride rules, availability and the authenticated customer.
3. On submit, the backend stores the request with its customer, price snapshot and pending status, and attempts customer/admin notifications.
4. On success the site displays a request reference and total. A pending request awaits staff confirmation; payment is due on the day.

Notification failures do not undo a stored booking. The customer can track its status in the dashboard and cancel while the configured cancellation window (24 hours by default) allows it.

### Ride pass — `/ticket/:token`

- Calls the backend ticket endpoint with the signed token.
- Displays the rider, route, date, group size, pass reference, and meeting instructions only for a confirmed booking.
- Renders a QR code for the public ticket URL and supports printing.
- Shows an error state for invalid or unconfirmed passes.

The pass page uses the configured backend URL for its API call but displays the pass URL on the website origin.

### Website admin paths — `/admin/login` and `/admin`

When `VITE_API_BASE_URL` is set, these paths redirect the browser to the corresponding backend page. Without that variable, the older frontend-local admin UI is used; its same-origin API calls are not suitable for the separate-origin production setup.

## 3. Backend pages and admin

### Admin login — backend `/admin/login`

- Authenticates the provisioned administrator using NextAuth credentials.
- Checks that the signed-in account has the admin role; customer accounts are signed out and denied admin access.
- Redirects an already authenticated admin to `/admin`.

### Admin dashboard — backend `/admin`

Server-side session access is checked before rendering. The client dashboard supports:

- **Routes & prices:** change route name and BWP price. Saves go to the protected route-configuration API; the public website reads the new name and price when it next loads route data.
- **Bookings:** view request and account booking details, confirm/decline/cancel, resend confirmation email, record payment/refund/waiver, and inspect reminder status.
- **Email:** inspect recent delivery attempts and send a test email from Integrations.
- **Site content:** publish pictures, videos, or articles; hide/publish existing items; delete entries.
- **Media upload:** upload accepted image/video formats to Vercel Blob when configured. The API limits uploads to about 4 MB; the dashboard also allows a hosted URL for larger video.
- **Sign out:** ends the NextAuth session and returns to admin login.

When an admin confirms a website booking request, the backend changes its status to `confirmed`, assigns a stable booking code, and creates a signed ride-pass URL. Configured email and messaging providers receive the confirmation; attempts are logged. Admins can resend confirmations without changing the booking code. Payments are recorded manually, not collected online.

**Admin UI boundary:** the Next.js admin dashboard is the production admin surface. Some tools such as the camera scanner remain in the frontend-local admin UI and may not be exposed in a separate-origin deployment.

### Other backend pages

The backend no longer has public pages of its own (the old customer pages and sign-up form were removed). It serves only:

- **`/`** and **`/register`** — redirect to the website (`PUBLIC_FRONTEND_URL` or the first `FRONTEND_ORIGIN`). NextAuth sends failed or cancelled social sign-ins to `/register`, which returns them to the website's login page.
- **`/customer-social`** — a short hand-off page that starts Google (Neon Auth), Facebook or Apple sign-in and returns to the website with a token.
- **`/api/...`** and **`/admin/...`** — the API and the admin dashboard.

## 4. Booking lifecycle and event flow

### Public website request path

```text
Visitor opens /book
  → selects route, date, riders, contact details and notes
  → browser requires customer sign-in and checks route/date availability
  → POST backend /api/booking-requests
  → backend validates customer, route/date, availability and contact; snapshots price and saves status=pending
  → best-effort rider receipt + admin notification
  → customer sees request and status in /dashboard
  → admin reviews request in backend /admin
      ├─ decline/cancel → update status and attempt notification
      └─ confirm → update status, create signed pass, attempt confirmation message
                    → rider opens /ticket/:token and may add it to calendar
                    → staff checks QR pass on ride day
```

### Booking-request status values

- `pending` — newly submitted website request awaiting staff review.
- `confirmed` — approved by staff; a signed pass is created and confirmation notification is attempted.
- `declined` — staff cannot accommodate the request.
- `cancelled` — the request/ride has been cancelled.

The customer can cancel a booking within the cancellation window. Staff cancellation records the actor and timestamp; customer cancellation is audited and triggers a best-effort notification. Reminder jobs claim eligible bookings atomically to avoid duplicate sends.

### Legacy account-booking API

The Next.js backend also retains an account-based booking API:

1. A visitor creates an account or signs in on `/register`; optional Google, Apple, and Facebook providers are enabled only when their credentials are configured.
2. Booking parameters may be carried through the authentication redirect.
3. After authentication, `POST /api/bookings` validates category, date, slot, route and kid-rate selection server-side.
4. This API checks capacity (12 per date/time slot), calculates the configured category price, saves a confirmed booking, creates a signed pass, and attempts confirmation notifications.
5. `GET /api/bookings` returns the signed-in user’s bookings.

The Vite site's `/book` flow uses `/api/booking-requests`; the older `/api/bookings` API remains separate.

## 5. Backend API and supporting functions

| Endpoint | Purpose |
| --- | --- |
| `GET /api/health` | Checks database connectivity and reports connected/unavailable |
| `GET /api/routes-config` | Public route names, prices, and schedule configuration |
| `GET /api/content` | Public published gallery content |
| `POST /api/booking-requests` | Public website booking-request submission |
| `GET /api/customer/bookings` | List the signed-in customer's bookings |
| `POST /api/customer/bookings/:id/cancel` | Cancel an eligible customer booking |
| `POST /api/customer/password/forgot` | Request a password-reset email |
| `POST /api/customer/password/reset` | Consume a reset token and change password |
| `POST /api/cron/reminders` | Secret-protected daily reminder job |
| `POST /api/admin/email/test` | Send a test email to the signed-in staff member |
| `GET /api/admin/email` | Read provider configuration state and recent email-delivery attempts |
| `POST /api/admin/booking-requests/:id/payment` | Record, refund or waive a manual payment |
| `PATCH /api/admin/booking-requests/:id` | Admin update request, status, and rider details; confirmation creates a pass and sends notifications |
| `GET /api/admin/dashboard-summary` | Admin dashboard summary, request/booking data, routes, content, and monthly statistics |
| `PUT /api/admin/routes-config/:routeId` | Admin update route configuration |
| `GET/POST /api/admin/content` | Admin list/create content |
| `PATCH/DELETE /api/admin/content/:id` | Admin edit visibility/details or delete content |
| `POST /api/admin/upload` | Admin upload to Vercel Blob |
| `POST /api/admin/ai/draft` | Optional admin article draft using the configured Anthropic API key |
| `GET/POST /api/auth/*` | NextAuth session, sign-in, sign-out, and callbacks |
| `POST /api/auth/register` | Create a customer account; registration cannot grant admin role |
| `GET/POST /api/bookings` | Legacy account-based booking list/create |
| `GET /api/availability` | Legacy account booking availability by date and time slot |
| `PATCH /api/admin/bookings/:id` | Admin change legacy account-booking status |
| `POST /api/admin/check-in` | Admin validate and redeem a signed pass once, on its ride date in Gaborone |
| `GET /api/tickets/:token` | Return public details for a confirmed signed pass |
| `POST /api/webhooks/whatsapp` | Twilio inbound WhatsApp webhook; replies with the sender’s latest request status |

Public website endpoints use CORS configured through `FRONTEND_ORIGIN`. Set it to the exact website origin (scheme and hostname, no path or trailing slash); multiple origins can be comma-separated. Admin APIs are session-protected.

## 6. Data and integrations

- **PostgreSQL / Neon:** stores users, account bookings, public website booking requests, route configuration, and site content.
- **NextAuth:** credentials-based authentication and JWT sessions; optional OAuth providers depend on deployment configuration.
- **Email:** Resend or SMTP for account, booking, reset, review, upload and reminder messages; delivery attempts are logged. See [EMAIL-SETUP.md](./EMAIL-SETUP.md).
- **Twilio:** optional WhatsApp/SMS rider and admin notifications and the inbound WhatsApp status webhook. WhatsApp production use requires an approved sender/templates; a sandbox is for testing.
- **Vercel Blob:** optional public media storage for admin uploads.
- **Anthropic API:** optional article drafting from the admin tool/API.
- **Maps and QR:** the Vite site displays a heritage map; QR passes are generated client-side from signed pass URLs and validated by the backend.

The booking total is snapshotted from the route price at submission. Payment is manual and due on the ride day; no online payment provider is integrated. See [PAYMENTS.md](./PAYMENTS.md).

## 7. Configuration and operational notes

- Website build variable: `VITE_API_BASE_URL` — backend public origin, without a trailing slash.
- Backend variables include `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `PUBLIC_BACKEND_URL`, `FRONTEND_ORIGIN`, Twilio credentials/numbers, and optional Blob/Anthropic credentials.
- `PUBLIC_FRONTEND_URL` is used when generating ride-pass links; set it to the website origin.
- Admin provisioning uses `ADMIN_EMAIL`, `ADMIN_NAME`, and `ADMIN_PASSWORD` locally with the migration and provisioning scripts. Do not expose these values in the website build or commit `.env`.
- Database migrations must be applied before the backend can serve database-backed pages and APIs.
- Rate limiting for public booking requests is per server process/instance and is best-effort in a serverless deployment.
- Vercel function upload request limits mean larger videos should be hosted elsewhere and linked.

## 8. Current implementation boundaries

- Booking buttons on `/schedule` open `/book`, which is the functional request path.
- Confirmation is staff-mediated. The request reserves availability but does not collect payment.
- The backend's older account-booking API (`/api/bookings`, `/api/availability`) remains separate from the Vite booking-request flow.
- Live routes/content require a reachable backend and database; the website starts with local static route data as a fallback and shows a notice if the live fetch fails.
