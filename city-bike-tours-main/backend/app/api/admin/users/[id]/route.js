import { NextResponse } from "next/server";
import { and, eq, inArray, ne, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import { db } from "@/db/client";
import { bookingRequests, bookings, communityPhotos, emailLogs, infobipSmsLogs, loginAttempts, otpCodes, reviews, users } from "@/db/schema";
import { del } from "@vercel/blob";
import { requirePermission } from "@/lib/rbac";
import { logAudit } from "@/lib/audit";
import { userUpdateSchema } from "@/lib/validators";
import { normalizePhone } from "@/lib/phone";
import { isOurBlob } from "@/lib/blob-url";
import { isPrivateCommunityBlob } from "@/lib/community-media";

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
    updates.passwordChangedAt = new Date();
  }
  if (changePassword) {
    if (target.provider !== "credentials") {
      return NextResponse.json({ error: `This account signs in with ${target.provider}, so it has no password to change.` }, { status: 409 });
    }
    updates.passwordHash = await bcrypt.hash(changePassword, 10);
    updates.passwordChangedAt = new Date();
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

export async function DELETE(request, { params }) {
  const guard = await requirePermission("users:write");
  if (guard.error) return guard.error;
  const staff = guard.staff;

  const [target] = await db.select().from(users).where(eq(users.id, params.id));
  if (!target) return NextResponse.json({ error: "User not found." }, { status: 404 });
  if (target.id === staff.id) return NextResponse.json({ error: "You can't delete your own account." }, { status: 409 });
  if (target.role === "admin" && target.status === "active" && (await otherActiveAdmins(target.id)) === 0) {
    return NextResponse.json({ error: "This is the last active admin. Make another admin first." }, { status: 409 });
  }

  if (target.role === "customer") {
    const body = await request.json().catch(() => ({}));
    const deleteReviews = body?.deleteReviews === true;
    const [uploads, customerReviews, requestRows, accountRows] = await Promise.all([
      db.select({ imageUrl: communityPhotos.imageUrl }).from(communityPhotos).where(eq(communityPhotos.userId, target.id)),
      db.select({ photoUrl: reviews.photoUrl }).from(reviews).where(eq(reviews.userId, target.id)),
      db.select({ id: bookingRequests.id }).from(bookingRequests).where(eq(bookingRequests.userId, target.id)),
      db.select({ id: bookings.id }).from(bookings).where(eq(bookings.userId, target.id)),
    ]);
    const blobUrls = [...new Set([
      ...uploads.map((row) => row.imageUrl),
      ...customerReviews.map((row) => row.photoUrl),
    ].filter(Boolean))];
    try {
      for (const url of blobUrls) {
        if (isPrivateCommunityBlob(url)) {
          await del(url, { token: process.env.BLOB_PRIVATE_READ_WRITE_TOKEN });
        } else if (isOurBlob(url)) {
          await del(url);
        }
      }
    } catch {
      console.error("Could not remove all customer media from Blob storage.");
      return NextResponse.json({ error: "Customer media could not be fully deleted. No account data was changed; retry the request." }, { status: 502 });
    }

    await db.update(bookingRequests).set({
      name: "Deleted customer",
      phone: null,
      email: null,
      userId: null,
    }).where(eq(bookingRequests.userId, target.id));
    const requestIds = requestRows.map((row) => row.id);
    const accountIds = accountRows.map((row) => row.id);
    if (requestIds.length) await db.delete(infobipSmsLogs).where(inArray(infobipSmsLogs.bookingRequestId, requestIds));
    if (accountIds.length) await db.delete(infobipSmsLogs).where(inArray(infobipSmsLogs.bookingId, accountIds));
    if (deleteReviews) {
      await db.delete(reviews).where(eq(reviews.userId, target.id));
    } else {
      await db.update(reviews).set({ name: "Former rider", userId: null, photoUrl: null })
        .where(eq(reviews.userId, target.id));
    }
    await db.delete(emailLogs).where(eq(emailLogs.toAddress, target.email));
    await db.delete(loginAttempts).where(eq(loginAttempts.email, target.email));
    if (target.phone) await db.delete(otpCodes).where(eq(otpCodes.phone, target.phone));
    await db.delete(users).where(eq(users.id, target.id));
    await logAudit(staff, "user.delete_customer_data", `Deleted customer account data for ${target.id}; anonymized booking records${deleteReviews ? " and deleted reviews" : " while retaining anonymized reviews"}.`, {
      targetType: "user",
      targetId: target.id,
    });
    return NextResponse.json({ success: true });
  }

  // Staff accounts with booking records are retained to preserve their history.
  const [{ n }] = await db.select({ n: sql`COUNT(*)::int` }).from(bookings).where(eq(bookings.userId, target.id));
  if (Number(n) > 0) {
    return NextResponse.json({ error: `${target.name} has ${n} booking${n === 1 ? "" : "s"} on record. Suspend the account instead of deleting it.` }, { status: 409 });
  }

  await db.delete(users).where(eq(users.id, target.id));
  await logAudit(staff, "user.delete", `Deleted account for ${target.name} (${target.email})`, { targetType: "user", targetId: target.id });
  return NextResponse.json({ success: true });
}
