import { NextResponse } from "next/server";
import { desc, eq, count, avg, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import { reviews, reviewVotes } from "@/db/schema";
import { newId } from "@/lib/id";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { fireWebhook } from "@/lib/webhook";

export const dynamic = "force-dynamic";

const schema = z.object({
  name: z.string().trim().min(1, "Please tell us your name.").max(80),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(5, "Please write a little more.").max(600),
  rideDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  website: z.string().max(0).optional(),
});

// Only approved reviews are public. Summary values are calculated from the full approved set.
export async function GET() {
  const rows = await db.select({
    id: reviews.id, name: reviews.name, rating: reviews.rating, comment: reviews.comment,
    rideDate: reviews.rideDate, tour: reviews.tour, riderOrigin: reviews.riderOrigin,
    photoUrl: reviews.photoUrl, stops: reviews.stops, createdAt: reviews.createdAt,
    adminReply: reviews.adminReply, adminReplyAt: reviews.adminReplyAt,
  }).from(reviews).where(eq(reviews.status, "approved")).orderBy(desc(reviews.createdAt)).limit(100);
  const approved = await db.select({ rating: reviews.rating }).from(reviews).where(eq(reviews.status, "approved"));
  const distribution = Object.fromEntries([1,2,3,4,5].map(n => [n, approved.filter(r => r.rating === n).length]));
  const total = approved.length;
  const average = total ? approved.reduce((sum, r) => sum + r.rating, 0) / total : 0;
  const helpful = await db.select({ reviewId: reviewVotes.reviewId, total: count() }).from(reviewVotes).groupBy(reviewVotes.reviewId);
  const counts = new Map(helpful.map(x => [x.reviewId, Number(x.total)]));
  return NextResponse.json({ reviews: rows.map(r => ({ ...r, helpfulCount: counts.get(r.id) || 0 })), summary: {
    count: total, average: Number(average.toFixed(2)), distribution,
    fourPlusPercent: total ? Math.round(((distribution[4] + distribution[5]) / total) * 100) : 0,
  }});
}

export async function POST(request) {
  if (!rateLimit(`review:${clientIp(request)}`, 3, 60 * 60 * 1000)) return NextResponse.json({ error: "Too many reviews. Please try again later." }, { status: 429 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Please check your review." }, { status: 400 });
  const id = newId();
  const { website, ...values } = parsed.data;
  await db.insert(reviews).values({ id, ...values });
  await fireWebhook("review.created", { id, ...values });
  return NextResponse.json({ success: true, message: "Thank you! Your review will appear once we've read it." }, { status: 201 });
}
