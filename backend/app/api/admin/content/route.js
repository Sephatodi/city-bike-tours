import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { db } from "@/db/client";
import { siteContent } from "@/db/schema";
import { siteContentSchema } from "@/lib/validators";
import { isAdmin } from "@/lib/admin";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  const content = await db.select().from(siteContent).orderBy(desc(siteContent.createdAt));
  return NextResponse.json({ content });
}

export async function POST(request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Admin access required." }, { status: 403 });

  const parsed = siteContentSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid content." }, { status: 400 });

  const [created] = await db.insert(siteContent).values({
    ...parsed.data,
    mediaUrl: parsed.data.mediaUrl || null,
    bodyText: parsed.data.bodyText || null,
  }).returning();

  return NextResponse.json({ content: created }, { status: 201 });
}