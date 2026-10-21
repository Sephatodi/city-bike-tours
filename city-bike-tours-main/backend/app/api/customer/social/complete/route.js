import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { eq } from "drizzle-orm";
import { authOptions } from "@/lib/auth";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { frontendOrigins, issueCustomerToken } from "@/lib/customer-auth";

export const dynamic = "force-dynamic";

// NextAuth finishes the Google / Facebook / Apple sign-in here. We swap its cookie session for a
// token and hand it to the website in the URL fragment (fragments are never sent to servers or logged).
export async function GET(request) {
  const origins = frontendOrigins();
  const requested = (new URL(request.url).searchParams.get("return") || "").replace(/\/$/, "");
  const origin = origins.includes(requested) ? requested : origins[0];
  if (!origin) return NextResponse.json({ error: "FRONTEND_ORIGIN is not configured." }, { status: 500 });

  const fail = (code) => NextResponse.redirect(`${origin}/login/callback#error=${code}`);
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return fail("signin_failed");
  const [user] = await db.select().from(users).where(eq(users.id, session.user.id));
  if (!user || user.status !== "active") return fail("account_unavailable");
  if (user.role !== "customer") return fail("staff_account");
  return NextResponse.redirect(`${origin}/login/callback#token=${issueCustomerToken(user.id)}`);
}
