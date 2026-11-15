import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import { passwordResetTokens, users } from "@/db/schema";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { newId } from "@/lib/id";
import { getSettings } from "@/lib/settings";
import { renderEmailTemplate } from "@/lib/email-templates";
import { sendEmail } from "@/lib/email";

const schema = z.object({ email: z.string().trim().toLowerCase().email() });
const genericMessage = "If that email has an account, we've sent instructions.";
const tokenDigest = (token) => createHash("sha256").update(token).digest("hex");

export async function POST(request) {
  const ip = clientIp(request);
  if (!rateLimit(`admin-password-forgot-ip:${ip}`, 10, 60 * 60 * 1000)) {
    return NextResponse.json({ message: genericMessage });
  }
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: genericMessage });
  const { email } = parsed.data;
  const emailKey = createHash("sha256").update(email).digest("hex");
  if (!rateLimit(`admin-password-forgot-email:${emailKey}`, 5, 60 * 60 * 1000)) {
    return NextResponse.json({ message: genericMessage });
  }

  try {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    if (!user || !["admin", "editor", "viewer"].includes(user.role) || email.toLowerCase().endsWith(".invalid")) {
      return NextResponse.json({ message: genericMessage });
    }
    if (!user.passwordHash) {
      const frontend = process.env.PUBLIC_FRONTEND_URL
        || process.env.FRONTEND_URL
        || process.env.FRONTEND_ORIGIN?.split(",")[0]?.trim()
        || new URL(request.url).origin;
      const rendered = renderEmailTemplate("passwordResetSocial", {
        provider: user.provider,
        loginUrl: new URL("/admin/login", frontend).toString(),
      }, await getSettings());
      await sendEmail({
        to: user.email,
        ...rendered,
        template: "passwordResetSocial",
        relatedType: "user",
        relatedId: user.id,
      });
      return NextResponse.json({ message: genericMessage });
    }

    const now = new Date();
    await db.update(passwordResetTokens).set({ usedAt: now })
      .where(eq(passwordResetTokens.userId, user.id));
    const token = randomBytes(32).toString("base64url");
    await db.insert(passwordResetTokens).values({
      id: newId(),
      userId: user.id,
      tokenHash: tokenDigest(token),
      expiresAt: new Date(now.getTime() + 30 * 60 * 1000),
      requestIp: ip,
    });
    const frontend = process.env.PUBLIC_FRONTEND_URL
      || process.env.FRONTEND_URL
      || process.env.FRONTEND_ORIGIN?.split(",")[0]?.trim()
      || new URL(request.url).origin;
    const rendered = renderEmailTemplate("passwordReset", {
      resetUrl: new URL(`/admin/reset-password?token=${encodeURIComponent(token)}`, frontend).toString(),
    }, await getSettings());
    await sendEmail({
      to: user.email,
      ...rendered,
      template: "passwordReset",
      relatedType: "user",
      relatedId: user.id,
    });
  } catch (error) {
    console.error("Admin password reset request failed:", error instanceof Error ? error.message : "unknown error");
  }
  return NextResponse.json({ message: genericMessage });
}