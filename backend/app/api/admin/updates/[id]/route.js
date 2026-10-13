import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { softwareUpdates } from "@/db/schema";
import { softwareUpdateSchema } from "@/lib/validators";
import { getAdminSession, requirePermission } from "@/lib/admin";

export async function PATCH(request, { params }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  requirePermission(session, "updates:update");

  const parsed = softwareUpdateSchema.partial().safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid update data." }, { status: 400 });

  try {
    const [updated] = await db.update(softwareUpdates)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(softwareUpdates.id, params.id))
      .returning();

    if (!updated) return NextResponse.json({ error: "Update not found." }, { status: 404 });
    return NextResponse.json({ update: updated });
  } catch (error) {
    console.error("Admin update failed:", error);
    return NextResponse.json({ error: "Failed to update." }, { status: 503 });
  }
}

export async function DELETE(request, { params }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  requirePermission(session, "updates:update");

  try {
    const [deleted] = await db.delete(softwareUpdates).where(eq(softwareUpdates.id, params.id)).returning();
    if (!deleted) return NextResponse.json({ error: "Update not found." }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin update delete failed:", error);
    return NextResponse.json({ error: "Failed to delete update." }, { status: 503 });
  }
}