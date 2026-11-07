import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { securitySettings } from "@/db/schema";
import { securitySettingsSchema } from "@/lib/validators";
import { getAdminSession, requirePermission } from "@/lib/admin";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  requirePermission(session, "security:read");

  try {
    const settings = await db.select().from(securitySettings).orderBy(desc(securitySettings.updatedAt));
    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Admin security settings query failed:", error);
    return NextResponse.json({ error: "Failed to load security settings." }, { status: 503 });
  }
}

export async function POST(request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  requirePermission(session, "security:update");

  const parsed = securitySettingsSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid security setting." }, { status: 400 });

  try {
    const [created] = await db.insert(securitySettings).values({
      ...parsed.data,
      updatedAt: new Date(),
    }).returning();

    return NextResponse.json({ setting: created }, { status: 201 });
  } catch (error) {
    if (error.code === "23505") return NextResponse.json({ error: "Security setting key already exists." }, { status: 409 });
    console.error("Admin security setting create failed:", error);
    return NextResponse.json({ error: "Failed to create security setting." }, { status: 503 });
  }
}