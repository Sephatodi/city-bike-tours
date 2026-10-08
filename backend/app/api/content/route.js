import { NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { siteContent } from "@/db/schema";

export const dynamic = "force-dynamic";

// Public: published pictures / videos / articles. GET /api/content?type=picture|video|article&limit=24
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "24", 10) || 24, 1), 60);
  const conditions = [eq(siteContent.isPublished, true)];
  if (["picture", "video", "article"].includes(type)) conditions.push(eq(siteContent.contentType, type));

  try {
    const content = await db
      .select({
        id: siteContent.id, contentType: siteContent.contentType, title: siteContent.title,
        mediaUrl: siteContent.mediaUrl, bodyText: siteContent.bodyText, isFeatured: siteContent.isFeatured, createdAt: siteContent.createdAt,
      })
      .from(siteContent)
      .where(and(...conditions))
      .orderBy(desc(siteContent.isFeatured), desc(siteContent.createdAt))
      .limit(limit);
    return NextResponse.json({ content });
  } catch (error) {
    console.error("Content unavailable:", error);
    return NextResponse.json({ error: "Content is unavailable." }, { status: 503 });
  }
}
