const normalizeOrigin = (value) => {
  try {
    const url = new URL(value);
    const normalized = value.replace(/\/$/, "");
    const secure = url.protocol === "https:";
    const localDevelopment = url.protocol === "http:" && ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
    if ((!secure && !localDevelopment) || url.origin !== normalized) return null;
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
  if (configuredFrontendOrigins().includes(origin)) return true;
  return configuredOriginPatterns().some((pattern) => globToRegex(pattern).test(origin));
}
