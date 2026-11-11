# Admin login guide

This guide covers how new staff members sign in to the City Bike Tours admin dashboard, and how an existing admin can create or reset an account.

## Where to sign in

- **Production:** the website footer's **Admin Login** link opens the backend login page.
- **Local development:** `http://localhost:3000/admin/login`

## What you need

- Your staff email (e.g. `username@citybikes.com`)
- Your password (or an activation code if this is your first login)

## Step-by-step sign-in

1. Open the admin login page.
2. Enter your **email** and click **Continue**.
   - The system checks whether your account exists, is active, and is a staff account (admin, editor or viewer).
   - If your account is not active or not staff, it says "No admin account found".
3. You are shown the **password** step.
4. Enter your **password** and click **Sign in**.
   - If your account has two-step sign-in turned on, you are asked for a **6-digit authenticator code** instead.
5. You land on the **dashboard** (`/admin`).

## First-time login (activation)

A new staff account is created with an activation code, not a password. An admin creates the account from **Users & roles → Add user** and shares the 6-digit activation code privately.

1. Enter your email → click **Continue** → you are sent to the **Activate your account** step.
2. Enter the **6-digit activation code** you were given and click **Verify code**.
3. Create your **password** (at least 12 characters), confirm it, and click **Save password & sign in**.
4. You are signed in automatically.

The activation code is one-time and is not shown again. If it expires or you lose it, another admin can generate a new one from **Users & roles → Reset activation code**.

## Two-step sign-in (MFA)

If your admin has required two-step sign-in (set on the Security page), you set it up once:

1. Sign in with your password.
2. You are prompted to **Turn on** two-step sign-in.
3. Scan the QR code with an authenticator app (Google Authenticator, Authy, etc.) and enter the 6-digit code.
4. Future sign-ins ask for that code.

If you lose your authenticator, another admin uses **Users & roles → Reset 2-step** for your account.

## Problems and fixes

| Problem | What it means | Fix |
|---|---|---|
| "Password is incorrect, or sign-in is temporarily locked after too many tries." | Wrong password, or the account is locked after 5 wrong attempts in 15 minutes. | Wait 15 minutes, or an admin resets the password. |
| "No admin account found for this email, or the account is not available." | The email is not a staff account, or the account is suspended. | An admin can reactivate or assign a role. |
| "Your session expired. Please sign in again." | Sessions last 8 hours by default. | Just sign in again. |
| "Access from this address is blocked. Contact an admin." | Your IP is on the blocklist. | An admin removes it on the Security page. |
| "This account needs activation." | First-time login; no password set yet. | Enter the activation code. |

## Admins: creating a staff account

1. Open **Users & roles** → **Add user**.
2. Enter name, email, and choose a role:
   - **Admin** — everything, plus users, settings, security, audit and exports.
   - **Editor** — bookings, check-in, routes, content, media, SEO, inbox, messages.
   - **Viewer** — read-only.
3. Click **Create account**.
4. Copy the **6-digit activation code** and share it privately with the new staff member. It is shown only once.

## Admins: resetting a password

1. Find the user in **Users & roles**.
2. Click **Reset password** → copy the temporary password and share it privately, or **Edit password** to set a new one (at least 12 characters).
3. The user must change it on next sign-in.

## Security notes

- Password fields have a **Show / hide** button so you can check what you typed.
- Failed sign-ins are logged. After 5 wrong attempts in 15 minutes the account is locked for 15 minutes.
- Sessions expire after 8 hours by default (changeable on the Security page).
- The IP blocklist covers sign-in, the dashboard API and the booking form.