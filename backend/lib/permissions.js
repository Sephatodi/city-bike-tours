// Pure role/permission tables. Safe to import from client components (no server-only imports).

// Roles that may open the admin dashboard. "customer" is a normal website account.
export const STAFF_ROLES = ["viewer", "editor", "admin"];
export const ALL_ROLES = ["customer", ...STAFF_ROLES];

export const ROLE_LABELS = {
  admin: "Admin",
  editor: "Editor",
  viewer: "Viewer",
  customer: "Customer",
};

// What each role may do. Viewers look, editors run day-to-day operations, admins manage people and settings.
export const PERMISSIONS = {
  viewer: ["dashboard:read", "bookings:read", "content:read", "routes:read", "messages:read", "analytics:read", "inbox:read", "media:read", "seo:read"],
  editor: [
    "dashboard:read", "bookings:read", "bookings:write", "checkin:write",
    "content:read", "content:write", "routes:read", "routes:write",
    "messages:read", "messages:send",
    "analytics:read", "inbox:read", "inbox:write", "media:read", "media:write", "seo:read", "seo:write",
  ],
  admin: [
    "dashboard:read", "bookings:read", "bookings:write", "checkin:write",
    "content:read", "content:write", "routes:read", "routes:write",
    "messages:read", "messages:send",
    "analytics:read", "inbox:read", "inbox:write", "media:read", "media:write", "seo:read", "seo:write",
    "users:read", "users:write", "settings:read", "settings:write", "audit:read", "export:read",
    "security:read", "security:write", "system:read", "backup:write",
  ],
};

export const can = (role, permission) => (PERMISSIONS[role] || []).includes(permission);

