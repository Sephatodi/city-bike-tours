import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { siteSettings } from "@/db/schema";
import { siteSettingsSchema } from "@/lib/validators";
import { getAdminSession, requirePermission } from "@/lib/admin";

export async function PATCH(request, { params }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  requirePermission(session, "settings:update");

  const parsed = siteSettingsSchema.partial().safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid settings data." }, { status: 400 });

  try {
    const [updated] = await db.update(siteSettings)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(siteSettings.id, Number(params.id)))
      .returning();

    if (!updated) return NextResponse.json({ error: "Setting not found." }, { status: 404 });
    return NextResponse.json({ setting: updated });
  } catch (error) {
    console.error("Admin settings update failed:", error);
    return NextResponse.json({ error: "Failed to update setting." }, { status: 503 });
  }
}

export async function DELETE(request, { params }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  requirePermission(session, "settings:update");

  try {
    const [deleted] = await db.delete(siteSettings).where(eq(siteSettings.id, Number(params.id))).returning();
    if (!deleted) return NextResponse.json({ error: "Setting not found." }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin settings delete failed:", error);
    return NextResponse.json({ error: "Failed to delete setting." }, { status: 503 });
  }
}