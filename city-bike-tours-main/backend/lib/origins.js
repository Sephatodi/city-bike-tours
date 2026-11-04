const normalizeOrigin = (value) => {
  try {
    const url = new URL(value);
    const isHttps = url.protocol === "https:";
    const isLocalHttp = process.env.NODE_ENV !== "production"
      && url.protocol === "http:"
      && ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
    if ((!isHttps && !isLocalHttp) || url.origin !== value.replace(/\/$/, "")) return null;
    return url.origin;
  } catch {
    return null;
  }
};

export function configuredFrontendOrigins() {
  return (process.env.FRONTEND_ORIGIN || process.env.PUBLIC_FRONTEND_URL || "")
    .split(",")
    .map((value) => normalizeOrigin(value.trim()))
    .filter(Boolean);
}

function configuredOriginPatterns() {
  return (process.env.CORS_ORIGIN_PATTERNS || "")
    .split(",")
    .map((pattern) => pattern.trim())
    .filter((pattern) => {
      if (!pattern.startsWith("https://")) return false;
      const host = pattern.slice("https://".length);
      return Boolean(host) && /^[a-z0-9.*-]+$/i.test(host)
        && !host.includes("..") && !host.startsWith(".") && !host.endsWith(".");
    });
}

function globToRegex(pattern) {
  const host = pattern.slice("https://".length);
  const escaped = host.split("*").map((part) => part.replace(/[.+?^\${}()|[\]\\]/g, "\\$&")).join("[a-z0-9-]+");
  return new RegExp("^https://" + escaped + "$", "i");
}

export function isAllowedFrontendOrigin(value) {
  const origin = normalizeOrigin(value || "");
  if (!origin) return false;
  if (process.env.NODE_ENV !== "production" && /^http:\/\/(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/i.test(origin)) return true;
  if (configuredFrontendOrigins().includes(origin)) return true;
  return configuredOriginPatterns().some((pattern) => globToRegex(pattern).test(origin));
}

export function allowsProtectedMutationOrigin(request) {
  const method = request.method.toUpperCase();
  if (["GET", "HEAD", "OPTIONS"].includes(method)) return true;
  const pathname = new URL(request.url).pathname.replace(/\/$/, "");
  const protectedPath = pathname === "/api/booking-requests"
    || pathname === "/api/customer"
    || pathname.startsWith("/api/customer/")
    || pathname === "/api/community"
    || pathname.startsWith("/api/community/");
  return !protectedPath || isAllowedFrontendOrigin(request.headers.get("origin"));
}
