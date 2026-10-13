import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { securitySettings } from "@/db/schema";
import { securitySettingsSchema } from "@/lib/validators";
import { getAdminSession, requirePermission } from "@/lib/admin";

export async function PATCH(request, { params }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  requirePermission(session, "security:update");

  const parsed = securitySettingsSchema.partial().safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid security setting." }, { status: 400 });

  try {
    const [updated] = await db.update(securitySettings)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(securitySettings.id, Number(params.id)))
      .returning();

    if (!updated) return NextResponse.json({ error: "Security setting not found." }, { status: 404 });
    return NextResponse.json({ setting: updated });
  } catch (error) {
    console.error("Admin security setting update failed:", error);
    return NextResponse.json({ error: "Failed to update security setting." }, { status: 503 });
  }
}

export async function DELETE(request, { params }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  requirePermission(session, "security:update");

  try {
    const [deleted] = await db.delete(securitySettings).where(eq(securitySettings.id, Number(params.id))).returning();
    if (!deleted) return NextResponse.json({ error: "Security setting not found." }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin security setting delete failed:", error);
    return NextResponse.json({ error: "Failed to delete security setting." }, { status: 503 });
  }
}