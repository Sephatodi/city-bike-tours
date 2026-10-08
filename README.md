# City Bike Tours

See [the application functionality and user-flow guide](./docs/APP-FUNCTIONALITY-AND-FLOWS.md) for a page-by-page description of the website, backend, and booking processes.

## Local development

1. Configure Neon in `backend/.env` using `backend/.env.example`.
2. Apply the database migrations from the backend directory: `cd backend && npm run db:migrate`. This uses Neon's HTTP driver.
3. Start the backend in one terminal: `cd backend && npm run dev`.
4. Start the Vite frontend from the repository root in another terminal: `npm run dev`.

In local development, Vite proxies `/api` requests to `http://localhost:3000`. Check the backend and database with `http://localhost:3000/api/health`, or check the full frontend-to-backend proxy at `http://localhost:5173/api/health`.

The booking form sends requests to `POST /api/booking-requests`. Requests are validated and stored with `pending` status in PostgreSQL. For separate production origins, set `FRONTEND_ORIGIN` in the backend environment and `VITE_API_BASE_URL` in the frontend build environment.

## Production deployment

Deploy two Vercel projects from this repository. Set the backend project's Root Directory to `backend` and deploy it as Next.js. Set the website project's Root Directory to the repository root, build with `npm run build`, and publish `dist`. The root `vercel.json` rewrites client-side routes such as `/book` and `/gallery` to the Vite app.

Set the backend's `NEXTAUTH_URL` and `PUBLIC_BACKEND_URL` to its public origin, and set `FRONTEND_ORIGIN` (and `PUBLIC_FRONTEND_URL` for ride-pass links) to the website origin. Set `VITE_API_BASE_URL` to the backend origin in the website project's build environment. The website then loads current route names and prices plus published gallery content from the backend; its Admin link opens the backend sign-in page. Redeploy after changing environment variables.

## Administrator access

Set `ADMIN_EMAIL`, `ADMIN_NAME`, and a unique `ADMIN_PASSWORD` (at least 12 characters) in `backend/.env`, apply the database migrations, then run `cd backend && npm run admin:provision`. With the backend running locally on port 3000, sign in at `http://localhost:3000/admin/login`. In production, the website footer's Admin Login link opens the backend login page. Public registration always creates a customer role and cannot grant administrator access.

## Ride passes and check-in

After a booking is confirmed, the customer receives a signed ride-pass link by each configured Twilio channel. The link opens a QR pass at `/ticket/:token`; the backend exposes an admin check-in API for validating and redeeming passes once, on the scheduled date in Gaborone. The camera scanner exists in the frontend-local admin UI but is not currently exposed by the separate backend admin dashboard used in production.

Before enabling check-in, apply migrations from the `backend` directory with `npm run db:migrate`. Set `PUBLIC_FRONTEND_URL` to the public Vite site origin and configure a stable `RIDE_PASS_SECRET` (or retain the same `NEXTAUTH_SECRET` across deployments). WhatsApp requires `TWILIO_WHATSAPP_FROM` and an approved `TWILIO_WHATSAPP_CONTENT_SID` template with placeholders `{{1}}` rider, `{{2}}` route, `{{3}}` date, `{{4}}` riders, `{{5}}` pass URL, and `{{6}}` reference. SMS also requires an SMS-capable `TWILIO_PHONE_NUMBER`. Camera scanning requires HTTPS in production.
