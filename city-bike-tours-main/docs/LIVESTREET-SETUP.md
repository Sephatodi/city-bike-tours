# Livestreet API Setup

> **Note:** "Livestreet" is not a widely-recognised product name. Confirm the vendor before wiring anything (see candidates below).

## Candidate A — Google Street View Static API (most likely)
1. Get a key: https://console.cloud.google.com → Enable "Street View Static API" (and "Maps JavaScript API" if interactive). Create an API key under APIs & Services → Credentials.
2. Restrict the key: HTTP referrers (e.g. `https://yourdomain.com/*`, `https://*.vercel.app/*`, `http://localhost:5173/*`). Restrict API restrictions to the enabled APIs. Enable billing.
3. Env vars:
   - Frontend (Vite, build-time, inlined): `VITE_LIVESTREET_KEY=` in `.env.local` (git-ignored) and in Vercel → Project → Settings → Environment Variables.
   - Backend-only (if proxying): `LIVESTREET_KEY=` (never expose to client).
4. Add to `.env.example` (committed, empty values): `VITE_LIVESTREET_KEY=`
5. Attribution required: Google logo and "© Google" must remain visible. Read [Maps Platform Terms](https://cloud.google.com/maps-platform/terms).
6. Troubleshooting: `403 Forbidden` (wrong referrer/billing), `REQUEST_DENIED` (API not enabled), `OVER_QUERY_LIMIT` (quota), blank tile (swap to lat,lng), works locally but not on Vercel (redeploy after adding env).

## Candidate B — Mapillary
1. Get client token: https://www.mapillary.com/dashboard/developers
2. Endpoint: `https://graph.mapillary.com/images?access_token=<TOKEN>&fields=id,thumb_1024_url,captured_at,compass_angle&bbox=<west,south,east,north>`
3. Attribution: "© Mapillary contributors" (CC-BY-SA)
4. Env: `VITE_MAPILLARY_TOKEN=`

**Rule:** Never commit keys. Add to `.env.example` and `.gitignore` as appropriate.
