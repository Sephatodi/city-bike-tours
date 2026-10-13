import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { adminUserUpdateSchema } from "@/lib/validators";
import { getAdminSession, requirePermission } from "@/lib/admin";

export async function PATCH(request, { params }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  requirePermission(session, "users:update");

  const parsed = adminUserUpdateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid user data." }, { status: 400 });

  const { password, ...userData } = parsed.data;

  try {
    const updateData = { ...userData, updatedAt: new Date() };
    if (password) {
      const bcrypt = await import("bcryptjs");
      updateData.passwordHash = await bcrypt.hash(password, 12);
    }

    const [updated] = await db.update(users)
      .set(updateData)
      .where(eq(users.id, params.id))
      .returning();

    if (!updated) return NextResponse.json({ error: "User not found." }, { status: 404 });
    return NextResponse.json({ user: updated });
  } catch (error) {
    console.error("Admin user update failed:", error);
    return NextResponse.json({ error: "Failed to update user." }, { status: 503 });
  }
}

export async function DELETE(request, { params }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  requirePermission(session, "users:delete");

  try {
    const [deleted] = await db.delete(users).where(eq(users.id, params.id)).returning();
    if (!deleted) return NextResponse.json({ error: "User not found." }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin user delete failed:", error);
    return NextResponse.json({ error: "Failed to delete user." }, { status: 503 });
  }
}