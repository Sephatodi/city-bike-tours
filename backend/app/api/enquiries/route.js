import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db/client";
import { enquiries } from "@/db/schema";
import { newId } from "@/lib/id";
import { normalizePhone } from "@/lib/phone";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { fireWebhook } from "@/lib/webhook";

const schema = z.object({
  name: z.string().trim().min(1, "Please tell us your name.").max(120),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  email: z.string().trim().email("That email doesn't look right.").max(160).optional().or(z.literal("")),
  subject: z.string().trim().max(120).optional(),
  message: z.string().trim().min(5, "Please write a little more.").max(2000),
  website: z.string().max(0).optional(), // hidden field: real people leave it empty
});

// The website's contact form posts here. Staff answer from Dashboard > Inbox.
export async function POST(request) {
  if (!rateLimit(`enquiry:${clientIp(request)}`, 4, 10 * 60 * 1000)) return NextResponse.json({ error: "Too many messages. Please try again later." }, { status: 429 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Please check your message." }, { status: 400 });
  const { name, phone, email, subject, message } = parsed.data;
  if (!phone && !email) return NextResponse.json({ error: "Leave a phone number or email so we can reply." }, { status: 400 });

  let normalized = null;
  if (phone) {
    normalized = normalizePhone(phone);
    if (!normalized) return NextResponse.json({ error: "That phone number doesn't look right. Include your country code if outside Botswana." }, { status: 400 });
  }
  const id = newId();
  await db.insert(enquiries).values({ id, name, phone: normalized, email: email || null, subject: subject || null, message });
  await fireWebhook("enquiry.created", { id, name, phone: normalized, email: email || null, subject, message });
  return NextResponse.json({ success: true }, { status: 201 });
}
