import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import { reviews } from "@/db/schema";
import { newId } from "@/lib/id";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { requireCustomer } from "@/lib/customer-auth";
import { fireWebhook } from "@/lib/webhook";
import { HIGHLIGHTS, SITE_IDS, TOURS } from "@/lib/review-meta";
import { storeReviewPhoto } from "@/lib/review-photo";

export const dynamic = "force-dynamic";

const schema = z.object({
  rating: z.number().int().min(1, "Choose a star rating.").max(5),
  comment: z.string().trim().min(5, "Please write a little more.").max(600, "Keep it under 600 characters."),
  rideDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal("")),
  tour: z.enum(TOURS).optional().or(z.literal("")),
  riderOrigin: z.string().trim().max(80).optional(),
  stops: z.array(z.enum(SITE_IDS)).max(6).optional(),
  highlights: z.array(z.enum(HIGHLIGHTS)).max(6).optional(),
});

// The form may arrive as JSON, or as multipart when the rider attaches a photo (fields in "data", file in "photo").
async function readInput(request) {
  if ((request.headers.get("content-type") || "").includes("multipart/form-data")) {
    const form = await request.formData().catch(() => null);
    let data = null;
    try { data = JSON.parse(String(form?.get("data") || "")); } catch { /* handled below */ }
    const photo = form?.get("photo");
    return { data, photo: photo && typeof photo !== "string" && photo.size ? photo : null };
  }
  return { data: await request.json().catch(() => null), photo: null };
}

// The customer's own reviews, including ones still waiting for approval and any reply from the team.
export async function GET(request) {
  const auth = await requireCustomer(request);
  if (auth.error) return auth.error;
  const rows = await db.select({
    id: reviews.id, rating: reviews.rating, comment: reviews.comment, rideDate: reviews.rideDate, status: reviews.status,
    adminReply: reviews.adminReply, adminReplyAt: reviews.adminReplyAt, createdAt: reviews.createdAt,
    tour: reviews.tour, photoUrl: reviews.photoUrl, stops: reviews.stops, highlights: reviews.highlights,
  }).from(reviews).where(eq(reviews.userId, auth.user.id)).orderBy(desc(reviews.createdAt)).limit(50);
  return NextResponse.json({ reviews: rows });
}

export async function POST(request) {
  const auth = await requireCustomer(request);
  if (auth.error) return auth.error;
  if (!rateLimit(`cust-review:${auth.user.id}`, 5, 24 * 60 * 60 * 1000)) return NextResponse.json({ error: "You've sent several reviews today. Please try again tomorrow." }, { status: 429 });
  const { data, photo } = await readInput(request);
  const parsed = schema.safeParse(data);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Please check your review." }, { status: 400 });
  let photoUrl = null;
  if (photo) {
    const stored = await storeReviewPhoto(photo);
    if (stored.error) return NextResponse.json({ error: stored.error }, { status: stored.status });
    photoUrl = stored.url;
  }
  const { rating, comment, rideDate, tour, riderOrigin, stops, highlights } = parsed.data;
  const values = {
    id: newId(), name: auth.user.name, userId: auth.user.id, rating, comment, rideDate: rideDate || null,
    tour: tour || null, riderOrigin: riderOrigin || null, photoUrl, stops: stops?.length ? stops : null, highlights: highlights?.length ? highlights : null,
  };
  await db.insert(reviews).values(values);
  await fireWebhook("review.created", { id: values.id, name: values.name, rating: values.rating, comment: values.comment });
  return NextResponse.json({ success: true, message: "Thank you! Your review will appear once our team has read it." }, { status: 201 });
}
