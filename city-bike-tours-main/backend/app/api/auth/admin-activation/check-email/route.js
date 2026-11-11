import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    if (!rateLimit(`admin-login-check:${clientIp(request)}`, 30, 60 * 60 * 1000)) {
      return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
    }
    const body = await request.json().catch(() => null);
    const email = String(body?.email || "").trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }

    let user;
    try {
      [user] = await db.select({
        role: users.role,
        status: users.status,
        activationRequired: users.activationRequired,
        passwordHash: users.passwordHash,
      }).from(users).where(eq(users.email, email));
    } catch {
      // Fallback if activation columns are not yet migrated in the database.
      [user] = await db.select({
        role: users.role,
        status: users.status,
        passwordHash: users.passwordHash,
      }).from(users).where(eq(users.email, email));
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
    console.error("admin-activation/check-email failed:", error);
    return NextResponse.json({ error: "Unable to check email right now. Please try again." }, { status: 500 });
  }
}
