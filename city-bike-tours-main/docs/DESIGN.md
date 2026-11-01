# City Bike Tours design and application architecture

## Product structure

The repository contains two deployable applications:

- The Vite React website is deployed to Vercel.
- The Next.js backend and staff dashboard are deployed separately and use Neon Postgres through Drizzle ORM.

The website uses React Router. Public routes include the home page, ride schedule, booking, heritage trail, gallery, site-specific gallery, reviews/messages, customer login, and customer dashboard. Legal routes are `/privacy`, `/terms`, and `/data-deletion`.

## Visual system

The website uses a heritage-inspired palette: dark forest greens, warm cream surfaces and gold accents, with rider/bicycle motifs. Shared navigation and footer components provide consistent access to booking, customer account, gallery and legal information. Mobile navigation is rendered separately for small screens.

The reviews and gallery surfaces use the `rr` theme stylesheet. Date/time labels use the Africa/Gaborone timezone helpers in `src/lib/time.js`.

## Authentication boundaries

Customer authentication and staff authentication are separate:

- Customer email/password and phone OTP use the customer API and customer token.
- Customer Google OAuth uses Neon Auth through the backend proxy. The completion route maps the Neon identity to a customer record and issues the existing customer token.
- Facebook and Apple customer OAuth use the backend `/customer-social` page and NextAuth.
- Staff sign-in remains NextAuth credentials with MFA and database-backed staff roles.

Customer completion handlers reject users whose database role is not `customer`. Do not grant staff permissions from a social-provider claim.

## Data and migrations

Neon Postgres is the source of truth. Drizzle schema definitions live in `backend/db/schema.js`; ordered SQL migrations and their journal live in `backend/db/migrations`. Apply migrations through the backend's `npm run db:migrate` script after reviewing the target database.

## Deployment configuration

The website uses `VITE_API_BASE_URL` to reach the backend. The backend uses `FRONTEND_ORIGIN` and `CORS_ORIGIN_PATTERNS` to control browser origins. Neon Auth requires `AUTH_URL` and `NEON_AUTH_COOKIE_SECRET`. Secrets belong only in deployment environment settings, never in the repository.
