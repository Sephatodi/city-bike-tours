import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import { reviews } from "@/db/schema";
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

// Approved reviews only. Anything new waits in Dashboard > Reviews until staff approve it.
export async function GET() {
  const rows = await db.select({ id: reviews.id, name: reviews.name, rating: reviews.rating, comment: reviews.comment, rideDate: reviews.rideDate })
    .from(reviews).where(eq(reviews.status, "approved")).orderBy(desc(reviews.createdAt)).limit(30);
  return NextResponse.json({ reviews: rows });
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
