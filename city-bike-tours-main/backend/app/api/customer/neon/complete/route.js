import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { newId } from "@/lib/id";
import { neonAuth } from "@/lib/neon-auth-server";
import { frontendOrigins, issueCustomerHandoff } from "@/lib/customer-auth";

export const dynamic = "force-dynamic";

// Neon Auth sends the browser here after Google sign-in. We exchange its session for a short-lived
// handoff which the frontend redeems for its HttpOnly customer cookie.
export async function GET(request) {
  const origins = frontendOrigins();
  const requested = (new URL(request.url).searchParams.get("return") || "").replace(/\/$/, "");
  const origin = origins.includes(requested) ? requested : origins[0];
  if (!origin) return NextResponse.json({ error: "FRONTEND_ORIGIN is not configured." }, { status: 500 });

  const fail = (code) => NextResponse.redirect(`${origin}/login/callback#error=${code}`);
  if (!neonAuth) return fail("signin_failed");

  const { data: session } = await neonAuth.getSession();
  const profile = session?.user;
  const email = profile?.email?.trim().toLowerCase();
  // Only trust an email address the provider has verified, otherwise someone could claim another person's account.
  if (!email || profile.emailVerified === false) return fail("signin_failed");

  const [existing] = await db.select().from(users).where(eq(users.email, email));
  let user = existing;
  if (existing) {
    if (existing.status !== "active") return fail("account_unavailable");
    if (existing.role !== "customer") return fail("staff_account");
    await db.update(users).set({ name: profile.name || existing.name, image: profile.image || existing.image }).where(eq(users.id, existing.id));
  } else {
    user = { id: newId(), name: profile.name || email, email, image: profile.image || null, provider: "google", role: "customer" };
    await db.insert(users).values(user);
  }
  return NextResponse.redirect(`${origin}/login/callback#handoff=${issueCustomerHandoff(user.id)}`);
}
