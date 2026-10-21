# City Bike Tours

See [the application functionality and user-flow guide](./docs/APP-FUNCTIONALITY-AND-FLOWS.md) for a page-by-page description of the website, backend, and booking processes.

## Local development

1. Configure Neon in `backend/.env` using `backend/.env.example`.
2. Apply the database migrations from the backend directory: `cd backend && npm run db:migrate`. This uses Neon's HTTP driver.
3. Start the backend in one terminal: `cd backend && npm run dev`.
4. Start the Vite frontend from the repository root in another terminal: `npm run dev`.

In local development, Vite proxies `/api` requests to `http://localhost:3000`. Check the backend and database with `http://localhost:3000/api/health`, or check the full frontend-to-backend proxy at `http://localhost:5173/api/health`.

The booking form sends requests to `POST /api/booking-requests`. Requests are validated and stored with `pending` status in Neon. Phone numbers are validated and normalized to E.164, using Botswana as the default region; international numbers can include a `+` country code. Active pending and confirmed reservations share the 12-rider daily capacity across routes and times; full dates are blocked in the booking form and rechecked by the API. Booking confirmations rotate through three WhatsApp messages in order (A, B, C) using a PostgreSQL sequence shared across serverless instances. Each includes the booking-specific ride-pass link that opens the customer's unique QR code. Set `TWILIO_WHATSAPP_FROM`, Twilio credentials, and `PUBLIC_FRONTEND_URL` in the backend environment; Twilio trial accounts also require the customer's WhatsApp number to be verified and opted into the sandbox. For confirmations outside WhatsApp's customer-service window, create an approved Twilio Content Template for each message using variables `{{1}}` name, `{{2}}` date, `{{3}}` time, `{{4}}` group size, `{{5}}` ride-pass link, then configure `TWILIO_WHATSAPP_CONTENT_SID_A`, `TWILIO_WHATSAPP_CONTENT_SID_B`, and `TWILIO_WHATSAPP_CONTENT_SID_C`. Without the corresponding SID configured, the app sends the message body directly (only permitted inside WhatsApp's 24-hour customer-service window). Option C's expanded message can exceed 160 characters because it includes the unique ride-pass URL. For separate production origins, set `FRONTEND_ORIGIN` in the backend environment and `VITE_API_BASE_URL` in the frontend build environment.

## Production deployment

Deploy two Vercel projects from this repository. Set the backend project's Root Directory to `backend` and deploy it as Next.js. Set the website project's Root Directory to the repository root, build with `npm run build`, and publish `dist`. The root `vercel.json` rewrites client-side routes such as `/book` and `/gallery` to the Vite app.

Set the backend's `NEXTAUTH_URL` and `PUBLIC_BACKEND_URL` to its public origin, and set `FRONTEND_ORIGIN` (and `PUBLIC_FRONTEND_URL` for ride-pass links) to the website origin, including the scheme (for example, `https://city-bike-tours.vercel.app`) and without a path or trailing slash. For multiple website origins, use a comma-separated list. Set `VITE_API_BASE_URL` to the backend origin in the website project's build environment. The website then loads current route names and prices plus published gallery content from the backend; its Admin link opens the backend sign-in page. Redeploy the backend after changing its environment variables and rebuild the website after changing its build variables.

## Administrator access

Set `ADMIN_EMAIL`, `ADMIN_NAME`, and a unique `ADMIN_PASSWORD` (at least 12 characters) in `backend/.env`, apply the database migrations, then run `cd backend && npm run admin:provision`. With the backend running locally on port 3000, sign in at `http://localhost:3000/admin/login`. In production, the website footer's Admin Login link opens the backend login page. Public registration always creates a customer role and cannot grant administrator access.

## Ride passes and check-in

After a booking is confirmed, the customer receives a signed ride-pass link by each configured Twilio channel. The link opens a QR pass at `/ticket/:token`; the backend exposes an admin check-in API for validating and redeeming passes once, on the scheduled date in Gaborone. The camera scanner exists in the frontend-local admin UI but is not currently exposed by the separate backend admin dashboard used in production.

Before enabling check-in, apply migrations from the `backend` directory with `npm run db:migrate`. Set `PUBLIC_FRONTEND_URL` to the public Vite site origin and configure a stable `RIDE_PASS_SECRET` (or retain the same `NEXTAUTH_SECRET` across deployments). WhatsApp requires `TWILIO_WHATSAPP_FROM` and an approved `TWILIO_WHATSAPP_CONTENT_SID` template with placeholders `{{1}}` rider, `{{2}}` route, `{{3}}` date, `{{4}}` riders, `{{5}}` pass URL, and `{{6}}` reference. SMS also requires an SMS-capable `TWILIO_PHONE_NUMBER`. Camera scanning requires HTTPS in production.

## Customer accounts, reviews, messages and rider photos

- **Pages:** `/login` (create account / sign in), `/connect` (message the team, leave a review, read replies) and the rider-stories section of `/gallery`. `/routes` redirects to `/book`; `/pricing` redirects to `/schedule#pricing`.
- **Sign-in methods:** email + password always works. Google, Facebook and Apple work once their env vars are set (see `backend/.env.example`); phone (SMS) and WhatsApp codes need the Twilio variables. Buttons for methods that aren't configured are shown disabled. Running locally without Twilio, the code is printed in the backend console and shown on the page.
- **Database:** run `cd backend && npm run db:migrate` (adds `customer_messages`, `otp_codes`, `community_photos` and review reply columns).
- **Moderation:** in the admin dashboard, **Customers → Inbox & reviews** now has *Rider chats* (reply to messages), *Reviews* (approve, reply, hide) and *Rider photos* (approve, hide, delete). Riders' reviews and photos appear publicly only after approval.
- **Photos:** rider uploads go to Vercel Blob (`BLOB_READ_WRITE_TOKEN`) under `city-tours-community/`, separate from the team's media library. The team's gallery pictures are the built-in site photos plus *Picture* items posted from **Website → Content**. Both galleries have download buttons.
- **CORS:** the backend now allows the `Authorization` header and `PATCH`/`DELETE` from `FRONTEND_ORIGIN`.

### Photo downloads and booking

- Booking now needs an account: `POST /api/booking-requests` returns 401 without a signed-in rider's token.
- Downloads are off by default. Staff turn them on per photo: **Website → Content** (tick "Let signed-in riders download this picture") for the team's pictures, and **Inbox & reviews → Rider photos → Allow download** for rider photos. `GET /api/download` checks the rider is signed in and the photo is allowed. The built-in site photos have no download button.
- Run `cd backend && npm run db:migrate` again: migration `0014_downloadable_photos` adds the download switch.
- Food stops on the Reserve page are listed in `src/data.js` (`FOOD_STOPS`); edit them to match the stops you use.
