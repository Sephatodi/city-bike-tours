import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { neonAuth } from "@/lib/neon-auth-server";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { newId } from "@/lib/id";
import { frontendOrigins, isAllowedCustomerReturnOrigin, issueCustomerToken } from "@/lib/customer-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request) {
  const { data: session } = await neonAuth.getSession();
  const identity = session?.user;
  const origins = frontendOrigins();
  const requested = (new URL(request.url).searchParams.get("return") || "").replace(/\/$/, "");
  const origin = isAllowedCustomerReturnOrigin(requested)
    ? requested
    : origins.find((value) => value === "https://city-bike-tours.vercel.app") || origins[0];

  if (!origin) return NextResponse.json({ error: "FRONTEND_ORIGIN is not configured." }, { status: 500 });
  const fail = (code) => NextResponse.redirect(new URL(`/login/callback#error=${code}`, origin));
  if (!identity?.id || !identity.email || identity.emailVerified !== true) return fail("signin_failed");

  const email = identity.email.trim().toLowerCase();
  const [byAuthId] = await db.select().from(users).where(eq(users.managedAuthId, identity.id)).limit(1);
  const [byEmail] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (byAuthId && byEmail && byAuthId.id !== byEmail.id) return fail("account_unavailable");

  let user = byAuthId || byEmail;
  if (user && (user.role !== "customer" || user.status !== "active")) return fail("staff_account");
  if (user) {
    [user] = await db.update(users).set({
      managedAuthId: identity.id, email,
      name: (identity.name || user.name || email.split("@")[0]).slice(0, 160),
      image: identity.image || user.image, provider: "neon",
    }).where(eq(users.id, user.id)).returning();
  } else {
    const [created] = await db.insert(users).values({
      id: newId(), managedAuthId: identity.id,
      name: (identity.name || email.split("@")[0]).slice(0, 160),
      email, image: identity.image || null, provider: "neon", role: "customer",
    }).onConflictDoNothing().returning();
    user = created;
    if (!user) {
      const [byId] = await db.select().from(users).where(eq(users.managedAuthId, identity.id)).limit(1);
      const [byMail] = await db.select().from(users).where(eq(users.email, email)).limit(1);
      user = byId || byMail;
    }
    if (!user || user.role !== "customer" || user.status !== "active") return fail("account_unavailable");
  }
  return NextResponse.redirect(new URL(`/login/callback#token=${issueCustomerToken(user.id)}`, origin));
}
