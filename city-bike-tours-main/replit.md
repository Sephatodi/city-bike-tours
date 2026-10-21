# Running on Replit

The website preview runs with the `Start application` workflow on port 5000.
It serves the Vite frontend from this directory.

The frontend proxies `/api` requests to the backend on port 3000. To run the
backend separately, use `cd backend && npm run dev` from this directory. The
backend requires a valid Neon `NEON_DATABASE_URL` Secret (or `DATABASE_URL` in
environments where it is not reserved); without it, live route/content data,
bookings, and account features will not work.

For local frontend development outside the Replit workflow, run:

```sh
npm run dev -- --host 0.0.0.0 --port 5000
```
