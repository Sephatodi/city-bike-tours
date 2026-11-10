import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { verifyActivationToken } from "@/lib/admin-activation";

export async function POST(request) {
  if (!rateLimit(`admin-activation-set:${clientIp(request)}`, 20, 60 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
  }
  const body = await request.json().catch(() => null);
  const token = String(body?.activationToken || "");
  const password = String(body?.password || "");
  const confirm = String(body?.confirm || "");
  if (!token || password.length < 12) return NextResponse.json({ error: "Use a password of at least 12 characters." }, { status: 400 });
  if (password !== confirm) return NextResponse.json({ error: "Passwords do not match." }, { status: 400 });

  const payload = verifyActivationToken(token);
  if (!payload?.sub) {
    return NextResponse.json({ error: "Activation session expired. Please verify your code again." }, { status: 400 });
  }

  const [user] = await db.select().from(users).where(eq(users.id, payload.sub));
  if (!user || !user.activationRequired) {
    return NextResponse.json({ error: "This account does not require activation." }, { status: 400 });
  }

  await db.update(users).set({
    passwordHash: await bcrypt.hash(password, 10),
    passwordChangedAt: new Date(),
    activationRequired: false,
    activationCodeHash: null,
    activationCodeExpiresAt: null,
    activationAttempts: 0,
  }).where(eq(users.id, user.id));

  return NextResponse.json({ ok: true });
}
