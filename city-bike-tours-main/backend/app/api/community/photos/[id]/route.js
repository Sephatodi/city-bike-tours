import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { del } from "@vercel/blob";
import { db } from "@/db/client";
import { communityPhotos } from "@/db/schema";
import { releaseCommunityUpload } from "@/lib/community-upload-usage";
import { normalizeBookingCode } from "@/lib/booking-code";
import { isOurBlob } from "@/lib/blob-url";
import { isPrivateCommunityBlob } from "@/lib/community-media";

const GENERIC = "Photo not found.";

// Delete with a matching booking code (no account). Admin moderation uses separate admin routes.
export async function DELETE(request, { params }) {
  const body = await request.json().catch(() => ({}));
  const code = normalizeBookingCode(body?.code);
  if (!code) return NextResponse.json({ error: GENERIC }, { status: 404 });

  const [photo] = await db.select({
    id: communityPhotos.id, imageUrl: communityPhotos.imageUrl, bookingId: communityPhotos.bookingId,
  }).from(communityPhotos).where(eq(communityPhotos.id, params.id)).limit(1);
  if (!photo?.bookingId) return NextResponse.json({ error: GENERIC }, { status: 404 });

  // Verify code matches the photo's booking.
  const { bookingRequests } = await import("@/db/schema");
  const [booking] = await db.select({ id: bookingRequests.id }).from(bookingRequests)
    .where(eq(bookingRequests.id, photo.bookingId)).limit(1);
  if (!booking) return NextResponse.json({ error: GENERIC }, { status: 404 });
  const [match] = await db.select({ id: bookingRequests.id }).from(bookingRequests)
    .where(eq(bookingRequests.confirmationCode, code)).limit(1);
  if (!match || match.id !== booking.id) return NextResponse.json({ error: GENERIC }, { status: 404 });

  await db.delete(communityPhotos).where(eq(communityPhotos.id, photo.id));
  if (isPrivateCommunityBlob(photo.imageUrl)) {
    await del(photo.imageUrl, { token: process.env.BLOB_PRIVATE_READ_WRITE_TOKEN }).catch((error) => console.error("Private Blob delete failed:", error.message));
  } else if (isOurBlob(photo.imageUrl, ["/city-tours-community/"])) {
    await del(photo.imageUrl).catch((error) => console.error("Blob delete failed:", error.message));
  }
  await releaseCommunityUpload({ bookingId: photo.bookingId });
  return NextResponse.json({ success: true });
}
