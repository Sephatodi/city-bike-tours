import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { authOptions } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { requirePermission } from "@/lib/rbac";

export async function PATCH(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const guard = await requirePermission("users:write");
  if (guard.error) return guard.error;
  const staff = guard.staff;

  const body = await request.json().catch(() => null);
  const { changePassword } = body || {};
  if (!changePassword || typeof changePassword !== "string" || changePassword.length < 12) {
    return NextResponse.json({ error: "New password must be at least 12 characters." }, { status: 400 });
  }

  const [target] = await db.select().from(users).where(eq(users.id, session.user.id));
  if (!target) return NextResponse.json({ error: "User not found." }, { status: 404 });
  if (target.provider !== "credentials") {
    return NextResponse.json({ error: `This account signs in with ${target.provider}, so it has no password to change.` }, { status: 409 });
  }

  const updates = { passwordHash: await bcrypt.hash(changePassword, 10) };
  await db.update(users).set(updates).where(eq(users.id, session.user.id));

  await logAudit(staff, "user.change_password", `${target.name}: changed own password`, { targetType: "user", targetId: target.id });
  return NextResponse.json({ success: true });
}