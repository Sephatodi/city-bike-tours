import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { integrations } from "@/db/schema";
import { integrationSchema } from "@/lib/validators";
import { getAdminSession, requirePermission } from "@/lib/admin";

export async function PATCH(request, { params }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  requirePermission(session, "integrations:update");

  const parsed = integrationSchema.partial().safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid integration data." }, { status: 400 });

  try {
    const [updated] = await db.update(integrations)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(integrations.id, params.id))
      .returning();

    if (!updated) return NextResponse.json({ error: "Integration not found." }, { status: 404 });
    return NextResponse.json({ integration: updated });
  } catch (error) {
    console.error("Admin integration update failed:", error);
    return NextResponse.json({ error: "Failed to update integration." }, { status: 503 });
  }
}

export async function DELETE(request, { params }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  requirePermission(session, "integrations:update");

  try {
    const [deleted] = await db.delete(integrations).where(eq(integrations.id, params.id)).returning();
    if (!deleted) return NextResponse.json({ error: "Integration not found." }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin integration delete failed:", error);
    return NextResponse.json({ error: "Failed to delete integration." }, { status: 503 });
  }
}