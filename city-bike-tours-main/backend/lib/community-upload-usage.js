import { and, eq, gt, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { communityUploadUsage } from "@/db/schema";

export async function releaseCommunityUpload(userId) {
  try {
    const [released] = await db.update(communityUploadUsage)
      .set({ count: sql`${communityUploadUsage.count} - 1` })
      .where(and(eq(communityUploadUsage.userId, userId), gt(communityUploadUsage.count, 0)))
      .returning({ userId: communityUploadUsage.userId });
    if (!released) console.error("Community upload limit could not be released.");
  } catch (error) {
    console.error("Community upload limit release failed:", error);
  }
}
