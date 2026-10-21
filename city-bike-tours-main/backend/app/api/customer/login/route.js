import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { issueCustomerToken, publicUser } from "@/lib/customer-auth";
import { recentFailures, recordAttempt } from "@/lib/security";

const schema = z.object({ email: z.string().trim().toLowerCase().email(), password: z.string().min(1).max(200) });

export async function POST(request) {
  const ip = clientIp(request);
  if (!rateLimit(`cust-login:${ip}`, 12, 10 * 60 * 1000)) return NextResponse.json({ error: "Too many attempts. Please wait a few minutes." }, { status: 429 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter your email and password." }, { status: 400 });
  const { email, password } = parsed.data;
  const bad = async (reason) => { await recordAttempt({ email, ip, success: false, reason: `site:${reason}` }); return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 }); };

  if ((await recentFailures(email)) >= 8) return bad("locked_out");
  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (!user || !user.passwordHash || user.status !== "active") return bad("unknown_account");
  // Staff sign in through the dashboard (it supports two-step sign-in); this form is for riders.
  if (user.role !== "customer") return NextResponse.json({ error: "Staff accounts sign in from the admin dashboard." }, { status: 403 });
  if (!(await bcrypt.compare(password, user.passwordHash))) return bad("wrong_password");

  await recordAttempt({ email, ip, success: true, reason: "site" });
  return NextResponse.json({ token: issueCustomerToken(user.id), user: publicUser(user) });
}
