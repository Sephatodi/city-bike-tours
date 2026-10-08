// Best-effort in-memory limiter (per server instance). Use Redis/Upstash for strict limits on serverless.
const hits = new Map();

export function rateLimit(key, max, windowMs) {
  const now = Date.now();
  const fresh = (hits.get(key) || []).filter((t) => now - t < windowMs);
  if (fresh.length >= max) { hits.set(key, fresh); return false; }
  fresh.push(now);
  hits.set(key, fresh);
  return true;
}

export const clientIp = (request) =>
  request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
