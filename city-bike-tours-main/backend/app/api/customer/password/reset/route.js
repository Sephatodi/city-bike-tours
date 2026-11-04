import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { and, eq, gt, isNull, ne } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import { passwordResetTokens, users } from "@/db/schema";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  token: z.string().min(20).max(200),
  password: z.string().min(8, "Password must be at least 8 characters.").max(100),
});
const genericError = "This reset link is invalid or has expired. Request a new one.";
const tokenDigest = (token) => createHash("sha256").update(token).digest("hex");

export async function POST(request) {
  const ip = clientIp(request);
  if (!rateLimit(`password-reset:${ip}`, 10, 60 * 60 * 1000)) {
    return NextResponse.json({ error: genericError }, { status: 400 });
  }
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || genericError }, { status: 400 });
  }
  const now = new Date();
  const tokenHash = tokenDigest(parsed.data.token);
  const [reset] = await db.update(passwordResetTokens).set({ usedAt: now })
    .where(and(
      eq(passwordResetTokens.tokenHash, tokenHash),
      isNull(passwordResetTokens.usedAt),
      gt(passwordResetTokens.expiresAt, now),
    ))
    .returning({ id: passwordResetTokens.id, userId: passwordResetTokens.userId });
  if (!reset) return NextResponse.json({ error: genericError }, { status: 400 });

  const [user] = await db.select({ id: users.id, role: users.role }).from(users).where(eq(users.id, reset.userId));
  if (!user || user.role !== "customer") return NextResponse.json({ error: genericError }, { status: 400 });

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  await db.update(users).set({ passwordHash, passwordChangedAt: now }).where(eq(users.id, user.id));
  await db.delete(passwordResetTokens).where(and(
    eq(passwordResetTokens.userId, user.id),
    ne(passwordResetTokens.id, reset.id),
  ));
  return NextResponse.json({ message: "Your password has been updated. Sign in with your new password." });
}
