import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { authOptions } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const body = await request.json().catch(() => null);
  const { currentPassword, newPassword } = body || {};
  if (!currentPassword || !newPassword || typeof newPassword !== "string" || newPassword.length < 12) {
    return NextResponse.json({ error: "Provide current password and a new password of at least 12 characters." }, { status: 400 });
  }
  const [target] = await db.select().from(users).where(eq(users.id, session.user.id));
  if (!target) return NextResponse.json({ error: "User not found." }, { status: 404 });
  if (target.provider !== "credentials" || !target.passwordHash) {
    return NextResponse.json({ error: "This account signs in with a social provider and has no password to change here." }, { status: 409 });
  }
  const ok = await bcrypt.compare(currentPassword, target.passwordHash);
  if (!ok) return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
  await db.update(users).set({ passwordHash: await bcrypt.hash(newPassword, 10), passwordChangedAt: new Date() }).where(eq(users.id, target.id));
  try { await logAudit(target, "user.change_password", "Changed own password", { targetType: "user", targetId: target.id }); } catch {}
  return NextResponse.json({ success: true });
}
