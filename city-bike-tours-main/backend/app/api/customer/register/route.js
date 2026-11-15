import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { and, desc, eq, gt, isNull } from "drizzle-orm";
import { db } from "@/db/client";
import { pendingRegistrations, users } from "@/db/schema";
import { registerSchema } from "@/lib/validators";
import { newId } from "@/lib/id";
import { normalizePhone } from "@/lib/phone";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { OTP_TTL_MS, codeMatches, generateCode, hashCode, otpChannels, sendOtp } from "@/lib/otp";
import { issueCustomerToken, publicUser, setCustomerCookie } from "@/lib/customer-auth";
import { renderEmailTemplate } from "@/lib/email-templates";
import { sendEmail } from "@/lib/email";

// Email sign-ups that include a phone number must confirm that number with a one-time code before the
// account is created. The details are held in pending_registrations until the code is verified.

async function completeRegistration(request, { name, email, phone, passwordHash }) {
  const [created] = await db.insert(users).values({
    id: newId(), name, email, phone,
    passwordHash, provider: "credentials",
  }).returning();
  const welcome = renderEmailTemplate("welcome", {
    name: created.name,
    dashboardUrl: new URL("/dashboard", process.env.PUBLIC_FRONTEND_URL || process.env.FRONTEND_URL || request.nextUrl.origin).toString(),
  });
  await sendEmail({
    to: created.email,
    ...welcome,
    template: "welcome",
    relatedType: "user",
    relatedId: created.id,
  });
  return setCustomerCookie(
    NextResponse.json({ user: publicUser(created) }, { status: 201 }),
    issueCustomerToken(created.id),
  );
}

export async function POST(request) {
  if (!rateLimit(`cust-register:${clientIp(request)}`, 6, 60 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many sign-up attempts. Please try again later." }, { status: 429 });
  }
  const parsed = registerSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  const { name, email, password, phone } = parsed.data;
  const normalizedPhone = phone ? normalizePhone(phone) : "";
  if (phone && !normalizedPhone) return NextResponse.json({ error: "Enter a valid phone number, including its country code if outside Botswana." }, { status: 400 });

  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email));
  if (existing) return NextResponse.json({ error: "An account with that email already exists. Try signing in." }, { status: 409 });

  // No phone number: create the account straight away.
  if (!normalizedPhone) {
    return completeRegistration(request, {
      name, email, phone: null, passwordHash: await bcrypt.hash(password, 10),
    });
  }

  // A phone number was given: verify it first. Reject a number already tied to another account.
  const [phoneTaken] = await db.select({ id: users.id }).from(users).where(eq(users.phone, normalizedPhone)).limit(1);
  if (phoneTaken) return NextResponse.json({ error: "That phone number is already linked to another account. Try signing in." }, { status: 409 });

  const channels = otpChannels();
  const devMode = process.env.NODE_ENV !== "production";
  const channel = channels.whatsapp ? "whatsapp" : channels.sms ? "sms" : devMode ? "sms" : "";
  if (!channel) return NextResponse.json({ error: "Phone verification isn't switched on yet. Please sign up with email only." }, { status: 503 });

  const recent = await db.select({ id: pendingRegistrations.id }).from(pendingRegistrations)
    .where(and(eq(pendingRegistrations.phone, normalizedPhone), gt(pendingRegistrations.createdAt, new Date(Date.now() - 60 * 60 * 1000))));
  if (recent.length >= 4) return NextResponse.json({ error: "Too many codes requested for this number. Try again in an hour." }, { status: 429 });

  const code = generateCode();
  await db.insert(pendingRegistrations).values({
    id: newId(), name, email, phone: normalizedPhone,
    passwordHash: await bcrypt.hash(password, 10),
    channel, codeHash: hashCode(normalizedPhone, code),
    expiresAt: new Date(Date.now() + OTP_TTL_MS),
  });

  if (channels[channel]) {
    try { await sendOtp({ phone: normalizedPhone, channel, code }); }
    catch (error) {
      console.error("Registration OTP send failed:", error.message);
      return NextResponse.json({ error: "We couldn't send the code. Check the number or try another sign-up method." }, { status: 502 });
    }
    return NextResponse.json({ pending: true, phone: normalizedPhone, channel }, { status: 202 });
  }
  // Local development only: no messaging provider configured, so return the code instead.
  console.info(`[dev] registration code for ${normalizedPhone}: ${code}`);
  return NextResponse.json({ pending: true, phone: normalizedPhone, channel, devCode: code }, { status: 202 });
}

// Verifies the phone code and completes the sign-up.
export async function PUT(request) {
  if (!rateLimit(`cust-register-verify:${clientIp(request)}`, 20, 60 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
  }
  const body = await request.json().catch(() => null);
  const phone = normalizePhone(body?.phone);
  const code = String(body?.code || "").trim();
  if (!phone || !/^\d{6}$/.test(code)) return NextResponse.json({ error: "Enter the 6-digit code we sent you." }, { status: 400 });

  const [pending] = await db.select().from(pendingRegistrations)
    .where(and(eq(pendingRegistrations.phone, phone), isNull(pendingRegistrations.consumedAt), gt(pendingRegistrations.expiresAt, new Date())))
    .orderBy(desc(pendingRegistrations.createdAt)).limit(1);
  if (!pending) return NextResponse.json({ error: "That code has expired. Please sign up again." }, { status: 400 });
  if (pending.attempts >= 5) return NextResponse.json({ error: "Too many incorrect attempts. Please sign up again." }, { status: 400 });

  if (!codeMatches(phone, code, pending.codeHash)) {
    await db.update(pendingRegistrations).set({ attempts: pending.attempts + 1 }).where(eq(pendingRegistrations.id, pending.id));
    return NextResponse.json({ error: "That code isn't right. Check it and try again." }, { status: 400 });
  }

  const [emailTaken] = await db.select({ id: users.id }).from(users).where(eq(users.email, pending.email)).limit(1);
  if (emailTaken) return NextResponse.json({ error: "An account with that email already exists. Try signing in." }, { status: 409 });

  await db.update(pendingRegistrations).set({ consumedAt: new Date() }).where(eq(pendingRegistrations.id, pending.id));

  return completeRegistration(request, {
    name: pending.name, email: pending.email, phone: pending.phone, passwordHash: pending.passwordHash,
  });
}