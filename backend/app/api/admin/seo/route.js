import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { seoSettings } from "@/db/schema";
import { seoSettingsSchema } from "@/lib/validators";
import { getAdminSession, requirePermission } from "@/lib/admin";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  requirePermission(session, "seo:read");

  try {
    const settings = await db.select().from(seoSettings).orderBy(desc(seoSettings.updatedAt));
    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Admin SEO query failed:", error);
    return NextResponse.json({ error: "Failed to load SEO settings." }, { status: 503 });
  }
}

export async function POST(request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  requirePermission(session, "seo:update");

  const parsed = seoSettingsSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid SEO data." }, { status: 400 });

  try {
    const [created] = await db.insert(seoSettings).values({
      ...parsed.data,
      updatedAt: new Date(),
    }).returning();

    return NextResponse.json({ setting: created }, { status: 201 });
  } catch (error) {
    if (error.code === "23505") return NextResponse.json({ error: "SEO setting for this path already exists." }, { status: 409 });
    console.error("Admin SEO create failed:", error);
    return NextResponse.json({ error: "Failed to create SEO setting." }, { status: 503 });
  }
}