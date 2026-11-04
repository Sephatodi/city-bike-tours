import { NextResponse } from "next/server";
import { and, desc, eq, lt, sql } from "drizzle-orm";
import { del, put } from "@vercel/blob";
import { db } from "@/db/client";
import { communityPhotos, communityUploadUsage } from "@/db/schema";
import { newId } from "@/lib/id";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { optionalCustomer, requireCustomer } from "@/lib/customer-auth";
import { releaseCommunityUpload } from "@/lib/community-upload-usage";
import { sniffImage, sniffVideo } from "@/lib/blob-url";
import { communityMediaUrl } from "@/lib/community-media";
import { fireWebhook } from "@/lib/webhook";
import { SITE_IDS } from "@/lib/review-meta";
import { notifyAdmins } from "@/lib/admin-email";

export const dynamic = "force-dynamic";

const MAX_BYTES = 4 * 1024 * 1024; // serverless request bodies are capped around 4.5MB
const MAX_UPLOADS_PER_RIDER = 6;

const columns = {
  id: communityPhotos.id, authorName: communityPhotos.authorName, title: communityPhotos.title, story: communityPhotos.story,
  imageUrl: communityPhotos.imageUrl, mediaType: communityPhotos.mediaType, siteId: communityPhotos.siteId, status: communityPhotos.status,
  visibility: communityPhotos.visibility, downloadable: communityPhotos.downloadable, createdAt: communityPhotos.createdAt, userId: communityPhotos.userId,
};

// Only approved public media is listed publicly; riders can also see every status of their own uploads.
export async function GET(request) {
  const { user } = await optionalCustomer(request);
  try {
    const publicRows = await db.select(columns).from(communityPhotos)
      .where(and(eq(communityPhotos.status, "approved"), eq(communityPhotos.visibility, "public")))
      .orderBy(desc(communityPhotos.createdAt)).limit(60);
    const ownRows = user
      ? await db.select(columns).from(communityPhotos).where(eq(communityPhotos.userId, user.id)).orderBy(desc(communityPhotos.createdAt))
      : [];
    const rows = [...new Map([...publicRows, ...ownRows].map((photo) => [photo.id, photo])).values()]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const [usage] = user
      ? await db.select({ count: communityUploadUsage.count }).from(communityUploadUsage).where(eq(communityUploadUsage.userId, user.id)).limit(1)
      : [];
    const uploadsUsed = usage?.count || 0;
    return NextResponse.json({
      photos: rows.map(({ userId, ...photo }) => ({
        ...photo,
        imageUrl: communityMediaUrl(request, photo),
        mine: Boolean(user && userId === user.id),
      })),
      ...(user && { uploadsUsed, uploadLimit: MAX_UPLOADS_PER_RIDER, remainingUploads: Math.max(0, MAX_UPLOADS_PER_RIDER - uploadsUsed) }),
    });
  } catch (error) {
    console.error("Community photos unavailable:", error);
    return NextResponse.json({ error: "Rider photos are unavailable." }, { status: 503 });
  }
}

export async function POST(request) {
  const auth = await requireCustomer(request);
  if (auth.error) return auth.error;
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  if (!blobToken) return NextResponse.json({ error: "Public photo uploads aren't switched on yet." }, { status: 501 });
  if (!rateLimit(`cust-photo:${auth.user.id}:${clientIp(request)}`, 10, 24 * 60 * 60 * 1000)) return NextResponse.json({ error: "You've shared a lot today. Please try again tomorrow." }, { status: 429 });

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  const title = String(form?.get("title") || "").trim().slice(0, 120);
  const story = String(form?.get("story") || "").trim().slice(0, 1500);
  const rawSite = String(form?.get("siteId") || "");
  const siteId = SITE_IDS.includes(rawSite) ? rawSite : null;
  if (!file || typeof file === "string") return NextResponse.json({ error: "Choose a photo or video to upload." }, { status: 400 });
  if (!title) return NextResponse.json({ error: "Give your media a short title." }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "That file is too large (max 4MB)." }, { status: 400 });

  const bytes = new Uint8Array(await file.arrayBuffer());
  const type = sniffImage(bytes) || sniffVideo(bytes);
  if (!type) return NextResponse.json({ error: "Only JPEG, PNG, WebP, GIF, MP4 or WebM media are allowed." }, { status: 400 });

  const id = newId();
  const extension = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif", "video/mp4": "mp4", "video/webm": "webm" }[type];
  const [reservation] = await db.insert(communityUploadUsage)
    .values({ userId: auth.user.id, count: 1 })
    .onConflictDoUpdate({
      target: communityUploadUsage.userId,
      set: { count: sql`${communityUploadUsage.count} + 1` },
      setWhere: lt(communityUploadUsage.count, MAX_UPLOADS_PER_RIDER),
    })
    .returning({ userId: communityUploadUsage.userId });
  if (!reservation) return NextResponse.json({ error: "You have reached the six-upload limit for your account." }, { status: 409 });

  let url;
  try {
    ({ url } = await put(`city-tours-community/${id}.${extension}`, Buffer.from(bytes), {
      access: "public",
      contentType: type,
      token: blobToken,
    }));
  } catch (error) {
    console.error("Community upload failed:", error);
    await releaseCommunityUpload(auth.user.id);
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 502 });
  }

  let photo;
  try {
    [photo] = await db.insert(communityPhotos).values({
      id, userId: auth.user.id, authorName: auth.user.name, title, story: story || null, imageUrl: url,
      mediaType: type.startsWith("video/") ? "video" : "image", visibility: "public", downloadable: true, siteId,
    }).returning(columns);
  } catch (error) {
    await del(url, { token: blobToken }).catch((deleteError) => console.error("Community upload cleanup failed:", deleteError.message));
    await releaseCommunityUpload(auth.user.id);
    console.error("Community upload record failed:", error);
    return NextResponse.json({ error: "The upload could not be saved. Please try again." }, { status: 503 });
  }

  await fireWebhook("community_photo.created", { id, name: auth.user.name, title });
  await notifyAdmins("newRiderUpload", {
    id,
    rider: auth.user.name,
    title,
    mediaType: photo.mediaType,
  }, { relatedType: "community_photo", relatedId: id });
  const { userId, ...rest } = photo;
  return NextResponse.json({
    photo: { ...rest, imageUrl: communityMediaUrl(request, rest), mine: true },
    message: "Thank you! Your media will appear once our team has looked at it.",
  }, { status: 201 });
}
