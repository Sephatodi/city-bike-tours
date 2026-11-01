import { createNeonAuth } from "@neondatabase/auth/next/server";

const baseUrl = process.env.AUTH_URL || process.env.NEON_AUTH_BASE_URL;
const cookieSecret = process.env.NEON_AUTH_COOKIE_SECRET;

if (!baseUrl || !cookieSecret) console.warn("Neon Auth is not configured: set AUTH_URL and NEON_AUTH_COOKIE_SECRET.");

export const neonAuth = createNeonAuth({
  baseUrl: baseUrl || "https://auth-not-configured.invalid",
  cookies: {
    secret: cookieSecret || "development-only-cookie-secret-change-before-deploy",
    sessionDataTtl: 300,
  },
});
