# SMS sign-in codes: Twilio and Infobip

Phone sign-in sends a 6-digit code (valid for 10 minutes). SMS can go through **Twilio**, **Infobip**, or both. When both are configured, the first provider in `SMS_PROVIDER_ORDER` (default `twilio,infobip`) is tried and, if the send fails, the next one is used. WhatsApp codes always use Twilio.

## Backend (Render) settings, names only

| Name | Value |
|---|---|
| `INFOBIP_API_KEY` | An API key created in the Infobip portal |
| `INFOBIP_BASE_URL` | Your account's host from the portal, for example `xxxxx.api.infobip.com` (with or without `https://`) |
| `INFOBIP_SENDER` | Optional sender name or number shown on the text, for example `CityBikeTours` |
| `SMS_PROVIDER_ORDER` | Optional: `infobip,twilio` to try Infobip first |
| `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` | Twilio SMS (plain `+` number, no `whatsapp:`) |

No quotes around values. Save and wait until Render shows Live.

## Infobip portal steps
1. Sign in at https://portal.infobip.com.
2. **API keys** (Developer tools): create a key, and copy it once. Keep it private.
3. Your **Base URL** is shown on the same page (a host like `xxxxx.api.infobip.com`).
4. A trial account can usually only text the phone number you registered with. Add credit or finish account verification to send to anyone.
5. Sender names: some countries require a registered sender ID. If texts fail or arrive from a random number, ask Infobip support which sender works for Botswana and set `INFOBIP_SENDER` to it, or leave it empty to use their default.

## Reading problems in the Render logs
- `OTP send failed through infobip: Infobip rejected the request (401)...` means a wrong API key or base URL.
- `Infobip could not send the message (REJECTED: ...)` means Infobip refused the number or sender; the text after the colon says why.
- `OTP send failed through twilio:` lines come with Twilio's error code (see the Twilio notes in the README).
- `OTP sent through infobip after 1 failed attempt(s)` means the fallback worked.

If every provider fails, the website says "We couldn't send the code" and the log shows all the reasons joined by `|`. Nothing secret is logged.

## Safety notes
Rotate any key that was ever pasted in a chat or screenshot. Limits still apply: one code per number per 45 seconds, 4 per number per hour, 10 requests per hour per visitor, 5 wrong guesses per code.
