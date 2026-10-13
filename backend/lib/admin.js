import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const ADMIN_ROLES = {
  SUPER_ADMIN: "super_admin",
  EDITOR: "editor",
  VIEWER: "viewer",
};



export const ADMIN_PERMISSIONS = {
  super_admin: [
    "users:create",
    "users:read",
    "users:update",
    "users:delete",
    "teams:create",
    "teams:read",
    "teams:update",
    "teams:delete",
    "content:create",
    "content:read",
    "content:update",
    "content:delete",
    "settings:read",
    "settings:update",
    "seo:read",
    "seo:update",
    "integrations:read",
    "integrations:update",
    "analytics:read",
    "logs:read",
    "backups:create",
    "backups:read",
    "backups:delete",
    "security:read",
    "security:update",
    "updates:read",
    "updates:update",
    "bookings:read",
    "bookings:update",
    "routes:read",
    "routes:update",
  ],
  editor: [
    "users:read",
    "content:create",
    "content:read",
    "content:update",
    "content:delete",
    "settings:read",
    "seo:read",
    "seo:update",
    "analytics:read",
    "bookings:read",
    "routes:read",
    "routes:update",
  ],
  viewer: [
    "users:read",
    "content:read",
    "settings:read",
    "seo:read",
    "analytics:read",
    "bookings:read",
    "routes:read",
  ],
};

export function hasAdminAccess(session) {
  return session?.user?.adminRole && Object.values(ADMIN_ROLES).includes(session.user.adminRole);
}

export function getAdminRole(session) {
  return session?.user?.adminRole || null;
}

export function hasPermission(session, permission) {
  const role = getAdminRole(session);
  if (!role) return false;
  const permissions = ADMIN_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}

export function requirePermission(session, permission) {
  if (!hasPermission(session, permission)) {
    throw new Error(`Permission denied: ${permission} required`);
  }
}

export async function isAdmin() {
  const session = await getServerSession(authOptions);
  return hasAdminAccess(session);
}

export async function getAdminSession() {
  const session = await getServerSession(authOptions);
  if (!hasAdminAccess(session)) return null;
  return session;
}