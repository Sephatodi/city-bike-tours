import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db/client";
import { users, adminActivationCodes } from "@/db/schema";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { STAFF_ROLES } from "@/lib/rbac";
import { verifyActivationCode } from "@/lib/admin-activation";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

const schema = z.object({
  email: z.string().trim().email().max(120),
  code: z.string().trim().max(12),
  password: z.string().min(8).max(128),
  confirmPassword: z.string().min(1).max(128),
});

export async function POST(request) {
  const ip = clientIp(request);
  if (!rateLimit(`admin-activate-complete:${ip}`, 15, 60 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Check the form and try again." }, { status: 400 });
  const { email, code, password, confirmPassword } = parsed.data;
  if (password !== confirmPassword) return NextResponse.json({ error: "Passwords do not match." }, { status: 400 });

  const emailNorm = email.toLowerCase();
  if (!rateLimit(`admin-activate-complete-email:${emailNorm}`, 10, 60 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
  }

  const [user] = await db.select({ id: users.id, email: users.email, name: users.name, role: users.role, status: users.status, provider: users.provider })
    .from(users).where(eq(users.email, emailNorm)).limit(1);
  if (!user || user.status !== "active" || !STAFF_ROLES.includes(user.role) || user.provider !== "credentials") {
    return NextResponse.json({ error: "This account cannot be activated. Contact an admin." }, { status: 400 });
  }

  const check = await verifyActivationCode(db, { userId: user.id, email: user.email, code });
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: 400 });

  const hash = await bcrypt.hash(password, 12);
  await db.transaction(async (tx) => {
    await tx.update(users).set({ passwordHash: hash, passwordChangedAt: new Date() }).where(eq(users.id, user.id));
    await tx.update(adminActivationCodes).set({ usedAt: new Date() })
      .where(and(eq(adminActivationCodes.id, check.row.id), isNull(adminActivationCodes.usedAt)));
  });

  try { await logAudit({ id: user.id, name: user.name, role: user.role }, "admin.activate", `Staff account activated via email+code (${user.email})`, { targetType: "user", targetId: user.id }); } catch {}
  return NextResponse.json({ ok: true, message: "Account activated. You can sign in now." });
}
