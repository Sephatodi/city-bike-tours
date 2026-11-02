// The public City Bike Tours website (the Vite app). The backend has no pages of its own, so anything a visitor
// opens here by mistake is sent on to the website.
export function frontendUrl(path = "/") {
  const base = (process.env.PUBLIC_FRONTEND_URL || (process.env.FRONTEND_ORIGIN || "").split(",")[0] || "").trim().replace(/\/$/, "");
  return base ? `${base}${path}` : null;
}
