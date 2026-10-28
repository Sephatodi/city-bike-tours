export function frontendUrl(path = "/") {
  const configured = process.env.PUBLIC_FRONTEND_URL
    || (process.env.FRONTEND_ORIGIN || "").split(",")[0].trim();
  if (!configured) return null;

  try {
    const base = new URL(configured.trim()).origin.replace(/\/$/, "");
    const suffix = path.startsWith("/") ? path : `/${path}`;
    return `${base}${suffix}`;
  } catch {
    return null;
  }
}
