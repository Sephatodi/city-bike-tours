import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import { reviews, users } from "@/db/schema";
import { requirePermission } from "@/lib/rbac";
import { logAudit } from "@/lib/audit";
import { renderEmailTemplate } from "@/lib/email-templates";
import { sendEmail } from "@/lib/email";
import { getSettings } from "@/lib/settings";

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
  if (reply && updated.userId) {
    const [customer] = await db.select({ email: users.email }).from(users).where(eq(users.id, updated.userId));
    if (customer?.email) {
      const rendered = renderEmailTemplate("reviewReplied", {
        name: updated.name,
        comment: updated.comment,
        reply,
        reviewsUrl: process.env.PUBLIC_FRONTEND_URL ? new URL("/connect", process.env.PUBLIC_FRONTEND_URL).toString() : "/connect",
      }, await getSettings());
      await sendEmail({
        to: customer.email,
        ...rendered,
        template: "reviewReplied",
        relatedType: "review",
        relatedId: updated.id,
      });
    }
  }
  return NextResponse.json({ review: updated });
}
