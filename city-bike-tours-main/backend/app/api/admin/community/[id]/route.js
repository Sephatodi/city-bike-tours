import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { del } from "@vercel/blob";
import { db } from "@/db/client";
import { communityPhotos, users } from "@/db/schema";
import { requirePermission } from "@/lib/rbac";
import { logAudit } from "@/lib/audit";
import { releaseCommunityUpload } from "@/lib/community-upload-usage";
import { isOurBlob } from "@/lib/blob-url";
import { isPrivateCommunityBlob } from "@/lib/community-media";
import { renderEmailTemplate } from "@/lib/email-templates";
import { sendEmail } from "@/lib/email";
import { getSettings } from "@/lib/settings";

export async function PATCH(request, { params }) {
  const guard = await requirePermission("inbox:write");
  if (guard.error) return guard.error;
  const parsed = z.object({ status: z.enum(["pending", "approved", "rejected"]).optional(), downloadable: z.boolean().optional() })
    .refine((v) => Object.keys(v).length > 0).safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Choose approve, reject, pending or a download setting." }, { status: 400 });
  let visibility = null;
  if (parsed.data.downloadable === true || parsed.data.status === "approved") {
    const [photo] = await db.select({ visibility: communityPhotos.visibility }).from(communityPhotos).where(eq(communityPhotos.id, params.id)).limit(1);
    if (!photo) return NextResponse.json({ error: "Photo not found." }, { status: 404 });
    visibility = photo.visibility;
    if (parsed.data.downloadable === true && visibility !== "public") return NextResponse.json({ error: "Private uploads can't be made publicly downloadable." }, { status: 400 });
  }
  const updates = {
    ...parsed.data,
    ...(parsed.data.status === "approved" && visibility === "public" ? { downloadable: true } : {}),
  };
  const [updated] = await db.update(communityPhotos).set(updates).where(eq(communityPhotos.id, params.id)).returning();
  if (!updated) return NextResponse.json({ error: "Photo not found." }, { status: 404 });
  await logAudit(guard.staff, "community.photo", `${"downloadable" in parsed.data ? (updated.downloadable ? "Allowed downloads of" : "Blocked downloads of") : updated.status === "approved" ? "Approved" : updated.status === "rejected" ? "Rejected" : "Reset"} "${updated.title}" by ${updated.authorName}`, { targetType: "community_photo", targetId: updated.id });
  if (parsed.data.status === "approved") {
    const [customer] = await db.select({ email: users.email }).from(users).where(eq(users.id, updated.userId));
    if (customer?.email) {
      const rendered = renderEmailTemplate("photoApproved", {
        name: updated.authorName,
        title: updated.title,
        galleryUrl: process.env.PUBLIC_FRONTEND_URL ? new URL("/gallery", process.env.PUBLIC_FRONTEND_URL).toString() : "/gallery",
      }, await getSettings());
      await sendEmail({
        to: customer.email,
        ...rendered,
        template: "photoApproved",
        relatedType: "community_photo",
        relatedId: updated.id,
      });
    }
  }
  return NextResponse.json({ photo: updated });
}

export async function DELETE(_request, { params }) {
  const guard = await requirePermission("inbox:write");
  if (guard.error) return guard.error;
  const [removed] = await db.delete(communityPhotos).where(eq(communityPhotos.id, params.id)).returning();
  if (removed) {
    if (isPrivateCommunityBlob(removed.imageUrl)) {
      await del(removed.imageUrl, { token: process.env.BLOB_PRIVATE_READ_WRITE_TOKEN }).catch((error) => console.error("Private Blob delete failed:", error.message));
    } else if (isOurBlob(removed.imageUrl, ["/city-tours-community/"])) {
      await del(removed.imageUrl).catch((error) => console.error("Blob delete failed:", error.message));
    }
    await releaseCommunityUpload(removed.userId);
    await logAudit(guard.staff, "community.photo_delete", `Deleted "${removed.title}" by ${removed.authorName}`, { targetType: "community_photo", targetId: removed.id });
  }
  return NextResponse.json({ success: true });
}
