# Transactional email setup

The backend sends account welcomes, booking receipts and confirmations, reminders, password-reset links, review replies, photo approvals, and admin alerts. Email failures are logged and never invalidate a booking, review, enquiry, or upload.

Configure these variables in the backend environment:

| Name | Purpose |
| --- | --- |
| `EMAIL_PROVIDER` | `resend` or `smtp` |
| `EMAIL_FROM` | Verified sender name and address |
| `RESEND_API_KEY` | Required when using Resend |
| `SMTP_HOST` | SMTP server hostname |
| `SMTP_PORT` | SMTP port |
| `SMTP_USER` | SMTP username |
| `SMTP_PASS` | SMTP password or app password |
| `SMTP_SECURE` | `true` for implicit TLS, otherwise `false` |
| `ADMIN_NOTIFY_EMAILS` | Optional comma-separated alert recipients |

`EMAIL_FROM` must be a sender authorized by the chosen email service. SMTP uses the same standard fields across hosts; use that host's documented hostname, port, TLS mode, username and app password. Do not put credentials in the repository or paste them into support tickets.

## Resend

1. Verify the sending domain in the Resend dashboard.
2. Add the SPF and DKIM DNS records exactly as shown by Resend. Publish a DMARC policy for the domain, initially in monitoring mode if needed.
3. Create a restricted API key for the backend and set `EMAIL_PROVIDER=resend`, `RESEND_API_KEY`, and `EMAIL_FROM`.
4. Redeploy the backend after setting environment variables.

## SMTP

1. Use an SMTP account intended for application email and create an app password where supported.
2. Set `EMAIL_PROVIDER=smtp`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_SECURE`, and `EMAIL_FROM`.
3. Publish the sender provider's SPF, DKIM and DMARC DNS records.
4. Redeploy the backend.

## Verify delivery

Open Admin → Integrations. The page shows configuration state without exposing credentials, offers **Send test email**, and lists the latest 100 attempts with their status and error. The test goes to the signed-in staff member's account email and requires `settings:write`. Development without a provider prints a redacted preview and records a skipped attempt. Production without a provider skips sends and logs a clear startup warning.

Addresses that are blank or end in `.invalid` are never sent. Phone-only customer accounts use such placeholder addresses; those bookings need a deliverable address supplied on the booking form to receive email.
