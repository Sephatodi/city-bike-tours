import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { authOptions } from "@/lib/auth";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { STAFF_ROLES, can } from "@/lib/permissions";
import { ipFromHeaders, isIpBlocked, sessionIsFresh } from "@/lib/security";
import { getSettings } from "@/lib/settings";

/** For admin pages: returns the signed-in staff member, or redirects away. Re-checks the database every time. */
export async function staffForPage(permission, { allowWithoutMfa = false } = {}) {
  const session = await getServerSession(authOptions);
  const id = session?.user?.id;
  if (!id) redirect("/admin/login");

  const [user] = await db
    .select({ id: users.id, name: users.name, email: users.email, role: users.role, status: users.status, mfaEnabled: users.mfaEnabled })
    .from(users)
    .where(eq(users.id, id));
  if (!user || user.status !== "active" || !STAFF_ROLES.includes(user.role)) redirect("/admin/login");
  if (await isIpBlocked(ipFromHeaders(headers()))) redirect("/admin/login?blocked=1");
  if (!(await sessionIsFresh(session))) redirect("/admin/login?expired=1");
  if (!allowWithoutMfa && !user.mfaEnabled && (await getSettings()).requireMfa === "true") redirect("/admin/security?setup=1");
  if (permission && !can(user.role, permission)) redirect("/admin");
  return user;
}
