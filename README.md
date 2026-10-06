# City Bike Tours

## Local development

1. Configure PostgreSQL in `backend/.env` using `backend/.env.example`.
2. Apply the database migrations from the backend directory: `npm run db:migrate`.
3. Start the backend in one terminal: `cd backend && npm run dev`.
4. Start the Vite frontend from the repository root in another terminal: `npm run dev`.

In local development, Vite proxies `/api` requests to `http://localhost:3000`. Check the backend and database with `http://localhost:3000/api/health`, or check the full frontend-to-backend proxy at `http://localhost:5173/api/health`.

The booking form sends requests to `POST /api/booking-requests`. Requests are validated and stored with `pending` status in PostgreSQL. For separate production origins, set `FRONTEND_ORIGIN` in the backend environment and `VITE_API_BASE_URL` in the frontend build environment.

## Administrator access

Set `ADMIN_EMAIL`, `ADMIN_NAME`, and a unique `ADMIN_PASSWORD` (at least 12 characters) in `backend/.env`, apply the database migrations, then run `cd backend && npm run admin:provision`. Sign in at `http://localhost:5173/admin/login`; the frontend proxies authentication and admin requests to the backend. Public registration always creates a customer role and cannot grant administrator access.

## Ride passes and check-in

After a booking is confirmed, the customer receives a signed ride-pass link by each configured Twilio channel. The link opens a QR pass at `/ticket/:token`; staff can use **Ride check-in** in the admin dashboard to scan it. Passes can only be redeemed once, for a confirmed booking on its scheduled date in Gaborone.

Before enabling check-in, apply migrations from the active `city-tours-backend` directory with `npm run db:migrate`. Set `PUBLIC_FRONTEND_URL` to the public Vite site origin and configure a stable `RIDE_PASS_SECRET` (or retain the same `NEXTAUTH_SECRET` across deployments). WhatsApp requires `TWILIO_WHATSAPP_FROM` and an approved `TWILIO_WHATSAPP_CONTENT_SID` template with placeholders `{{1}}` rider, `{{2}}` route, `{{3}}` date, `{{4}}` riders, `{{5}}` pass URL, and `{{6}}` reference. SMS also requires an SMS-capable `TWILIO_PHONE_NUMBER`. Camera scanning requires HTTPS in production.
