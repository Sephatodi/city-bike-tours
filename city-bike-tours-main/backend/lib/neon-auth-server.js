import { createNeonAuth } from "@neondatabase/auth/next/server";

// Neon Auth ("Managed Better Auth") handles Google sign-in for customers. It only switches on when both
// values below are set, so the site keeps working without it (Google then falls back to GOOGLE_CLIENT_ID/SECRET).
export const neonAuthEnabled = Boolean(process.env.NEON_AUTH_BASE_URL && process.env.NEON_AUTH_COOKIE_SECRET);

export const neonAuth = neonAuthEnabled
  ? createNeonAuth({
      baseUrl: process.env.NEON_AUTH_BASE_URL,
      cookies: {
        secret: process.env.NEON_AUTH_COOKIE_SECRET,
        // The website and this backend are different sites, so the cookie must survive the redirect back from Google.
        sameSite: "lax",
      },
    })
  : null;
