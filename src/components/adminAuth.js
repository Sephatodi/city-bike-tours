async function readJson(response, fallback) {
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || fallback);
  return result;
}

async function getCsrfToken() {
  const response = await fetch("/api/auth/csrf", { cache: "no-store" });
  const result = await readJson(response, "Could not initialize authentication.");
  if (!result.csrfToken) throw new Error("Could not initialize authentication.");
  return result.csrfToken;
}

export async function getAdminSession() {
  const response = await fetch("/api/auth/session", { cache: "no-store" });
  return readJson(response, "Could not verify administrator access.");
}

export async function signInAdmin(email, password) {
  const csrfToken = await getCsrfToken();
  const response = await fetch("/api/auth/callback/credentials", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "X-Auth-Return-Redirect": "1",
    },
    body: new URLSearchParams({
      csrfToken,
      email,
      password,
      callbackUrl: `${window.location.origin}/admin`,
      json: "true",
    }),
  });
  const result = await readJson(response, "Email or password is incorrect.");
  if (!result.url || new URL(result.url, window.location.origin).searchParams.has("error")) {
    throw new Error("Email or password is incorrect.");
  }
  return getAdminSession();
}

export async function signOutAdmin() {
  const csrfToken = await getCsrfToken();
  const response = await fetch("/api/auth/signout", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "X-Auth-Return-Redirect": "1",
    },
    body: new URLSearchParams({
      csrfToken,
      callbackUrl: `${window.location.origin}/admin/login`,
      json: "true",
    }),
  });
  await readJson(response, "Could not sign out.");
}