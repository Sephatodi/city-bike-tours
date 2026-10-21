import { NextResponse } from "next/server";
import { and, desc, eq, gte } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import { otpCodes } from "@/db/schema";
import { newId } from "@/lib/id";
import { normalizePhone } from "@/lib/phone";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { OTP_TTL_MS, generateCode, hashCode, otpChannels, sendOtp } from "@/lib/otp";

const schema = z.object({ phone: z.string().trim().min(7).max(30), channel: z.enum(["sms", "whatsapp"]) });

export async function POST(request) {
  if (!rateLimit(`otp-ip:${clientIp(request)}`, 10, 60 * 60 * 1000)) return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter your phone number." }, { status: 400 });
  const phone = normalizePhone(parsed.data.phone);
  if (!phone) return NextResponse.json({ error: "Enter a valid phone number, including its country code if outside Botswana." }, { status: 400 });
  const { channel } = parsed.data;

  // Nobody can be flooded with codes: at most 4 per number per hour, and one per 45 seconds.
  const recent = await db.select({ createdAt: otpCodes.createdAt }).from(otpCodes)
    .where(and(eq(otpCodes.phone, phone), gte(otpCodes.createdAt, new Date(Date.now() - 60 * 60 * 1000)))).orderBy(desc(otpCodes.createdAt));
  if (recent.length >= 4) return NextResponse.json({ error: "Too many codes requested for this number. Try again in an hour." }, { status: 429 });
  if (recent[0] && Date.now() - new Date(recent[0].createdAt).getTime() < 45000) return NextResponse.json({ error: "Please wait a moment before asking for another code." }, { status: 429 });

  const configured = otpChannels()[channel];
  const devMode = process.env.NODE_ENV !== "production";
  if (!configured && !devMode) {
    return NextResponse.json({ error: `${channel === "whatsapp" ? "WhatsApp" : "SMS"} sign-in isn't switched on yet. Please use another method.` }, { status: 503 });
  }

  const code = generateCode();
  await db.insert(otpCodes).values({ id: newId(), phone, channel, codeHash: hashCode(phone, code), expiresAt: new Date(Date.now() + OTP_TTL_MS) });

  if (configured) {
    try { await sendOtp({ phone, channel, code }); }
    catch (error) {
      console.error("OTP send failed:", error.message);
      return NextResponse.json({ error: "We couldn't send the code. Check the number or try another method." }, { status: 502 });
    }
    return NextResponse.json({ success: true, phone });
  }
  // Local development only: no messaging provider configured, so print the code instead.
  console.info(`[dev] ${channel} code for ${phone}: ${code}`);
  return NextResponse.json({ success: true, phone, devCode: code });
}
