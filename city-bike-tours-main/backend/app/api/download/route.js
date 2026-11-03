import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { get } from "@vercel/blob";
import { db } from "@/db/client";
import { communityPhotos, siteContent } from "@/db/schema";
import { isPrivateCommunityBlob } from "@/lib/community-media";

export const dynamic = "force-dynamic";

// Only published team media and approved rider media with downloads enabled are public.
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const kind = searchParams.get("kind");
  const id = searchParams.get("id") || "";
  let photo = null;
  if (kind === "community") {
    [photo] = await db.select({ url: communityPhotos.imageUrl, title: communityPhotos.title, mediaType: communityPhotos.mediaType }).from(communityPhotos)
      .where(and(eq(communityPhotos.id, id), eq(communityPhotos.status, "approved"), eq(communityPhotos.downloadable, true)));
  } else if (kind === "content" && /^\d+$/.test(id)) {
    [photo] = await db.select({ url: siteContent.mediaUrl, title: siteContent.title, mediaType: siteContent.contentType }).from(siteContent)
      .where(and(eq(siteContent.id, Number(id)), eq(siteContent.contentType, "picture"), eq(siteContent.isPublished, true), eq(siteContent.downloadable, true)));
  }
  if (!photo?.url) return NextResponse.json({ error: "This photo isn't available to download." }, { status: 403 });

  let stream;
  let type;
  if (kind === "community" && isPrivateCommunityBlob(photo.url)) {
    const token = process.env.BLOB_PRIVATE_READ_WRITE_TOKEN;
    if (!token) return NextResponse.json({ error: "Private media storage isn't configured." }, { status: 503 });
    try {
      const blob = await get(photo.url, { access: "private", token });
      if (!blob || blob.statusCode !== 200 || !blob.stream) return NextResponse.json({ error: "File not found." }, { status: 404 });
      stream = blob.stream;
      type = blob.blob.contentType;
    } catch (error) {
      console.error("Community download failed:", error);
      return NextResponse.json({ error: "File is temporarily unavailable." }, { status: 502 });
    }
  } else {
    const upstream = await fetch(photo.url).catch(() => null);
    if (!upstream?.ok || !upstream.body) return NextResponse.json({ error: "File not found." }, { status: 404 });
    stream = upstream.body;
    type = upstream.headers.get("content-type")?.split(";")[0]?.toLowerCase() || "application/octet-stream";
  }
  const extensions = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif", "video/mp4": "mp4", "video/webm": "webm" };
  const extension = extensions[type];
  if (!extension || (photo.mediaType === "image" && !type.startsWith("image/")) || (photo.mediaType === "video" && !type.startsWith("video/"))) {
    return NextResponse.json({ error: "This media format can't be downloaded." }, { status: 400 });
  }
  const name = `${photo.title.replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "photo"}.${extension}`;
  return new Response(stream, { headers: { "Content-Type": type, "Content-Disposition": `attachment; filename="${name}"`, "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" } });
}
