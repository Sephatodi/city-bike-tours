import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function robots() {
  const settings = await getSettings();
  const base = (settings.siteUrl || process.env.PUBLIC_FRONTEND_URL || "").replace(/\/$/, "");
  if (settings.noindexSite === "true") return { rules: [{ userAgent: "*", disallow: "/" }] };
  const extra = settings.robotsExtra.split("\n").map((l) => l.trim()).filter((l) => l.startsWith("/"));
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api", ...extra] }],
    ...(base ? { sitemap: `${base}/sitemap.xml` } : {}),
  };
}
