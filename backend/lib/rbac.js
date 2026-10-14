import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getServerSession } from "next-auth";
import { eq } from "drizzle-orm";
import { authOptions } from "@/lib/auth";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { ipFromHeaders, isIpBlocked, sessionIsFresh } from "@/lib/security";
import { getSettings } from "@/lib/settings";

import { STAFF_ROLES, ROLE_LABELS, can } from "@/lib/permissions";

export { STAFF_ROLES, ROLE_LABELS, can, PERMISSIONS, ALL_ROLES } from "@/lib/permissions";

/**
 * Checks the signed-in staff member against the database on every call, so a
 * suspension or role change applies immediately instead of when the session expires.
 * Returns { staff } on success or { error: NextResponse } to return from the route.
 */
export async function requirePermission(permission, { allowWithoutMfa = false } = {}) {
  const session = await getServerSession(authOptions);
  const id = session?.user?.id;
  if (!id) return { error: NextResponse.json({ error: "Sign in to continue." }, { status: 401 }) };

  const [user] = await db
    .select({ id: users.id, name: users.name, email: users.email, role: users.role, status: users.status, mfaEnabled: users.mfaEnabled })
    .from(users)
    .where(eq(users.id, id));

  if (!user || user.status !== "active" || !STAFF_ROLES.includes(user.role)) {
    return { error: NextResponse.json({ error: "Your account does not have dashboard access." }, { status: 403 }) };
  }
  if (await isIpBlocked(ipFromHeaders(headers()))) {
    return { error: NextResponse.json({ error: "Access from this address is blocked." }, { status: 403 }) };
  }
  if (!(await sessionIsFresh(session))) {
    return { error: NextResponse.json({ error: "Your session has expired. Sign in again." }, { status: 401 }) };
  }
  if (!allowWithoutMfa && !user.mfaEnabled && (await getSettings()).requireMfa === "true") {
    return { error: NextResponse.json({ error: "Set up two-step sign-in (Security page) before using the dashboard." }, { status: 403 }) };
  }
  if (permission && !can(user.role, permission)) {
    return {
      error: NextResponse.json(
        { error: `Your ${ROLE_LABELS[user.role]} role can't do this. Ask an admin if you need access.` },
        { status: 403 }
      ),
    };
  }
  return { staff: user };
}
