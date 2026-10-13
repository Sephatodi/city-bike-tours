import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { teams } from "@/db/schema";
import { teamSchema } from "@/lib/validators";
import { getAdminSession, requirePermission } from "@/lib/admin";

export async function PATCH(request, { params }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  requirePermission(session, "teams:update");

  const parsed = teamSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid team data." }, { status: 400 });

  try {
    const [updated] = await db.update(teams)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(teams.id, params.id))
      .returning();

    if (!updated) return NextResponse.json({ error: "Team not found." }, { status: 404 });
    return NextResponse.json({ team: updated });
  } catch (error) {
    console.error("Admin team update failed:", error);
    return NextResponse.json({ error: "Failed to update team." }, { status: 503 });
  }
}

export async function DELETE(request, { params }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  requirePermission(session, "teams:delete");

  try {
    const [deleted] = await db.delete(teams).where(eq(teams.id, params.id)).returning();
    if (!deleted) return NextResponse.json({ error: "Team not found." }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin team delete failed:", error);
    return NextResponse.json({ error: "Failed to delete team." }, { status: 503 });
  }
}