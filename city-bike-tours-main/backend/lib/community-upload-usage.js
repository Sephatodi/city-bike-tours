import { and, eq, gt, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { communityBookingUploadUsage, communityUploadUsage } from "@/db/schema";

export async function releaseCommunityUpload({ userId, bookingId } = {}) {
  try {
    if (bookingId) {
      await db.update(communityBookingUploadUsage)
        .set({ count: sql`${communityBookingUploadUsage.count} - 1` })
        .where(and(eq(communityBookingUploadUsage.bookingId, bookingId), gt(communityBookingUploadUsage.count, 0)));
      return;
    }
    if (!userId) return;
    await db.update(communityUploadUsage)
      .set({ count: sql`${communityUploadUsage.count} - 1` })
      .where(and(eq(communityUploadUsage.userId, userId), gt(communityUploadUsage.count, 0)));
  } catch (error) {
    console.error("Community upload limit release failed:", error);
  }
}
