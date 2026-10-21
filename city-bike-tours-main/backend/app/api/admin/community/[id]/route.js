import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { del } from "@vercel/blob";
import { db } from "@/db/client";
import { communityPhotos } from "@/db/schema";
import { requirePermission } from "@/lib/rbac";
import { logAudit } from "@/lib/audit";
import { isOurBlob } from "@/lib/blob-url";

export async function PATCH(request, { params }) {
  const guard = await requirePermission("inbox:write");
  if (guard.error) return guard.error;
  const parsed = z.object({ status: z.enum(["pending", "approved", "rejected"]).optional(), downloadable: z.boolean().optional() })
    .refine((v) => Object.keys(v).length > 0).safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Choose approve, reject, pending or a download setting." }, { status: 400 });
  const [updated] = await db.update(communityPhotos).set(parsed.data).where(eq(communityPhotos.id, params.id)).returning();
  if (!updated) return NextResponse.json({ error: "Photo not found." }, { status: 404 });
  await logAudit(guard.staff, "community.photo", `${"downloadable" in parsed.data ? (updated.downloadable ? "Allowed downloads of" : "Blocked downloads of") : updated.status === "approved" ? "Approved" : updated.status === "rejected" ? "Rejected" : "Reset"} "${updated.title}" by ${updated.authorName}`, { targetType: "community_photo", targetId: updated.id });
  return NextResponse.json({ photo: updated });
}

export async function DELETE(_request, { params }) {
  const guard = await requirePermission("inbox:write");
  if (guard.error) return guard.error;
  const [removed] = await db.delete(communityPhotos).where(eq(communityPhotos.id, params.id)).returning();
  if (removed) {
    if (isOurBlob(removed.imageUrl)) await del(removed.imageUrl).catch((error) => console.error("Blob delete failed:", error.message));
    await logAudit(guard.staff, "community.photo_delete", `Deleted "${removed.title}" by ${removed.authorName}`, { targetType: "community_photo", targetId: removed.id });
  }
  return NextResponse.json({ success: true });
}
