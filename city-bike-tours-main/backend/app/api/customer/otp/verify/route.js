import { NextResponse } from "next/server";
import { and, desc, eq, gt, isNull } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import { otpCodes, users } from "@/db/schema";
import { newId } from "@/lib/id";
import { normalizePhone } from "@/lib/phone";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { OTP_MAX_ATTEMPTS, codeMatches } from "@/lib/otp";
import { issueCustomerToken, publicUser } from "@/lib/customer-auth";

const schema = z.object({
  phone: z.string().trim().min(7).max(30),
  code: z.string().trim().regex(/^\d{6}$/, "Enter the 6-digit code."),
  name: z.string().trim().max(160).optional(),
});

export async function POST(request) {
  if (!rateLimit(`otp-verify:${clientIp(request)}`, 20, 60 * 60 * 1000)) return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Enter the 6-digit code." }, { status: 400 });
  const phone = normalizePhone(parsed.data.phone);
  if (!phone) return NextResponse.json({ error: "Enter a valid phone number." }, { status: 400 });

  const [row] = await db.select().from(otpCodes)
    .where(and(eq(otpCodes.phone, phone), isNull(otpCodes.consumedAt), gt(otpCodes.expiresAt, new Date())))
    .orderBy(desc(otpCodes.createdAt)).limit(1);
  if (!row || row.attempts >= OTP_MAX_ATTEMPTS) return NextResponse.json({ error: "That code has expired. Ask for a new one." }, { status: 400 });

  if (!codeMatches(phone, parsed.data.code, row.codeHash)) {
    await db.update(otpCodes).set({ attempts: row.attempts + 1 }).where(eq(otpCodes.id, row.id));
    return NextResponse.json({ error: "That code isn't right. Check it and try again." }, { status: 400 });
  }
  await db.update(otpCodes).set({ consumedAt: new Date() }).where(eq(otpCodes.id, row.id));

  let [user] = await db.select().from(users).where(eq(users.phone, phone)).limit(1);
  if (user && user.status !== "active") return NextResponse.json({ error: "This account can't sign in." }, { status: 403 });
  if (user && user.role !== "customer") return NextResponse.json({ error: "Staff accounts sign in from the admin dashboard." }, { status: 403 });
  if (!user) {
    const id = newId();
    const digits = phone.replace(/\D/g, "");
    [user] = await db.insert(users).values({
      id, name: parsed.data.name || `Rider ${digits.slice(-4)}`,
      email: `${digits}@phone.citybiketours.invalid`, phone, provider: row.channel, role: "customer",
    }).returning();
  }
  return NextResponse.json({ token: issueCustomerToken(user.id), user: publicUser(user) });
}
