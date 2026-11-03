import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { db } from "@/db/client";
import { communityPhotos } from "@/db/schema";
import { requirePermission } from "@/lib/rbac";
import { communityMediaUrl } from "@/lib/community-media";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const guard = await requirePermission("inbox:read");
  if (guard.error) return guard.error;
  const photos = await db.select().from(communityPhotos).orderBy(desc(communityPhotos.createdAt)).limit(300);
  return NextResponse.json({
    photos: photos.map((photo) => ({ ...photo, imageUrl: communityMediaUrl(request, photo) })),
  });
}
