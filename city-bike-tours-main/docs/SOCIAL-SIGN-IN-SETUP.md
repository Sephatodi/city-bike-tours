# Social sign-in setup (step by step)

How it works in this project:

| Button | Handled by | You need |
|---|---|---|
| **Google** | **Neon Auth** (Managed Better Auth) | Steps 1–6 below (Google works in development with no Google keys at all) |
| **Facebook**, **Apple** | NextAuth (already in the backend) | Keys in `backend/.env` (see "Facebook and Apple") |
| WhatsApp, phone | one-time codes | already built in |

Neon Auth only supports Google, GitHub and Vercel, so Facebook and Apple cannot go through it.
If `NEON_AUTH_BASE_URL` is not set, the Google button falls back to `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`.
A button stays dimmed ("Not set up yet") until its method is configured.

Everything below uses `http://localhost:3000` for the backend and `http://localhost:5173` for the website.

## 1. Enable Neon Auth
1. Open https://console.neon.tech and choose your project and branch.
2. Open **Auth** and click **Enable Auth**.
3. Copy the **Auth URL** (Settings > Auth > Project Info). It looks like
   `https://ep-xxxx.neonauth.us-east-1.aws.neon.tech/neondb/auth`.

## 2. Trust your backend address
In the Neon Console go to **Auth > Configuration > Domains** (trusted domains) and add:
- `http://localhost:3000` (development)
- your live backend URL, for example `https://your-backend.vercel.app` (production)

Without this, Neon refuses to send people back to the site after Google sign-in.

## 3. Fill in `backend/.env`
```
NEON_AUTH_BASE_URL="<the Auth URL from step 1, no trailing slash>"
NEON_AUTH_COOKIE_SECRET="<output of: openssl rand -base64 32>"
FRONTEND_ORIGIN=http://localhost:5173
NEXTAUTH_SECRET="<output of: openssl rand -base64 32>"
NEXTAUTH_URL=http://localhost:3000
DATABASE_URL=<your Neon connection string>
```
Then create the tables once: `cd backend && npm run db:migrate`.

## 4. Install and run
```
cd backend
npm install        # the .npmrc in this folder allows the Neon Auth beta on Next 15
npm run dev
```
In a second terminal, from the project root: `npm install && npm run dev`.
Safari blocks cookies on plain http, so test in Chrome or Firefox, or run both servers over https.

## 5. Test Google sign-in
1. Open http://localhost:5173/login and click **Continue with Google**.
2. You should land on Google, then come back to the site signed in.
3. In Neon, the new person appears in the `neon_auth` tables, and in your own `users` table as a customer.

In development Google uses Neon's shared Google app, so the consent screen shows Neon's name. That is fine for testing.

If it fails, the website shows an error on `/login/callback`. Check the backend terminal:
- `NETWORK_DNS` means `NEON_AUTH_BASE_URL` is wrong.
- A redirect or "origin not allowed" message means step 2 is missing the backend address.

## 6. Going live with your own Google app
1. Open https://console.cloud.google.com/apis/credentials and create an **OAuth client ID** (type: Web application).
2. Authorised redirect URI, exactly: `<NEON_AUTH_BASE_URL>/callback/google`
   (this is Neon's address, not your website's; a mismatch gives `redirect_uri_mismatch`).
3. Fill in the OAuth consent screen (app name, support email, your domain) and publish it, otherwise only listed test users can sign in.
4. In the Neon Console go to **Auth > OAuth providers > Add OAuth provider**, choose Google, and paste the Client ID and Client Secret.
5. In your host (Vercel), set `NEON_AUTH_BASE_URL`, `NEON_AUTH_COOKIE_SECRET`, `FRONTEND_ORIGIN` (your website URL), `NEXTAUTH_SECRET`, `NEXTAUTH_URL` and `DATABASE_URL`, then redeploy the backend.
6. Each Neon branch has its own Auth URL, so repeat steps 1, 2 and 4 for every branch you use.

## Facebook and Apple (NextAuth)
**Facebook**
1. https://developers.facebook.com/apps: create an app and add **Facebook Login**.
2. Valid OAuth redirect URI: `<backend origin>/api/auth/callback/facebook`
3. Set `FACEBOOK_CLIENT_ID` and `FACEBOOK_CLIENT_SECRET` in `backend/.env`.
4. Switch the app from Development to Live so everyone can sign in.

**Apple** needs an Apple Developer account. Redirect URI: `<backend origin>/api/auth/callback/apple`.
Set `APPLE_CLIENT_ID` and `APPLE_CLIENT_SECRET` (the signed JWT described in `backend/lib/auth.js`).

## Adding GitHub later
Create a GitHub OAuth App with callback URL `<NEON_AUTH_BASE_URL>/callback/github`, add it under Auth > OAuth providers in the Neon Console, then add a button for it in `src/pages/LoginPage.jsx` and allow `"github"` in `backend/app/(site)/customer-social/page.js`.

## Facebook: filling in the Meta app screen
Website pages Meta asks for already exist: `/privacy`, `/terms` and `/data-deletion` (your live website address plus those paths).
1. App settings > Basic: App domains = your website domain (no https://), Privacy Policy URL = `<website>/privacy`, Terms of Service URL = `<website>/terms`, User data deletion = "Data deletion instructions URL" with `<website>/data-deletion`, Category = Travel or Business and pages. Save changes.
2. Facebook Login > Settings: Valid OAuth Redirect URIs = `<backend origin>/api/auth/callback/facebook`.
3. Copy the App ID and App secret into `FACEBOOK_CLIENT_ID` and `FACEBOOK_CLIENT_SECRET` in `backend/.env`.
4. Add the permissions `email` and `public_profile` (both are standard and need no app review).
5. While the app is in Development mode only people with a role on the app can sign in. Add testers under App roles, test, then switch the app to Live.

## Hosting checklist (website on Vercel, backend on Render)
Render (backend) environment:
- `FRONTEND_ORIGIN` = your website address exactly, e.g. `https://your-site.vercel.app` (no trailing slash; several allowed, comma separated).
- `CORS_ORIGIN_PATTERNS` (optional) = `https://city-bike-tours-*-aobakwe-xolanis-projects.vercel.app` so Vercel preview deployments are allowed too.
- `NEXTAUTH_URL` = `https://city-bike-tours.onrender.com`, plus `NEXTAUTH_SECRET`, `NEON_AUTH_BASE_URL`, `NEON_AUTH_COOKIE_SECRET`, your database URL, and `FACEBOOK_CLIENT_ID` / `FACEBOOK_CLIENT_SECRET`.
- Neon Console > Auth > trusted domains: add `https://city-bike-tours.onrender.com`.

Database: run `cd backend && npm run db:migrate` against the production database. Migration `0015_managed_auth_identity`
(adds `users.managed_auth_id`) is now registered in `db/migrations/meta/_journal.json`; before, Drizzle skipped it,
which caused `column "managed_auth_id" of relation "users" does not exist`. The migration is safe to re-run and
tolerates a column or index that was already added by hand.

Note: `app/api/customer/auth/exchange` and `lib/neon-auth.js` (a token-exchange design) are kept but nothing on the website calls them.
Google sign-in uses the server-driven flow in `lib/neon-auth-server.js`.
