import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { seoSettings } from "@/db/schema";
import { seoSettingsSchema } from "@/lib/validators";
import { getAdminSession, requirePermission } from "@/lib/admin";

export async function PATCH(request, { params }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  requirePermission(session, "seo:update");

  const parsed = seoSettingsSchema.partial().safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid SEO data." }, { status: 400 });

  try {
    const [updated] = await db.update(seoSettings)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(seoSettings.id, Number(params.id)))
      .returning();

    if (!updated) return NextResponse.json({ error: "SEO setting not found." }, { status: 404 });
    return NextResponse.json({ setting: updated });
  } catch (error) {
    console.error("Admin SEO update failed:", error);
    return NextResponse.json({ error: "Failed to update SEO setting." }, { status: 503 });
  }
}

export async function DELETE(request, { params }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  requirePermission(session, "seo:update");

  try {
    const [deleted] = await db.delete(seoSettings).where(eq(seoSettings.id, Number(params.id))).returning();
    if (!deleted) return NextResponse.json({ error: "SEO setting not found." }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin SEO delete failed:", error);
    return NextResponse.json({ error: "Failed to delete SEO setting." }, { status: 503 });
  }
}