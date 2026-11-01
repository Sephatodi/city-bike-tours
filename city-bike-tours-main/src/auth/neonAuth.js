import { BACKEND_BASE_URL } from "../api/backend";

// Neon Auth's Better Auth-compatible social endpoint is proxied by the backend.
// Use credentials so the proxy can persist the Neon Auth session cookie.
export async function startNeonGoogleSignIn(callbackURL) {
  const response = await fetch(`${BACKEND_BASE_URL}/api/neon-auth/sign-in/social`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ provider: "google", callbackURL }),
  });
  const result = await response.json().catch(() => null);
  if (!response.ok || !result?.url) {
    throw new Error(result?.message || result?.error || "Google sign-in could not be started.");
  }
  window.location.assign(result.url);
}
