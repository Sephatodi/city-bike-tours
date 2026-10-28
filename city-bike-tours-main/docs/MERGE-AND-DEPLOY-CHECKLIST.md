# Merge and deployment checklist

## Changes in this branch
- Make social sign-in start through the backend's `/customer-social?provider=...` router.
- Show a user-facing message when the provider-discovery request fails instead of silently leaving all social buttons disabled.
- Permit HTTP origins only for local development hosts; production origins must use HTTPS.
- Clarify the environment examples so `NEXTAUTH_URL` refers to the backend URL, not the Vercel frontend URL.
- Document the deployment and database checks needed before production rollout.

## Required Render configuration
Set these values in the Render backend service (use actual secrets in the Render dashboard; never commit them):
- `FRONTEND_ORIGIN=https://city-bike-tours.vercel.app`
- `NEXTAUTH_URL=https://city-bike-tours.onrender.com`
- `NEXTAUTH_SECRET` to a newly generated, private random secret
- `NEON_DATABASE_URL` (or the database variable the current app is configured to read)
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` for Google through the currently implemented NextAuth path
- `FACEBOOK_CLIENT_ID` and `FACEBOOK_CLIENT_SECRET` if Facebook is enabled
- `APPLE_CLIENT_ID` and `APPLE_CLIENT_SECRET` if Apple is enabled

The current `/customer-social` page calls `next-auth/react` and starts NextAuth. The existence of Neon Auth JWT-verification code alone does not switch Google login to Neon Auth. Do not configure Google exclusively in Neon Auth and expect this NextAuth button to use it without implementing and testing that integration.

## OAuth callback URLs
Register the backend callback URL with each provider:
- Google: `https://city-bike-tours.onrender.com/api/auth/callback/google`
- Facebook: `https://city-bike-tours.onrender.com/api/auth/callback/facebook`
- Apple: `https://city-bike-tours.onrender.com/api/auth/callback/apple`

Provider consoles must use the exact deployed backend URL and HTTPS. Confirm each provider's app status and permitted redirect domains.

## Required Vercel configuration
Set:
- `VITE_API_BASE_URL=https://city-bike-tours.onrender.com`

Redeploy the Vercel frontend after changing build-time environment variables. Configure CORS to include the exact production Vercel origin. Add preview-origin patterns only when they are narrowly scoped to your actual Vercel team/project hostname.

## Verification after deployment
1. Open `https://city-bike-tours.onrender.com/api/customer/providers`; expect HTTP 200 and booleans that match configured providers.
2. Open `https://city-bike-tours.onrender.com/api/auth/providers`; confirm the expected NextAuth providers are listed.
3. In browser DevTools, inspect the login page's request to `/api/customer/providers`. Resolve CORS or backend failures before investigating OAuth credentials.
4. Click each enabled provider and trace the redirect through its provider login, `/api/auth/callback/<provider>`, and `/api/customer/social/complete`.
5. Inspect Render logs for callback, session, database, or environment errors.
6. Run the repository's documented migration workflow against a backup/staging database first. Confirm the live `users` schema and migration history before applying any additional SQL. Do not run a full bootstrap schema blindly against a populated database.
7. Run dependency installation and production builds in CI or the project environment; this change has not been confirmed by a completed production build.

## Database safety
The SQL schema snapshot produced during troubleshooting is a reference, not a verified export of the live Neon schema. Compare it with the repository migrations and the actual database before applying it. Neon-managed `neon_auth` tables are owned by Neon Auth and should not be recreated by the application's public-schema bootstrap script.

## Security
Never commit `.env` files or real OAuth/database credentials. Keep secrets in Render, Vercel, and Neon settings. If a real secret was ever committed or shared, rotate it.
