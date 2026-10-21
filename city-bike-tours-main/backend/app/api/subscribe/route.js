import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import { subscribers } from "@/db/schema";
import { newId } from "@/lib/id";
import { normalizePhone } from "@/lib/phone";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  email: z.string().trim().toLowerCase().email().max(160).optional().or(z.literal("")),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  consent: z.literal(true, { errorMap: () => ({ message: "Please tick the box to agree to receive updates." }) }),
  source: z.string().trim().max(40).optional(),
});

// Newsletter / updates sign-up. Consent is required and recorded by the fact that the row exists.
export async function POST(request) {
  if (!rateLimit(`subscribe:${clientIp(request)}`, 5, 60 * 60 * 1000)) return NextResponse.json({ error: "Too many sign-ups. Please try again later." }, { status: 429 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Please check your details." }, { status: 400 });
  const { email, phone, source } = parsed.data;
  if (!email && !phone) return NextResponse.json({ error: "Add an email or a phone number." }, { status: 400 });

  let normalized = null;
  if (phone) {
    normalized = normalizePhone(phone);
    if (!normalized) return NextResponse.json({ error: "That phone number doesn't look right." }, { status: 400 });
  }
  const existing = email ? (await db.select({ id: subscribers.id }).from(subscribers).where(eq(subscribers.email, email)))[0] : (await db.select({ id: subscribers.id }).from(subscribers).where(eq(subscribers.phone, normalized)))[0];
  if (existing) await db.update(subscribers).set({ status: "subscribed", ...(normalized ? { phone: normalized } : {}) }).where(eq(subscribers.id, existing.id));
  else await db.insert(subscribers).values({ id: newId(), email: email || null, phone: normalized, source: source || "website" });
  return NextResponse.json({ success: true }, { status: 201 });
}
