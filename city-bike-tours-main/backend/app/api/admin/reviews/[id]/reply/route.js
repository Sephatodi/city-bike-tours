import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import { reviews } from "@/db/schema";
import { requirePermission } from "@/lib/rbac";
import { logAudit } from "@/lib/audit";

const schema = z.object({ reply: z.string().trim().max(600, "Keep the reply under 600 characters.") });

// Staff answer a review. The reply shows under the review on the website once the review is approved.
// Sending an empty reply removes it.
export async function POST(request, { params }) {
  const guard = await requirePermission("inbox:write");
  if (guard.error) return guard.error;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Write a reply first." }, { status: 400 });
  const reply = parsed.data.reply;
  const [updated] = await db.update(reviews).set(reply
    ? { adminReply: reply, adminReplyBy: guard.staff.name, adminReplyAt: new Date() }
    : { adminReply: null, adminReplyBy: null, adminReplyAt: null })
    .where(eq(reviews.id, params.id)).returning();
  if (!updated) return NextResponse.json({ error: "Review not found." }, { status: 404 });
  await logAudit(guard.staff, "inbox.review_reply", `${reply ? "Replied to" : "Removed reply to"} ${updated.name}'s review`, { targetType: "review", targetId: updated.id });
  return NextResponse.json({ review: updated });
}
