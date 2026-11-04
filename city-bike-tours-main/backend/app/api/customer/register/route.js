import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { registerSchema } from "@/lib/validators";
import { newId } from "@/lib/id";
import { normalizePhone } from "@/lib/phone";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { issueCustomerToken, publicUser, setCustomerCookie } from "@/lib/customer-auth";
import { renderEmailTemplate } from "@/lib/email-templates";
import { sendEmail } from "@/lib/email";

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

  const [created] = await db.insert(users).values({
    id: newId(), name, email, phone: normalizedPhone || null,
    passwordHash: await bcrypt.hash(password, 10), provider: "credentials",
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
