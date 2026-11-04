# Go-live checklist

## Domains and identity

- [ ] Add the production domain to the Vercel website project and verify DNS.
- [ ] Configure the `www` redirect to the chosen canonical domain.
- [ ] Update backend `FRONTEND_ORIGIN`, `PUBLIC_FRONTEND_URL` and `NEXTAUTH_URL`, plus `CORS_ORIGIN_PATTERNS` if used, to the final origins.
- [ ] Add the final domain to Neon Auth trusted domains.
- [ ] Update Google Cloud OAuth branding, authorized domains and redirect URIs.
- [ ] Update Meta App Domains and the privacy-policy and data-deletion URLs.
- [ ] Restrict the Mapbox token to the production website origin.

## Email, hosting and database

- [ ] Choose Resend or SMTP and set up SPF, DKIM and DMARC using records supplied by that email service.
- [ ] Send a test message from Admin → Integrations and verify a real inbox and reply address.
- [ ] Review the Render plan. Free instances sleep and can make a first booking time out; a paid always-on instance is recommended for a live business.
- [ ] Review the Neon plan, database limits and backup retention in the Neon console.
- [ ] Verify HTTPS and expected security headers on both production origins; run a database restore drill in staging.
- [ ] Apply registered backend migrations and verify `/api/health`.
- [ ] Set the same `CRON_SECRET` in the backend host and GitHub Actions.

### Environment-variable matrix (names only)

| Vercel website | Render backend |
| --- | --- |
| `VITE_API_BASE_URL` | `NEON_DATABASE_URL` |
| `VITE_CONTACT_EMAIL` | `FRONTEND_ORIGIN` |
| `VITE_MAPBOX_TOKEN` | `PUBLIC_FRONTEND_URL` |
| `FRONTEND_URL` (smoke test) | `PUBLIC_BACKEND_URL` |
| `BACKEND_URL` (smoke test) | `NEXTAUTH_URL` |
|  | `NEXTAUTH_SECRET` |
|  | `EMAIL_PROVIDER` |
|  | `RESEND_API_KEY` |
|  | `EMAIL_FROM` |
|  | `SMTP_HOST` |
|  | `SMTP_PORT` |
|  | `SMTP_USER` |
|  | `SMTP_PASS` |
|  | `SMTP_SECURE` |
|  | `ADMIN_NOTIFY_EMAILS` |
|  | `CRON_SECRET` |

## Scheduled reminders and monitoring

- [ ] Add GitHub repository secrets `BACKEND_URL` and `CRON_SECRET` for the daily reminder workflow.
- [ ] Confirm the workflow runs at 07:00 UTC (09:00 Africa/Gaborone); use `workflow_dispatch` for a controlled manual run.
- [ ] Alternatively, configure a host cron job to POST `/api/cron/reminders` daily with the `CRON_SECRET` bearer token.
- [ ] Configure an uptime monitor for `/api/health` and alert on non-2xx responses.
- [ ] Run `FRONTEND_URL=... BACKEND_URL=... npm run smoke` against the deployed origins.

## Customer journey

| Done | Check |
| --- | --- |
| [ ] | Open the website |
| [ ] | Register a customer |
| [ ] | Sign in |
| [ ] | Select a tour |
| [ ] | Calculate the price |
| [ ] | Submit a booking |
| [ ] | Send a message |
| [ ] | Submit a review |
| [ ] | Upload a photo |
| [ ] | Approve a photo in admin |
| [ ] | Reject a photo in admin |
| [ ] | Open the map |
| [ ] | Test on a mobile device |
| [ ] | Sign in to admin |
| [ ] | Request and complete a password reset |
| [ ] | Cancel an eligible booking and confirm an inside-window cancellation is blocked |
| [ ] | Confirm the reminder arrives for a booking scheduled tomorrow in Gaborone |
| [ ] | Record a payment and verify the audit entry |
| [ ] | Delete a test customer's data and inspect booking/review anonymization |

## Rollback

- [ ] Keep the previous frontend and backend deployment identifiers.
- [ ] Roll back application deployments independently; do not reverse additive database migrations automatically.
- [ ] Disable the reminder workflow or remove its cron schedule if it sends incorrect notifications.
- [ ] Preserve the latest encrypted database backup and restore only after confirming the target environment.
- [ ] Rotate compromised credentials at their provider, then redeploy; never commit replacement values.
