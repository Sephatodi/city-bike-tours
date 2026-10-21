import { NextResponse } from "next/server";
import { and, desc, eq, or } from "drizzle-orm";
import { put } from "@vercel/blob";
import { db } from "@/db/client";
import { communityPhotos } from "@/db/schema";
import { newId } from "@/lib/id";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { optionalCustomer, requireCustomer } from "@/lib/customer-auth";
import { sniffImage } from "@/lib/blob-url";
import { fireWebhook } from "@/lib/webhook";

export const dynamic = "force-dynamic";

const MAX_BYTES = 4 * 1024 * 1024; // serverless request bodies are capped around 4.5MB

const columns = {
  id: communityPhotos.id, authorName: communityPhotos.authorName, title: communityPhotos.title, story: communityPhotos.story,
  imageUrl: communityPhotos.imageUrl, status: communityPhotos.status, downloadable: communityPhotos.downloadable, createdAt: communityPhotos.createdAt, userId: communityPhotos.userId,
};

// Approved rider photos for everyone, plus the signed-in rider's own pending uploads so they can see them.
export async function GET(request) {
  const { user } = await optionalCustomer(request);
  const visible = user
    ? or(eq(communityPhotos.status, "approved"), and(eq(communityPhotos.userId, user.id), eq(communityPhotos.status, "pending")))
    : eq(communityPhotos.status, "approved");
  try {
    const rows = await db.select(columns).from(communityPhotos).where(visible).orderBy(desc(communityPhotos.createdAt)).limit(60);
    return NextResponse.json({
      photos: rows.map(({ userId, ...photo }) => ({ ...photo, mine: Boolean(user && userId === user.id) })),
    });
  } catch (error) {
    console.error("Community photos unavailable:", error);
    return NextResponse.json({ error: "Rider photos are unavailable." }, { status: 503 });
  }
}

export async function POST(request) {
  const auth = await requireCustomer(request);
  if (auth.error) return auth.error;
  if (!process.env.BLOB_READ_WRITE_TOKEN) return NextResponse.json({ error: "Photo uploads aren't switched on yet." }, { status: 501 });
  if (!rateLimit(`cust-photo:${auth.user.id}:${clientIp(request)}`, 10, 24 * 60 * 60 * 1000)) return NextResponse.json({ error: "You've shared a lot today. Please try again tomorrow." }, { status: 429 });

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  const title = String(form?.get("title") || "").trim().slice(0, 120);
  const story = String(form?.get("story") || "").trim().slice(0, 1500);
  if (!file || typeof file === "string") return NextResponse.json({ error: "Choose a photo to upload." }, { status: 400 });
  if (!title) return NextResponse.json({ error: "Give your photo a short title." }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "That photo is too large (max 4MB)." }, { status: 400 });

  const bytes = new Uint8Array(await file.arrayBuffer());
  const type = sniffImage(bytes);
  if (!type) return NextResponse.json({ error: "Only JPEG, PNG, WebP or GIF photos are allowed." }, { status: 400 });

  const id = newId();
  const extension = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif" }[type];
  let url;
  try {
    ({ url } = await put(`city-tours-community/${id}.${extension}`, Buffer.from(bytes), { access: "public", contentType: type }));
  } catch (error) {
    console.error("Community upload failed:", error);
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 502 });
  }
  const [photo] = await db.insert(communityPhotos).values({ id, userId: auth.user.id, authorName: auth.user.name, title, story: story || null, imageUrl: url }).returning(columns);
  await fireWebhook("community_photo.created", { id, name: auth.user.name, title });
  const { userId, ...rest } = photo;
  return NextResponse.json({ photo: { ...rest, mine: true }, message: "Thank you! Your photo will appear once our team has looked at it." }, { status: 201 });
}
