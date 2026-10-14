import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { seoPages } from "@/db/schema";
import { getSettings, publicSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

// Public: lets the website read its search title, description and keywords for each page.
export async function GET() {
  const [pages, settings] = await Promise.all([db.select().from(seoPages), getSettings()]);
  const site = publicSettings(settings);
  return NextResponse.json({
    site: { title: site.seoTitle, description: site.seoDescription, keywords: site.seoKeywords, noindex: site.noindexSite === "true", url: site.siteUrl },
    pages: Object.fromEntries(pages.map((p) => [p.path, { title: p.title, description: p.description, keywords: p.keywords, noindex: p.noindex }])),
  });
}
