import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { del } from "@vercel/blob";
import { db } from "@/db/client";
import { communityPhotos } from "@/db/schema";
import { requireCustomer } from "@/lib/customer-auth";
import { releaseCommunityUpload } from "@/lib/community-upload-usage";
import { isOurBlob } from "@/lib/blob-url";
import { isPrivateCommunityBlob } from "@/lib/community-media";

// Riders can remove their own media and reclaim one of their six upload slots.
export async function DELETE(request, { params }) {
  const auth = await requireCustomer(request);
  if (auth.error) return auth.error;
  const [removed] = await db.delete(communityPhotos).where(and(eq(communityPhotos.id, params.id), eq(communityPhotos.userId, auth.user.id))).returning();
  if (!removed) return NextResponse.json({ error: "Photo not found." }, { status: 404 });
  if (isPrivateCommunityBlob(removed.imageUrl)) {
    await del(removed.imageUrl, { token: process.env.BLOB_PRIVATE_READ_WRITE_TOKEN }).catch((error) => console.error("Private Blob delete failed:", error.message));
  } else if (isOurBlob(removed.imageUrl, ["/city-tours-community/"])) {
    await del(removed.imageUrl).catch((error) => console.error("Blob delete failed:", error.message));
  }
  await releaseCommunityUpload(auth.user.id);
  return NextResponse.json({ success: true });
}
