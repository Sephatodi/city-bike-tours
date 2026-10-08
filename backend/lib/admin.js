import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export function hasAdminAccess(session) {
  return session?.user?.role === "admin";
}

export async function isAdmin() {
  const session = await getServerSession(authOptions);
  return hasAdminAccess(session);
}