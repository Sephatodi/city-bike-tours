import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { get } from "@vercel/blob";
import { db } from "@/db/client";
import { communityPhotos } from "@/db/schema";
import { isOurBlob } from "@/lib/blob-url";
import {
  hasValidCommunityMediaSignature,
  isPrivateCommunityBlob,
  PRIVATE_COMMUNITY_PREFIX,
} from "@/lib/community-media";

export const dynamic = "force-dynamic";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
]);

export async function GET(request, { params }) {
  const [photo] = await db.select({
    id: communityPhotos.id,
    imageUrl: communityPhotos.imageUrl,
    mediaType: communityPhotos.mediaType,
    status: communityPhotos.status,
    visibility: communityPhotos.visibility,
  }).from(communityPhotos).where(eq(communityPhotos.id, params.id)).limit(1);
  if (!photo) return NextResponse.json({ error: "Media not found." }, { status: 404 });

  const { searchParams } = new URL(request.url);
  const signedAccess = hasValidCommunityMediaSignature(
    photo.id,
    searchParams.get("expires"),
    searchParams.get("signature"),
  );
  if ((photo.status !== "approved" || photo.visibility === "private") && !signedAccess) {
    return NextResponse.json({ error: "This media isn't available." }, { status: 404 });
  }

  let stream;
  let contentType;
  try {
    if (isPrivateCommunityBlob(photo.imageUrl)) {
      const token = process.env.BLOB_PRIVATE_READ_WRITE_TOKEN;
      if (!token) return NextResponse.json({ error: "Private media storage isn't configured." }, { status: 503 });
      const result = await get(photo.imageUrl, { access: "private", token });
      if (!result || result.statusCode !== 200 || !result.stream) {
        return NextResponse.json({ error: "Media not found." }, { status: 404 });
      }
      stream = result.stream;
      contentType = result.blob.contentType;
    } else {
      if (!isOurBlob(photo.imageUrl, ["/city-tours-community/"])) {
        return NextResponse.json({ error: "Media not found." }, { status: 404 });
      }
      const upstream = await fetch(photo.imageUrl);
      if (!upstream.ok || !upstream.body) return NextResponse.json({ error: "Media not found." }, { status: 404 });
      stream = upstream.body;
      contentType = upstream.headers.get("content-type")?.split(";")[0]?.toLowerCase();
    }
  } catch (error) {
    console.error("Community media retrieval failed:", error);
    return NextResponse.json({ error: "Media is temporarily unavailable." }, { status: 502 });
  }

  const expectedMediaPrefix = photo.mediaType === "video" ? "video/" : "image/";
  if (!ALLOWED_TYPES.has(contentType) || !contentType.startsWith(expectedMediaPrefix)) {
    return NextResponse.json({ error: "This media format can't be displayed." }, { status: 415 });
  }

  const privateResponse = photo.status !== "approved" || photo.visibility === "private";
  return new Response(stream, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": "inline",
      "Cache-Control": privateResponse ? "private, no-store" : "public, max-age=60",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
