import { NextResponse } from "next/server";
import { and, eq, ne, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import { db } from "@/db/client";
import { bookings, users } from "@/db/schema";
import { requirePermission } from "@/lib/rbac";
import { logAudit } from "@/lib/audit";
import { userUpdateSchema } from "@/lib/validators";
import { normalizePhone } from "@/lib/phone";

async function otherActiveAdmins(excludeId) {
  const [row] = await db.select({ n: sql`COUNT(*)::int` }).from(users)
    .where(and(eq(users.role, "admin"), eq(users.status, "active"), ne(users.id, excludeId)));
  return Number(row?.n ?? 0);
}

export async function PATCH(request, { params }) {
  const guard = await requirePermission("users:write");
  if (guard.error) return guard.error;
  const staff = guard.staff;

  const parsed = userUpdateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid update." }, { status: 400 });

  const [target] = await db.select().from(users).where(eq(users.id, params.id));
  if (!target) return NextResponse.json({ error: "User not found." }, { status: 404 });

  const { resetPassword, resetMfa, changePassword, phone, ...changes } = parsed.data;
  const isSelf = target.id === staff.id;

  if (isSelf && ((changes.role && changes.role !== target.role) || (changes.status && changes.status !== target.status))) {
    return NextResponse.json({ error: "You can't change your own role or suspend yourself. Ask another admin." }, { status: 409 });
  }
  const losesAdmin = target.role === "admin" && target.status === "active"
    && ((changes.role && changes.role !== "admin") || changes.status === "suspended");
  if (losesAdmin && (await otherActiveAdmins(target.id)) === 0) {
    return NextResponse.json({ error: "This is the last active admin. Make another admin first." }, { status: 409 });
  }

  const updates = { ...changes };
  if (changes.team !== undefined) updates.team = changes.team || null;
  if (resetMfa) { updates.mfaEnabled = false; updates.mfaSecret = null; }
  if (phone !== undefined) {
    updates.phone = phone ? normalizePhone(phone) : null;
    if (phone && !updates.phone) return NextResponse.json({ error: "Enter a valid phone number, including its country code if outside Botswana." }, { status: 400 });
  }

  let plain = null;
  if (resetPassword) {
    if (target.provider !== "credentials") {
      return NextResponse.json({ error: `This account signs in with ${target.provider}, so it has no password to reset.` }, { status: 409 });
    }
    plain = randomBytes(9).toString("base64url");
    updates.passwordHash = await bcrypt.hash(plain, 10);
  }
  if (changePassword) {
    if (target.provider !== "credentials") {
      return NextResponse.json({ error: `This account signs in with ${target.provider}, so it has no password to change.` }, { status: 409 });
    }
    updates.passwordHash = await bcrypt.hash(changePassword, 10);
  }
  if (!Object.keys(updates).length) return NextResponse.json({ error: "Nothing to update." }, { status: 400 });

  const [updated] = await db.update(users).set(updates).where(eq(users.id, params.id))
    .returning({ id: users.id, name: users.name, email: users.email, role: users.role, status: users.status });

  const parts = [];
  if (changes.role && changes.role !== target.role) parts.push(`role ${target.role} → ${changes.role}`);
  if (changes.status && changes.status !== target.status) parts.push(changes.status === "suspended" ? "suspended" : "reactivated");
  if (changes.name) parts.push("name");
  if (phone !== undefined) parts.push("phone");
  if (resetPassword) parts.push("password reset");
  if (changePassword) parts.push("password changed");
  if (resetMfa) parts.push("two-step sign-in reset");
  if (changes.team !== undefined) parts.push(`team: ${changes.team || "none"}`);
  const action = resetMfa ? "user.reset_mfa" : resetPassword ? "user.reset_password"
    : changePassword ? "user.change_password"
    : changes.status && changes.status !== target.status ? (changes.status === "suspended" ? "user.suspend" : "user.reactivate")
    : changes.role && changes.role !== target.role ? "user.role" : "user.edit";
  await logAudit(staff, action, `${target.name}: ${parts.join(", ") || "updated"}`, { targetType: "user", targetId: target.id });

  return NextResponse.json({ user: updated, tempPassword: plain });
}

export async function DELETE(_request, { params }) {
  const guard = await requirePermission("users:write");
  if (guard.error) return guard.error;
  const staff = guard.staff;

  const [target] = await db.select().from(users).where(eq(users.id, params.id));
  if (!target) return NextResponse.json({ error: "User not found." }, { status: 404 });
  if (target.id === staff.id) return NextResponse.json({ error: "You can't delete your own account." }, { status: 409 });
  if (target.role === "admin" && target.status === "active" && (await otherActiveAdmins(target.id)) === 0) {
    return NextResponse.json({ error: "This is the last active admin. Make another admin first." }, { status: 409 });
  }

  // Deleting a user cascades to their bookings, so only accounts with no bookings can be removed.
  const [{ n }] = await db.select({ n: sql`COUNT(*)::int` }).from(bookings).where(eq(bookings.userId, target.id));
  if (Number(n) > 0) {
    return NextResponse.json({ error: `${target.name} has ${n} booking${n === 1 ? "" : "s"} on record. Suspend the account instead of deleting it.` }, { status: 409 });
  }

  await db.delete(users).where(eq(users.id, target.id));
  await logAudit(staff, "user.delete", `Deleted account for ${target.name} (${target.email})`, { targetType: "user", targetId: target.id });
  return NextResponse.json({ success: true });
}
