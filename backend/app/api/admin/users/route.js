import { NextResponse } from "next/server";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { users, teams } from "@/db/schema";
import { adminUserSchema, adminUserUpdateSchema } from "@/lib/validators";
import { isAdmin, getAdminSession, requirePermission } from "@/lib/admin";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  requirePermission(session, "users:read");

  try {
    const adminUsers = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      phone: users.phone,
      image: users.image,
      provider: users.provider,
      role: users.role,
      adminRole: users.adminRole,
      teamId: users.teamId,
      isActive: users.isActive,
      lastLoginAt: users.lastLoginAt,
      mfaEnabled: users.mfaEnabled,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
      teamName: teams.name,
    })
      .from(users)
      .leftJoin(teams, eq(users.teamId, teams.id))
      .where(eq(users.role, "admin"))
      .orderBy(desc(users.createdAt));

    return NextResponse.json({ users: adminUsers });
  } catch (error) {
    console.error("Admin users query failed:", error);
    return NextResponse.json({ error: "Failed to load users." }, { status: 503 });
  }
}

export async function POST(request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  requirePermission(session, "users:create");

  const parsed = adminUserSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid user data." }, { status: 400 });

  const { password, ...userData } = parsed.data;

  try {
    const [existing] = await db.select().from(users).where(eq(users.email, userData.email)).limit(1);
    if (existing) return NextResponse.json({ error: "Email already in use." }, { status: 409 });

    const crypto = await import("crypto");
    const bcrypt = await import("bcryptjs");
    const passwordHash = password ? await bcrypt.hash(password, 12) : null;

    const [created] = await db.insert(users).values({
      id: crypto.randomUUID(),
      ...userData,
      role: "admin",
      passwordHash,
    }).returning();

    return NextResponse.json({ user: created }, { status: 201 });
  } catch (error) {
    console.error("Admin user create failed:", error);
    return NextResponse.json({ error: "Failed to create user." }, { status: 503 });
  }
}