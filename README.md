# City Bike Tours

## Local development

1. Configure PostgreSQL in `backend/.env` using `backend/.env.example`.
2. Apply the database migrations from the backend directory: `npm run db:migrate`.
3. Start the backend in one terminal: `cd backend && npm run dev`.
4. Start the Vite frontend from the repository root in another terminal: `npm run dev`.

In local development, Vite proxies `/api` requests to `http://localhost:3000`. Check the backend and database with `http://localhost:3000/api/health`, or check the full frontend-to-backend proxy at `http://localhost:5173/api/health`.

The booking form sends requests to `POST /api/booking-requests`. Requests are validated and stored with `pending` status in PostgreSQL. For separate production origins, set `FRONTEND_ORIGIN` in the backend environment and `VITE_API_BASE_URL` in the frontend build environment.

## Administrator access

Set `ADMIN_EMAIL`, `ADMIN_NAME`, and a unique `ADMIN_PASSWORD` (at least 12 characters) in `backend/.env`, apply the database migrations, then run `cd backend && npm run admin:provision`. Sign in at `http://localhost:3000/admin/login`. Public registration always creates a customer role and cannot grant administrator access.
