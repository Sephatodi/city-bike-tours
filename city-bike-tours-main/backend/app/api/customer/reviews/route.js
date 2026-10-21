import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import { reviews } from "@/db/schema";
import { newId } from "@/lib/id";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { requireCustomer } from "@/lib/customer-auth";
import { fireWebhook } from "@/lib/webhook";

export const dynamic = "force-dynamic";

const schema = z.object({
  rating: z.number().int().min(1, "Choose a star rating.").max(5),
  comment: z.string().trim().min(5, "Please write a little more.").max(600, "Keep it under 600 characters."),
  rideDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal("")),
});

// The customer's own reviews, including ones still waiting for approval and any reply from the team.
export async function GET(request) {
  const auth = await requireCustomer(request);
  if (auth.error) return auth.error;
  const rows = await db.select({
    id: reviews.id, rating: reviews.rating, comment: reviews.comment, rideDate: reviews.rideDate, status: reviews.status,
    adminReply: reviews.adminReply, adminReplyAt: reviews.adminReplyAt, createdAt: reviews.createdAt,
  }).from(reviews).where(eq(reviews.userId, auth.user.id)).orderBy(desc(reviews.createdAt)).limit(50);
  return NextResponse.json({ reviews: rows });
}

export async function POST(request) {
  const auth = await requireCustomer(request);
  if (auth.error) return auth.error;
  if (!rateLimit(`cust-review:${auth.user.id}`, 5, 24 * 60 * 60 * 1000)) return NextResponse.json({ error: "You've sent several reviews today. Please try again tomorrow." }, { status: 429 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Please check your review." }, { status: 400 });
  const values = { id: newId(), name: auth.user.name, userId: auth.user.id, rating: parsed.data.rating, comment: parsed.data.comment, rideDate: parsed.data.rideDate || null };
  await db.insert(reviews).values(values);
  await fireWebhook("review.created", { id: values.id, name: values.name, rating: values.rating, comment: values.comment });
  return NextResponse.json({ success: true, message: "Thank you! Your review will appear once our team has read it." }, { status: 201 });
}
