# Merge and deployment checklist

## Before merging

- [ ] Review the complete diff and confirm it contains no secrets or generated build output.
- [ ] Install dependencies and run the frontend production build.
- [ ] Install backend dependencies and run its production build.
- [ ] Verify the provider discovery endpoint and OAuth callback routes.
- [ ] Check CORS for the production frontend and any approved preview origins.
- [ ] Verify existing database migrations before applying new SQL.
- [ ] Confirm admin authentication still works independently of customer sign-in.

## Deployment environment

### Vercel frontend

- Set `VITE_API_BASE_URL=https://city-bike-tours.onrender.com` (or the actual backend origin).
- Redeploy after changing build-time environment variables.

### Render backend

- Set `FRONTEND_ORIGIN=https://city-bike-tours.vercel.app`.
- Set `NEXTAUTH_URL` to the public backend URL, not the Vercel frontend URL.
- Set a strong `NEXTAUTH_SECRET`, `DATABASE_URL`, and the credentials for each enabled OAuth provider.
- Add the exact backend callback URI to each provider's developer console.
- Configure optional CORS preview patterns narrowly; avoid broad wildcard origins.

## Troubleshooting notes

- The browser origin must exactly match `FRONTEND_ORIGIN`, including the hostname. Vercel preview URLs are different origins from the production domain.
- If using `CORS_ORIGIN_PATTERNS`, do not include a trailing slash. Keep patterns restricted to the project's trusted preview hostnames.
- If `/api/customer/providers` fails because of CORS or a backend error, the login page cannot determine which providers are enabled. Check the browser Network panel and Render logs.
- The current customer social entry point uses NextAuth. Setting up a provider in Neon Auth alone does not automatically configure the existing NextAuth buttons.
- Google, Facebook, and Apple credentials must each include both a client ID and a client secret in Render. Register callback URIs against the backend origin, not the Vercel frontend.
- Never commit real secrets. Rotate any credentials accidentally shared in logs, screenshots, messages, or repository history.

## Post-deployment smoke tests

1. Open `/api/customer/providers` and confirm it returns JSON with expected provider availability.
2. Open `/api/auth/providers` and confirm expected NextAuth providers are registered.
3. Test customer email registration and login.
4. Test each configured OAuth provider from a clean browser session.
5. Confirm OAuth returns to the frontend callback and establishes a customer session.
6. Test admin sign-in and protected routes.
7. Review Render and Vercel logs for errors.

A successful file commit is not proof of a successful production build or live OAuth integration. Verify both after deployment.
