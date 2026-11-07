import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { backups } from "@/db/schema";
import { getAdminSession, requirePermission } from "@/lib/admin";

export async function DELETE(request, { params }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  requirePermission(session, "backups:delete");

  try {
    const [deleted] = await db.delete(backups).where(eq(backups.id, params.id)).returning();
    if (!deleted) return NextResponse.json({ error: "Backup not found." }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin backup delete failed:", error);
    return NextResponse.json({ error: "Failed to delete backup." }, { status: 503 });
  }
}