# Social login troubleshooting

## Current flow

The frontend requests `/api/customer/providers` and disables social buttons when that request fails or the provider is not configured. The Login page currently starts OAuth through the backend NextAuth route `/api/auth/signin/{provider}`, then returns through `/api/customer/social/complete`.

A Neon Auth JWT verifier elsewhere in the backend does not, by itself, wire the Google button to Neon Auth. Verify the intended provider architecture before changing the sign-in route.

## Diagnose in order

1. Open browser DevTools → Network and reload the login page.
2. Inspect `/api/customer/providers`. A network error, CORS rejection, or non-2xx response can make every social button appear disabled.
3. Open `/api/auth/providers` on the backend. Confirm the expected OAuth providers are registered.
4. Click a configured provider and follow the redirect chain through the provider's consent page, backend callback, `/api/customer/social/complete`, and the frontend callback.
5. Review Render logs for OAuth callback, session, database, or token-exchange errors.

## Environment settings

Configure these in the backend hosting environment, never in committed files containing real secrets:

- `FRONTEND_ORIGIN=https://city-bike-tours.vercel.app`
- `NEXTAUTH_URL=https://city-bike-tours.onrender.com` (use the actual public backend origin)
- `NEXTAUTH_SECRET` (strong random secret)
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- `FACEBOOK_CLIENT_ID` and `FACEBOOK_CLIENT_SECRET`, if Facebook is enabled
- `APPLE_CLIENT_ID` and `APPLE_CLIENT_SECRET`, if Apple is enabled
- `DATABASE_URL`

Set each OAuth provider's authorized redirect URI to the backend callback URL, for example `https://city-bike-tours.onrender.com/api/auth/callback/google` for Google. Use the actual public backend hostname.

For Vercel, set `VITE_API_BASE_URL` to the backend origin. If preview deployments are used, allow only the intended preview origins using the backend's supported CORS configuration.

## Neon Auth

If Google must use Neon Auth, configure Neon Auth and implement its browser sign-in, callback, and session/token exchange flow explicitly. Do not assume the existing NextAuth provider route uses Neon Auth. Keep administrator authentication behavior unchanged unless the migration is intentionally tested.

## Safety

Never commit OAuth secrets, database credentials, JWT signing keys, or production `.env` files. Do not run an unreviewed bootstrap schema against production; compare it with existing migrations and take a backup first.
