import { NextResponse } from "next/server";
import { and, desc, eq, lt, sql } from "drizzle-orm";
import { del, put } from "@vercel/blob";
import { db } from "@/db/client";
import { bookingRequests, communityBookingUploadUsage, communityPhotos } from "@/db/schema";
import { newId } from "@/lib/id";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { normalizeBookingCode } from "@/lib/booking-code";
import { releaseCommunityUpload } from "@/lib/community-upload-usage";
import { sniffImage, sniffVideo } from "@/lib/blob-url";
import { communityMediaUrl } from "@/lib/community-media";
import { fireWebhook } from "@/lib/webhook";
import { SITE_IDS } from "@/lib/review-meta";
import { notifyAdmins } from "@/lib/admin-email";
import { gaboroneDate } from "@/lib/time";

export const dynamic = "force-dynamic";

const MAX_BYTES = 4 * 1024 * 1024; // serverless request bodies are capped around 4.5MB
const MAX_UPLOADS_PER_RIDER = 6;
const GENERIC_UPLOAD_ERROR = "We couldn't find a confirmed booking with that code.";

const columns = {
  id: communityPhotos.id, authorName: communityPhotos.authorName, title: communityPhotos.title, story: communityPhotos.story,
  imageUrl: communityPhotos.imageUrl, mediaType: communityPhotos.mediaType, siteId: communityPhotos.siteId, status: communityPhotos.status,
  visibility: communityPhotos.visibility, downloadable: communityPhotos.downloadable, createdAt: communityPhotos.createdAt,
};

function genericError(status = 400) {
  return NextResponse.json({ error: GENERIC_UPLOAD_ERROR }, { status });
}

// Only approved public media is listed publicly.
export async function GET(request) {
  try {
    const rows = await db.select(columns).from(communityPhotos)
      .where(and(eq(communityPhotos.status, "approved"), eq(communityPhotos.visibility, "public")))
      .orderBy(desc(communityPhotos.createdAt)).limit(60);
    return NextResponse.json({
      photos: rows.map((photo) => ({ ...photo, imageUrl: communityMediaUrl(request, photo) })),
    });
  } catch (error) {
    console.error("Community photos unavailable:", error);
    return NextResponse.json({ error: "Rider photos are unavailable." }, { status: 503 });
  }
}

export async function POST(request) {
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  if (!blobToken) return NextResponse.json({ error: "Public photo uploads aren't switched on yet." }, { status: 501 });
  const ip = clientIp(request);
  if (!rateLimit(`community-photo-ip:${ip}`, 10, 60 * 60 * 1000)) return genericError(429);

  const form = await request.formData().catch(() => null);
  const rawCode = String(form?.get("code") || "");
  const file = form?.get("file");
  const title = String(form?.get("title") || "").trim().slice(0, 120);
  const story = String(form?.get("story") || "").trim().slice(0, 1500);
  const rawSite = String(form?.get("siteId") || "");
  const siteId = SITE_IDS.includes(rawSite) ? rawSite : null;
  const code = normalizeBookingCode(rawCode);
  if (!code) return genericError(400);
  if (!rateLimit(`community-photo-code:${code}`, 5, 60 * 60 * 1000)) return genericError(429);
  if (!file || typeof file === "string") return NextResponse.json({ error: "Choose a photo or video to upload." }, { status: 400 });
  if (!title) return NextResponse.json({ error: "Give your media a short title." }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "That file is too large (max 4MB)." }, { status: 400 });

  const [booking] = await db.select({
    id: bookingRequests.id, name: bookingRequests.name, status: bookingRequests.status,
    rideDate: bookingRequests.rideDate, checkedInAt: bookingRequests.checkedInAt,
  }).from(bookingRequests).where(eq(bookingRequests.confirmationCode, code)).limit(1);

  const today = gaboroneDate();
  const allowedStatus = booking && (booking.status === "confirmed" || booking.checkedInAt);
  const allowedDate = booking && booking.rideDate && booking.rideDate <= today;
  if (!booking || !allowedStatus || !allowedDate || booking.status === "cancelled") return genericError(400);

  const bytes = new Uint8Array(await file.arrayBuffer());
  const type = sniffImage(bytes) || sniffVideo(bytes);
  if (!type) return NextResponse.json({ error: "Only JPEG, PNG, WebP, GIF, MP4 or WebM media are allowed." }, { status: 400 });

  const id = newId();
  const extension = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif", "video/mp4": "mp4", "video/webm": "webm" }[type];
  const [reservation] = await db.insert(communityBookingUploadUsage)
    .values({ bookingId: booking.id, count: 1 })
    .onConflictDoUpdate({
      target: communityBookingUploadUsage.bookingId,
      set: { count: sql`${communityBookingUploadUsage.count} + 1` },
      setWhere: lt(communityBookingUploadUsage.count, MAX_UPLOADS_PER_RIDER),
    })
    .returning({ bookingId: communityBookingUploadUsage.bookingId });
  if (!reservation) return NextResponse.json({ error: "You have reached the upload limit for this booking." }, { status: 409 });

  let url;
  try {
    ({ url } = await put(`city-tours-community/${id}.${extension}`, Buffer.from(bytes), {
      access: "public",
      contentType: type,
      token: blobToken,
    }));
  } catch (error) {
    console.error("Community upload failed:", error);
    await releaseCommunityUpload({ bookingId: booking.id });
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 502 });
  }

  let photo;
  try {
    [photo] = await db.insert(communityPhotos).values({
      id, bookingId: booking.id, userId: null, authorName: booking.name, title, story: story || null, imageUrl: url,
      mediaType: type.startsWith("video/") ? "video" : "image", visibility: "public", downloadable: true, siteId,
    }).returning(columns);
  } catch (error) {
    await del(url, { token: blobToken }).catch((deleteError) => console.error("Community upload cleanup failed:", deleteError.message));
    await releaseCommunityUpload({ bookingId: booking.id });
    console.error("Community upload record failed:", error);
    return NextResponse.json({ error: "The upload could not be saved. Please try again." }, { status: 503 });
  }

  await fireWebhook("community_photo.created", { id, name: booking.name, title, bookingId: booking.id });
  await notifyAdmins("newRiderUpload", {
    id,
    rider: booking.name,
    title,
    mediaType: photo.mediaType,
  }, { relatedType: "community_photo", relatedId: id });
  return NextResponse.json({
    photo: { ...photo, imageUrl: communityMediaUrl(request, photo) },
    message: "Thank you! Your media will appear once our team has reviewed it.",
  }, { status: 201 });
}
