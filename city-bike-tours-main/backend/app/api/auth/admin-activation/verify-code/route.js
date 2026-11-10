import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { verifyActivationCode, ACTIVATION_MAX_ATTEMPTS, createActivationToken } from "@/lib/admin-activation";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export async function POST(request) {
  if (!rateLimit(`admin-activation-code:${clientIp(request)}`, 20, 60 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
  }
  const body = await request.json().catch(() => null);
  const email = String(body?.email || "").trim().toLowerCase();
  const code = String(body?.code || "").trim();
  if (!email || !/^\d{6}$/.test(code)) return NextResponse.json({ error: "Enter your email and the 6-digit code." }, { status: 400 });

  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (!user || !user.activationRequired || !user.activationCodeHash) {
    return NextResponse.json({ error: "That code isn't right or activation isn't required." }, { status: 400 });
  }
  if (user.activationCodeExpiresAt && user.activationCodeExpiresAt < new Date()) {
    return NextResponse.json({ error: "That activation code has expired. Ask an admin to reset it." }, { status: 400 });
  }
  if ((user.activationAttempts || 0) >= ACTIVATION_MAX_ATTEMPTS) {
    return NextResponse.json({ error: "Too many incorrect attempts. Ask an admin to reset activation." }, { status: 400 });
  }

  const ok = await verifyActivationCode(code, user.activationCodeHash);
  if (!ok) {
    await db.update(users).set({ activationAttempts: (user.activationAttempts || 0) + 1 }).where(eq(users.id, user.id));
    return NextResponse.json({ error: "That code isn't right. Check it and try again." }, { status: 400 });
  }

  return NextResponse.json({ ok: true, activationToken: createActivationToken(user.id) });
}
