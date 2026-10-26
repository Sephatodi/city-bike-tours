import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { newId } from "@/lib/id";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { issueCustomerToken, publicUser } from "@/lib/customer-auth";
import { verifyNeonAuthToken } from "@/lib/neon-auth";

export const runtime = "nodejs";

export async function POST(request) {
  if (!rateLimit(`managed-auth-exchange:${clientIp(request)}`, 30, 60 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many sign-in attempts. Please try again later." }, { status: 429 });
  }

  const authorization = request.headers.get("authorization") || "";
  const token = authorization.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return NextResponse.json({ error: "Please sign in to continue." }, { status: 401 });

  const claims = await verifyNeonAuthToken(token);
  if (!claims) return NextResponse.json({ error: "Your Neon sign-in has expired. Please sign in again." }, { status: 401 });

  const email = typeof claims.email === "string" ? claims.email.trim().toLowerCase() : "";
  if (!email || claims.emailVerified !== true) {
    return NextResponse.json({ error: "Verify your email address before continuing." }, { status: 403 });
  }

  const name = typeof claims.name === "string" && claims.name.trim()
    ? claims.name.trim().slice(0, 160)
    : email.split("@")[0];
  const image = typeof claims.image === "string" ? claims.image.slice(0, 2000) : null;

  const [byAuthId] = await db.select().from(users).where(eq(users.managedAuthId, claims.sub)).limit(1);
  const [byEmail] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (byAuthId && byEmail && byAuthId.id !== byEmail.id) {
    return NextResponse.json({ error: "This sign-in conflicts with an existing account. Contact the tour team." }, { status: 409 });
  }

  let user = byAuthId || byEmail;
  if (user && (user.role !== "customer" || user.status !== "active")) {
    return NextResponse.json({ error: "This account can't sign in as a customer." }, { status: 403 });
  }

  if (user) {
    [user] = await db.update(users)
      .set({
        managedAuthId: claims.sub,
        email,
        name,
        image: image || user.image,
        provider: "neon",
      })
      .where(eq(users.id, user.id))
      .returning();
  } else {
    const [created] = await db.insert(users).values({
      id: newId(),
      managedAuthId: claims.sub,
      name,
      email,
      image,
      provider: "neon",
      role: "customer",
    }).onConflictDoNothing().returning();

    user = created;
    if (!user) {
      const [byAuthIdAfterRace] = await db.select().from(users).where(eq(users.managedAuthId, claims.sub)).limit(1);
      const [byEmailAfterRace] = await db.select().from(users).where(eq(users.email, email)).limit(1);
      user = byAuthIdAfterRace || byEmailAfterRace;
    }
    if (!user || user.role !== "customer" || user.status !== "active") {
      return NextResponse.json({ error: "This account can't sign in as a customer." }, { status: 403 });
    }
  }

  return NextResponse.json({ token: issueCustomerToken(user.id), user: publicUser(user) });
}
