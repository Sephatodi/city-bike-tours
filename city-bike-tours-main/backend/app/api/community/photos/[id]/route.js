import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { del } from "@vercel/blob";
import { db } from "@/db/client";
import { communityPhotos } from "@/db/schema";
import { requireCustomer } from "@/lib/customer-auth";
import { isOurBlob } from "@/lib/blob-url";

// Riders can remove their own photos at any time.
export async function DELETE(request, { params }) {
  const auth = await requireCustomer(request);
  if (auth.error) return auth.error;
  const [removed] = await db.delete(communityPhotos).where(and(eq(communityPhotos.id, params.id), eq(communityPhotos.userId, auth.user.id))).returning();
  if (!removed) return NextResponse.json({ error: "Photo not found." }, { status: 404 });
  if (isOurBlob(removed.imageUrl)) await del(removed.imageUrl).catch((error) => console.error("Blob delete failed:", error.message));
  return NextResponse.json({ success: true });
}
