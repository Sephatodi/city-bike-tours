# Customer social sign-in setup

City Bike Tours keeps customer and administrator authentication separate.

- **Customers:** Neon Auth manages Google social sign-in. The backend exchanges the authenticated Neon identity for a City Bike Tours customer token.
- **Administrators and staff:** NextAuth credentials, MFA and database-backed roles remain unchanged. Customer identities cannot receive staff roles through the customer callback.

## Backend environment

Set these values on the backend deployment:

- `AUTH_URL`: Neon Auth URL for the intended Neon branch.
- `NEON_AUTH_COOKIE_SECRET`: unique random secret of at least 32 characters.
- `FRONTEND_ORIGIN`: production website origin; add approved preview origins only when required.

Never commit real values or expose secrets in frontend `VITE_*` variables.

## Neon Console

1. Enable Neon Auth for the intended database branch.
2. Enable Google as a social provider and configure its OAuth client credentials in Neon Auth.
3. Configure the allowed application/callback origins in Neon Auth.
4. Copy the branch's Neon Auth URL into `AUTH_URL`.
5. Generate a strong cookie secret and set `NEON_AUTH_COOKIE_SECRET` on the backend.

## Sign-in flow

The backend uses `@neondatabase/auth/next/server` and proxies Better Auth-compatible requests at `/api/neon-auth/*`. The website starts Google sign-in through that backend proxy with credentialed requests. Google sign-in returns to `/api/customer/neon/complete`, where the backend checks the Neon Auth session, maps the identity to a customer record, rejects staff identities, and issues the existing customer token.

Facebook and Apple continue through the backend's `/customer-social` page and NextAuth OAuth providers. Do not configure Google as a NextAuth customer provider.

## Verification

- `GET /api/customer/providers` returns `google: true` and `googleVia: "neon"` only when Neon Auth is configured.
- Browser auth requests are proxied through the backend.
- Successful Google sign-in lands on `/dashboard`.
- Staff accounts are rejected by the customer completion endpoint.
- Facebook and Apple continue through `/customer-social?provider=...`.
