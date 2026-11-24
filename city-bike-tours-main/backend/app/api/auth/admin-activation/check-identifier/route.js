import { NextResponse } from "next/server";
import { and, eq, or } from "drizzle-orm";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { normalizePhone } from "@/lib/phone";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    if (!rateLimit(`admin-identifier-check:${clientIp(request)}`, 30, 60 * 60 * 1000)) {
      return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
    }
    const body = await request.json().catch(() => null);
    const identifier = String(body?.identifier || "").trim();
    if (!identifier) return NextResponse.json({ error: "Enter your email or phone number." }, { status: 400 });

    const isEmail = identifier.includes("@");
    let query;
    if (isEmail) {
      const email = identifier.toLowerCase();
      query = db.select({
        role: users.role,
        status: users.status,
        activationRequired: users.activationRequired,
        passwordHash: users.passwordHash,
        phone: users.phone,
      }).from(users).where(eq(users.email, email));
    } else {
      const phone = normalizePhone(identifier);
      if (!phone) return NextResponse.json({ error: "Enter a valid phone number." }, { status: 400 });
      query = db.select({
        role: users.role,
        status: users.status,
        activationRequired: users.activationRequired,
        passwordHash: users.passwordHash,
        phone: users.phone,
      }).from(users).where(eq(users.phone, phone));
    }

    let user;
    try {
      [user] = await query;
    } catch {
      // Fallback if activation columns are not yet migrated.
      [user] = await db.select({
        role: users.role,
        status: users.status,
        passwordHash: users.passwordHash,
        phone: users.phone,
      }).from(users).where(isEmail ? eq(users.email, identifier.toLowerCase()) : eq(users.phone, normalizePhone(identifier)));
    }

    const isStaff = user && ["viewer", "editor", "admin"].includes(user.role);
    if (!isStaff || user.status !== "active") {
      return NextResponse.json({ state: "not_found" });
    }
    if (user.activationRequired) {
      return NextResponse.json({ state: "activation" });
    }
    if (user.passwordHash) {
      return NextResponse.json({ state: "password" });
    }
    return NextResponse.json({ state: "not_found" });
  } catch (error) {
    console.error("admin-activation/check-identifier failed:", error);
    return NextResponse.json({ error: "Unable to check identifier right now. Please try again." }, { status: 500 });
  }
}