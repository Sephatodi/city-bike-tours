import { NextResponse } from "next/server";
import { and, desc, eq, inArray, isNotNull, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import { bookingRequests, reviewVotes, reviews, users } from "@/db/schema";
import { newId } from "@/lib/id";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { fireWebhook } from "@/lib/webhook";
import { HIGHLIGHTS } from "@/lib/review-meta";
import { optionalCustomer } from "@/lib/customer-auth";
import { notifyAdmins } from "@/lib/admin-email";

export const dynamic = "force-dynamic";

const schema = z.object({
  name: z.string().trim().min(1, "Please tell us your name.").max(80),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(5, "Please write a little more.").max(600),
  rideDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  website: z.string().max(0).optional(),
});

// Approved reviews only. Anything new waits in Dashboard > Reviews until staff approve it.
// Everything the page shows (average, distribution, "verified", helpful counts) is worked out here from real rows.
export async function GET(request) {
  const { user } = await optionalCustomer(request);
  const rows = await db.select({
    id: reviews.id, name: reviews.name, rating: reviews.rating, comment: reviews.comment, rideDate: reviews.rideDate,
    adminReply: reviews.adminReply, adminReplyAt: reviews.adminReplyAt, createdAt: reviews.createdAt, userId: reviews.userId,
    tour: reviews.tour, riderOrigin: reviews.riderOrigin, photoUrl: reviews.photoUrl, stops: reviews.stops, highlights: reviews.highlights,
    headline: reviews.headline, featured: reviews.featured, showAvatar: reviews.showAvatar,
  }).from(reviews).where(eq(reviews.status, "approved")).orderBy(desc(reviews.createdAt)).limit(200);

  // Helpful votes per review.
  const ids = rows.map((row) => row.id);
  const votes = ids.length ? await db.select({ reviewId: reviewVotes.reviewId, count: sql`count(*)::int` }).from(reviewVotes).where(inArray(reviewVotes.reviewId, ids)).groupBy(reviewVotes.reviewId) : [];
  const helpful = new Map(votes.map((vote) => [vote.reviewId, Number(vote.count)]));
  const mine = user && ids.length ? new Set((await db.select({ reviewId: reviewVotes.reviewId }).from(reviewVotes).where(and(eq(reviewVotes.userId, user.id), inArray(reviewVotes.reviewId, ids)))).map((row) => row.reviewId)) : new Set();

  // "Verified rider" = the author's phone number matches a booking that staff checked in on the day.
  const userIds = [...new Set(rows.map((row) => row.userId).filter(Boolean))];
  const phones = userIds.length ? await db.select({ id: users.id, phone: users.phone, image: users.image }).from(users).where(inArray(users.id, userIds)) : [];
  const phoneOf = new Map(phones.filter((row) => row.phone).map((row) => [row.id, row.phone]));
  const avatarOf = new Map(phones.filter((row) => row.image).map((row) => [row.id, row.image]));
  const ridden = phoneOf.size
    ? new Set((await db.selectDistinct({ phone: bookingRequests.phone }).from(bookingRequests).where(and(isNotNull(bookingRequests.checkedInAt), inArray(bookingRequests.phone, [...new Set(phoneOf.values())])))).map((row) => row.phone))
    : new Set();

  const list = rows.map(({ userId, ...row }) => ({ ...row, verified: Boolean(userId && ridden.has(phoneOf.get(userId))), avatarUrl: row.showAvatar && userId ? avatarOf.get(userId) : undefined, helpfulCount: helpful.get(row.id) || 0, voted: mine.has(row.id), mine: Boolean(user && userId === user.id) }));

  // Summary over every approved review (not just the page).
  const [totals] = await db.select({
    count: sql`count(*)::int`, average: sql`coalesce(avg(${reviews.rating}), 0)::float`,
    five: sql`count(*) filter (where ${reviews.rating} = 5)::int`, four: sql`count(*) filter (where ${reviews.rating} = 4)::int`,
    three: sql`count(*) filter (where ${reviews.rating} = 3)::int`, two: sql`count(*) filter (where ${reviews.rating} = 2)::int`, one: sql`count(*) filter (where ${reviews.rating} = 1)::int`,
  }).from(reviews).where(eq(reviews.status, "approved"));
  const count = Number(totals.count);
  const distribution = { 5: Number(totals.five), 4: Number(totals.four), 3: Number(totals.three), 2: Number(totals.two), 1: Number(totals.one) };
  const tagCounts = Object.fromEntries(HIGHLIGHTS.map((tag) => [tag, 0]));
  for (const row of list) for (const tag of Array.isArray(row.highlights) ? row.highlights : []) if (tag in tagCounts) tagCounts[tag] += 1;
  const withHighlights = list.filter((row) => Array.isArray(row.highlights) && row.highlights.length).length;

  return NextResponse.json({
    reviews: list,
    summary: {
      count, average: count ? Math.round(Number(totals.average) * 10) / 10 : 0, distribution,
      fourPlusPercent: count ? Math.round(((distribution[5] + distribution[4]) / count) * 100) : 0,
      // Share of reviews that picked each tag, among the reviews that picked any.
      highlights: withHighlights ? Object.entries(tagCounts).filter(([, n]) => n > 0).map(([tag, n]) => ({ tag, percent: Math.round((n / withHighlights) * 100) })).sort((a, b) => b.percent - a.percent) : [],
    },
  });
}

export async function POST(request) {
  if (!rateLimit(`review:${clientIp(request)}`, 3, 60 * 60 * 1000)) return NextResponse.json({ error: "Too many reviews. Please try again later." }, { status: 429 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Please check your review." }, { status: 400 });
  const id = newId();
  const { website, ...values } = parsed.data;
  await db.insert(reviews).values({ id, ...values });
  await fireWebhook("review.created", { id, ...values });
  await notifyAdmins("newReview", {
    id,
    rider: values.name,
    rating: String(values.rating),
    review: values.comment,
    receivedAt: new Date().toISOString(),
  }, { relatedType: "review", relatedId: id });
  return NextResponse.json({ success: true, message: "Thank you! Your review will appear once we've read it." }, { status: 201 });
}
