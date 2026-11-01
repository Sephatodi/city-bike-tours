# Changelog

## 2026-11-01

- Added customer Google sign-in through Neon Auth's server-side Next.js integration and backend proxy.
- Kept Facebook and Apple customer OAuth on NextAuth and preserved the existing staff credentials/MFA flow.
- Added a customer Neon Auth completion route that checks account status and role before issuing a customer token.
- Added Privacy, Terms of Use and Data Deletion pages and footer links.
- Extended public reviews with verified-rider status based on matching customer phone numbers to checked-in bookings.
- Added review score summary, rating filters, sorting, helpful votes and optional photo URL metadata.
- Registered an idempotent index migration for review helpful votes.
