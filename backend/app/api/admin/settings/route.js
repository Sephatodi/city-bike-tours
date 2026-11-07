import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { siteSettings } from "@/db/schema";
import { siteSettingsSchema } from "@/lib/validators";
import { getAdminSession, requirePermission } from "@/lib/admin";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  requirePermission(session, "settings:read");

  try {
    const settings = await db.select().from(siteSettings).orderBy(desc(siteSettings.updatedAt));
    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Admin settings query failed:", error);
    return NextResponse.json({ error: "Failed to load settings." }, { status: 503 });
  }
}

export async function POST(request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  requirePermission(session, "settings:update");

  const parsed = siteSettingsSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid settings data." }, { status: 400 });

  try {
    const [created] = await db.insert(siteSettings).values({
      ...parsed.data,
      updatedAt: new Date(),
    }).returning();

    return NextResponse.json({ setting: created }, { status: 201 });
  } catch (error) {
    if (error.code === "23505") return NextResponse.json({ error: "Setting key already exists." }, { status: 409 });
    console.error("Admin settings create failed:", error);
    return NextResponse.json({ error: "Failed to create setting." }, { status: 503 });
  }
}