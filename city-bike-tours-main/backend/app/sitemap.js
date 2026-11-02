import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { seoPages } from "@/db/schema";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

const PAGES = ["/", "/schedule", "/heritage-trail", "/book", "/gallery", "/connect"];

export default async function sitemap() {
  const settings = await getSettings();
  const base = (settings.siteUrl || process.env.PUBLIC_FRONTEND_URL || "").replace(/\/$/, "");
  if (!base || settings.noindexSite === "true") return [];
  const hidden = new Set((await db.select({ path: seoPages.path }).from(seoPages).where(eq(seoPages.noindex, true))).map((p) => p.path));
  return PAGES.filter((p) => !hidden.has(p)).map((p) => ({ url: `${base}${p === "/" ? "" : p}`, lastModified: new Date() }));
}
