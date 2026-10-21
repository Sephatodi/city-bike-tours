import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { STAFF_ROLES } from "@/lib/rbac";

// Kept for older callers. New routes should use requirePermission() from "@/lib/rbac".
export function hasAdminAccess(session) {
  return session?.user?.role === "admin";
}

export function hasStaffAccess(session) {
  return STAFF_ROLES.includes(session?.user?.role);
}

export async function isAdmin() {
  const session = await getServerSession(authOptions);
  return hasAdminAccess(session);
}
