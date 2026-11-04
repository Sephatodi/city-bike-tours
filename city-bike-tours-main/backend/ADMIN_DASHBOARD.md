# Admin dashboard

## Set up (once)
1. `npm install`
2. Copy `.env.example` to `.env`; set `NEON_DATABASE_URL` (or `DATABASE_URL`), `NEXTAUTH_SECRET`, and `NEXTAUTH_URL`.
3. `npm run db:migrate` (applies migrations 0011 and 0012: roles/status/team/two-step columns, audit log,
   settings, sign-in log, blocked IPs, page views, enquiries, reviews, subscribers, SEO pages).
4. `npm run admin:provision`, then `npm run dev` and open `/admin/login`.

The dashboard is a separate root layout (`app/(admin)`). The public site lives in `app/(site)`.
The public header, footer and global CSS never load on `/admin`.

## Sections
| Area | Pages |
|---|---|
| Dashboard | Overview, Website traffic, Bookings, Check-in |
| Customers | Inbox & reviews (enquiries, rider chats, review approval with the rider's photo, ride, origin and stops, rider photos, subscribers), Messages (riders on a date, or subscribers) |
| Website | Routes & prices, Content, Media library, Search (SEO) |
| Administration | Users & roles (+ teams, two-step reset and customer-data deletion), Site settings, Integrations, Security, System & backups, Audit log |

## Sending ride passes
Open a confirmed booking to view the rider's QR code, copy the pass link, or resend its confirmation email. Configured SMS and WhatsApp channels can also deliver the pass; provider failures are logged and surfaced rather than changing the booking status.

## Roles
Viewer: look only. Editor: bookings, check-in, routes, content, media, SEO, inbox, messages.
Admin: everything, plus users, settings, integrations, security, system/backups, audit, exports.
Role and suspension changes apply on the person's next click.

## Security
- Password fields on Users & roles and Security have a Show / Hide button so you can check what you typed.
- Two-step sign-in (authenticator app). Admins can require it for all staff (Security page).
- Failed sign-ins are logged; an email is locked for 15 minutes after N wrong tries (default 5).
- Session length is enforced (default 8 hours). IP blocklist covers sign-in, the dashboard API and the booking form.
- Security headers are set in `next.config.mjs`. Firewall and SSL belong to your host.
- Lost authenticator: another admin uses Users & roles > Reset 2-step.

## Public hooks for your website (CORS-enabled)
- `GET /api/settings`, `GET /api/seo`, `GET /api/reviews`
- `POST /api/enquiries` `{name, phone|email, subject?, message}` (contact form)
- `POST /api/reviews` `{name, rating 1-5, comment, rideDate?}` (waits for approval)
- `POST /api/subscribe` `{email|phone, consent: true}`
- `<script defer src="https://YOUR-BACKEND/track.js"></script>` counts visits without cookies
- `GET /api/health` for an uptime monitor
- Set `FRONTEND_ORIGIN` if your website is on another address.

## Not included
Online payment processing (payments are recorded manually), comment threads, scheduled database backups (review retention in the Neon console), one-click software updates, firewall/SSL settings.

## Launch operations

- Transactional email provider and test delivery are configured in Integrations; provider credentials are environment-only.
- Customer password reset, booking cancellation, payment recording and reminders are supported by the website/backend flow.
- Run `npm run smoke` from the repository root with `FRONTEND_URL` and `BACKEND_URL` before go-live.
- See [EMAIL-SETUP.md](../docs/EMAIL-SETUP.md), [PAYMENTS.md](../docs/PAYMENTS.md) and [GO-LIVE-CHECKLIST.md](../docs/GO-LIVE-CHECKLIST.md).
