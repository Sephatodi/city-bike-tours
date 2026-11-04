import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { isAllowedFrontendOrigin } from "@/lib/origins";
import { isValidCustomerHandoffUser, publicUser, setCustomerCookie, verifyCustomerHandoff, issueCustomerToken } from "@/lib/customer-auth";

export async function POST(request) {
  const origin = request.headers.get("origin");
  if (!origin || !isAllowedFrontendOrigin(origin)) {
    return NextResponse.json({ error: "Origin is not allowed." }, { status: 403 });
  }
  const body = await request.json().catch(() => null);
  const handoff = typeof body?.handoff === "string" ? verifyCustomerHandoff(body.handoff) : null;
  if (!handoff) return NextResponse.json({ error: "This sign-in link has expired. Please sign in again." }, { status: 401 });

  const [user] = await db.select().from(users).where(eq(users.id, handoff.uid));
  if (!isValidCustomerHandoffUser(user, handoff)) {
    return NextResponse.json({ error: "This account can't sign in as a customer." }, { status: 403 });
  }
  return setCustomerCookie(
    NextResponse.json({ user: publicUser(user) }),
    issueCustomerToken(user.id),
  );
}
