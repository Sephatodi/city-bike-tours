const normalizeOrigin = (value) => {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.origin !== value.replace(/\/$/, "")) return null;
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
    .filter((pattern) => pattern.startsWith("https://") && !pattern.includes("/") || false);
}

function globToRegex(pattern) {
  const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, "[a-z0-9-]+");
  return new RegExp(`^${escaped}$`, "i");
}

export function isAllowedFrontendOrigin(value) {
  const origin = normalizeOrigin(value || "");
  if (!origin) return false;
  if (configuredFrontendOrigins().includes(origin)) return true;

  return configuredOriginPatterns().some((pattern) => {
    // Patterns must be HTTPS origins only: no paths, query strings, fragments or ports.
    if (!/^https:\/\/[^/?#:*]+(?:-[*][^/?#:]*)?$/.test(pattern) && !/^https:\/\/[^/?#]*\*[^/?#]*$/.test(pattern)) return false;
    try {
      return globToRegex(pattern).test(origin);
    } catch {
      return false;
    }
  });
}
