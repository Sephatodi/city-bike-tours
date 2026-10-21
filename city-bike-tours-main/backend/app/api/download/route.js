import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { communityPhotos, siteContent } from "@/db/schema";
import { requireCustomer } from "@/lib/customer-auth";

export const dynamic = "force-dynamic";

// Signed-in riders can download a photo only when the team has switched downloads on for it.
// GET /api/download?kind=content|community&id=...  (send the rider's Authorization header)
export async function GET(request) {
  const auth = await requireCustomer(request);
  if (auth.error) return auth.error;

  const { searchParams } = new URL(request.url);
  const kind = searchParams.get("kind");
  const id = searchParams.get("id") || "";
  let photo = null;
  if (kind === "community") {
    [photo] = await db.select({ url: communityPhotos.imageUrl, title: communityPhotos.title }).from(communityPhotos)
      .where(and(eq(communityPhotos.id, id), eq(communityPhotos.status, "approved"), eq(communityPhotos.downloadable, true)));
  } else if (kind === "content" && /^\d+$/.test(id)) {
    [photo] = await db.select({ url: siteContent.mediaUrl, title: siteContent.title }).from(siteContent)
      .where(and(eq(siteContent.id, Number(id)), eq(siteContent.contentType, "picture"), eq(siteContent.isPublished, true), eq(siteContent.downloadable, true)));
  }
  if (!photo?.url) return NextResponse.json({ error: "This photo isn't available to download." }, { status: 403 });

  const upstream = await fetch(photo.url).catch(() => null);
  if (!upstream?.ok || !upstream.body) return NextResponse.json({ error: "File not found." }, { status: 404 });
  const type = upstream.headers.get("content-type") || "application/octet-stream";
  if (!type.startsWith("image/")) return NextResponse.json({ error: "Only photos can be downloaded." }, { status: 400 });
  const extension = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif" }[type] || "jpg";
  const name = `${photo.title.replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "photo"}.${extension}`;
  return new Response(upstream.body, { headers: { "Content-Type": type, "Content-Disposition": `attachment; filename="${name}"`, "Cache-Control": "private, no-store" } });
}
