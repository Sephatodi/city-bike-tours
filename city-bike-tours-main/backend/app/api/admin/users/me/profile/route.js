import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { authOptions } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { normalizePhone } from "@/lib/phone";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const [user] = await db.select({ id: users.id, name: users.name, email: users.email, phone: users.phone, role: users.role, team: users.team, provider: users.provider })
    .from(users).where(eq(users.id, session.user.id));
  if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });
  return NextResponse.json({ user });
}

export async function PATCH(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const body = await request.json().catch(() => null);
  const updates = {};
  if (typeof body?.name === "string") updates.name = body.name.trim().slice(0, 120);
  if (body?.phone !== undefined) {
    const p = body.phone ? normalizePhone(body.phone) : null;
    if (body.phone && !p) return NextResponse.json({ error: "Enter a valid phone number." }, { status: 400 });
    updates.phone = p;
  }
  if (!Object.keys(updates).length) return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  await db.update(users).set(updates).where(eq(users.id, session.user.id));
  try { await logAudit({ id: session.user.id }, "user.edit", "Updated own profile", { targetType: "user", targetId: session.user.id }); } catch {}
  const [user] = await db.select({ id: users.id, name: users.name, email: users.email, phone: users.phone, role: users.role, team: users.team })
    .from(users).where(eq(users.id, session.user.id));
  return NextResponse.json({ user });
}
