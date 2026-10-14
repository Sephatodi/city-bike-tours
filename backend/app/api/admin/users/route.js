import { NextResponse } from "next/server";
import { desc, eq, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import { db } from "@/db/client";
import { bookings, users } from "@/db/schema";
import { requirePermission } from "@/lib/rbac";
import { logAudit } from "@/lib/audit";
import { userCreateSchema } from "@/lib/validators";
import { normalizePhone } from "@/lib/phone";
import { newId } from "@/lib/id";

export const dynamic = "force-dynamic";

export async function GET() {
  const guard = await requirePermission("users:read");
  if (guard.error) return guard.error;

  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      phone: users.phone,
      role: users.role,
      status: users.status,
      team: users.team,
      mfaEnabled: users.mfaEnabled,
      provider: users.provider,
      createdAt: users.createdAt,
      bookingCount: sql`(SELECT COUNT(*)::int FROM ${bookings} WHERE ${bookings.userId} = ${users.id})`,
    })
    .from(users)
    .orderBy(desc(users.createdAt));

  return NextResponse.json({ users: rows });
}

export async function POST(request) {
  const guard = await requirePermission("users:write");
  if (guard.error) return guard.error;

  const parsed = userCreateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid user." }, { status: 400 });

  const { name, email, phone, role, password, team } = parsed.data;
  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email));
  if (existing) return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });

  let normalizedPhone = null;
  if (phone) {
    normalizedPhone = normalizePhone(phone);
    if (!normalizedPhone) return NextResponse.json({ error: "Enter a valid phone number, including its country code if outside Botswana." }, { status: 400 });
  }

  const plain = password || randomBytes(9).toString("base64url");
  const [created] = await db.insert(users).values({
    id: newId(),
    name,
    email,
    phone: normalizedPhone,
    passwordHash: await bcrypt.hash(plain, 10),
    provider: "credentials",
    role,
    team: team || null,
  }).returning({ id: users.id, name: users.name, email: users.email, role: users.role, status: users.status });

  await logAudit(guard.staff, "user.create", `Created ${role} account for ${name} (${email})`, { targetType: "user", targetId: created.id });
  // A generated password is shown once, in this response only.
  return NextResponse.json({ user: created, tempPassword: password ? null : plain }, { status: 201 });
}
