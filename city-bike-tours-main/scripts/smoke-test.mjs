const frontendValue = process.env.FRONTEND_URL;
const backendValue = process.env.BACKEND_URL;
if (!frontendValue || !backendValue) {
  console.error("Set FRONTEND_URL and BACKEND_URL before running the smoke test.");
  process.exit(1);
}

const frontend = new URL(frontendValue);
const backend = new URL(backendValue);
const failures = [];

async function check(name, url, validate, options = {}) {
  const started = performance.now();
  try {
    const response = await fetch(url, { redirect: "manual", ...options });
    const result = await validate(response);
    if (!result) throw new Error("unexpected response");
    console.log(`PASS ${name} (${Math.round(performance.now() - started)} ms)`);
  } catch (error) {
    failures.push(name);
    console.error(`FAIL ${name} (${Math.round(performance.now() - started)} ms): ${error.message}`);
  }
}

const isJson = (response) => response.ok && (response.headers.get("content-type") || "").includes("application/json");
const pages = [
  "/", "/schedule", "/heritage-trail", "/gallery", "/connect", "/login", "/privacy", "/terms",
  "/data-deletion", "/forgot-password",
];
for (const path of pages) {
  await check(`frontend ${path}`, new URL(path, frontend), async (response) => {
    const type = response.headers.get("content-type") || "";
    return response.status === 200 && type.includes("text/html") && (await response.text()).includes("<html");
  });
}
await check("frontend favicon", new URL("/favicon.svg", frontend), (response) => response.status === 200);

for (const path of ["/api/health", "/api/routes-config", "/api/content", "/api/customer/providers"]) {
  await check(`backend ${path}`, new URL(path, backend), isJson);
}
await check("backend health database", new URL("/api/health", backend), async (response) => response.ok && (await response.json()).ok === true);
await check("backend route config", new URL("/api/routes-config", backend), async (response) => {
  if (!response.ok) return false;
  const body = await response.json();
  return Array.isArray(body.routes) && body.routes.length === 2
    && body.routes.every((route) => route.routeName && Number(route.priceBwp) > 0);
});
for (const path of ["/api/content", "/api/customer/providers"]) {
  await check(`backend JSON shape ${path}`, new URL(path, backend), async (response) => {
    if (!response.ok) return false;
    await response.json();
    return true;
  });
}

await check("backend root redirects to frontend", backend, (response) => {
  const location = response.headers.get("location") || "";
  return response.status >= 300 && response.status < 400 && new URL(location, backend).origin === frontend.origin;
});

for (const path of ["/api/customer/me", "/api/customer/bookings", "/api/admin/bookings"]) {
  await check(`protected ${path}`, new URL(path, backend), (response) => [401, 403].includes(response.status));
}

const preflight = {
  method: "OPTIONS",
  headers: { Origin: frontend.origin, "Access-Control-Request-Method": "GET" },
};
await check("CORS allows frontend", new URL("/api/health", backend), (response) =>
  response.status === 204 && response.headers.get("access-control-allow-origin") === frontend.origin, preflight);
await check("CORS rejects stranger origin", new URL("/api/health", backend), (response) =>
  response.status === 403 && !response.headers.get("access-control-allow-origin"), {
    method: "OPTIONS",
    headers: { Origin: "https://smoke-test.invalid", "Access-Control-Request-Method": "GET" },
  });

await check("frontend security headers", new URL("/", frontend), (response) =>
  response.headers.get("x-content-type-options") === "nosniff"
  && response.headers.get("referrer-policy") === "strict-origin-when-cross-origin"
  && response.headers.get("permissions-policy")?.includes("geolocation=()")
  && response.headers.get("x-frame-options") === "SAMEORIGIN");
await check("backend security headers", new URL("/api/health", backend), (response) =>
  response.headers.get("x-content-type-options") === "nosniff"
  && response.headers.get("referrer-policy") === "strict-origin-when-cross-origin"
  && response.headers.get("permissions-policy")?.includes("geolocation=()")
  && response.headers.get("x-frame-options") === "SAMEORIGIN"
  && Boolean(response.headers.get("strict-transport-security")));

if (frontend.protocol === "https:") {
  const httpUrl = new URL(frontend);
  httpUrl.protocol = "http:";
  await check("HTTP redirects to HTTPS", httpUrl, (response) => {
    const location = response.headers.get("location") || "";
    return response.status >= 300 && response.status < 400 && location.startsWith("https://");
  });
} else {
  console.log("SKIP HTTP-to-HTTPS check (FRONTEND_URL is local HTTP).");
}

console.log(`Smoke test complete: ${failures.length ? `${failures.length} failure(s)` : "all checks passed"}.`);
if (failures.length) process.exit(1);
