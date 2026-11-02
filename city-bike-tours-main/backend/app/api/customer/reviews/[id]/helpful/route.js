import { NextResponse } from "next/server";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { reviewVotes, reviews } from "@/db/schema";
import { requireCustomer } from "@/lib/customer-auth";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

// Toggles "found this helpful" for the signed-in customer. Only approved reviews can be voted on.
export async function POST(request, { params }) {
  const auth = await requireCustomer(request);
  if (auth.error) return auth.error;
  if (!rateLimit(`helpful:${auth.user.id}:${clientIp(request)}`, 60, 60 * 60 * 1000)) return NextResponse.json({ error: "Too many votes. Please try again later." }, { status: 429 });
  const { id } = await params;
  const [review] = await db.select({ id: reviews.id, userId: reviews.userId }).from(reviews).where(and(eq(reviews.id, id), eq(reviews.status, "approved")));
  if (!review) return NextResponse.json({ error: "Review not found." }, { status: 404 });
  if (review.userId === auth.user.id) return NextResponse.json({ error: "You can't vote on your own review." }, { status: 400 });

  const existing = await db.select({ userId: reviewVotes.userId }).from(reviewVotes).where(and(eq(reviewVotes.reviewId, id), eq(reviewVotes.userId, auth.user.id)));
  if (existing.length) await db.delete(reviewVotes).where(and(eq(reviewVotes.reviewId, id), eq(reviewVotes.userId, auth.user.id)));
  else await db.insert(reviewVotes).values({ reviewId: id, userId: auth.user.id });
  const [{ count }] = await db.select({ count: sql`count(*)::int` }).from(reviewVotes).where(eq(reviewVotes.reviewId, id));
  return NextResponse.json({ helpful: !existing.length, helpfulCount: Number(count) });
}
