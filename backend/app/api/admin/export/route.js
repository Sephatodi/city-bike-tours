import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { db } from "@/db/client";
import { auditLogs, bookingRequests, bookings, enquiries, reviews, siteContent, subscribers, users } from "@/db/schema";
import { requirePermission } from "@/lib/rbac";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

// Spreadsheet apps run text that starts with = + - @ as a formula, so defuse those cells.
function cell(value) {
  if (value == null) return "";
  let text = value instanceof Date ? value.toISOString() : String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}
const toCsv = (columns, rows) =>
  [columns.map(([, label]) => label).join(","), ...rows.map((row) => columns.map(([key]) => cell(row[key])).join(","))].join("\r\n");

const EXPORTS = {
  "booking-requests": {
    load: () => db.select().from(bookingRequests).orderBy(desc(bookingRequests.createdAt)),
    columns: [["id", "Reference"], ["name", "Name"], ["phone", "Phone"], ["routeId", "Route"], ["rideDate", "Ride date"], ["riders", "Riders"], ["status", "Status"], ["notes", "Notes"], ["checkedInAt", "Checked in"], ["createdAt", "Requested"]],
  },
  "account-bookings": {
    load: () => db.select().from(bookings).orderBy(desc(bookings.createdAt)),
    columns: [["id", "Reference"], ["userId", "User id"], ["category", "Category"], ["rideDate", "Ride date"], ["timeSlot", "Time slot"], ["routeId", "Route"], ["price", "Price (BWP)"], ["status", "Status"], ["checkedInAt", "Checked in"], ["createdAt", "Booked"]],
  },
  content: {
    load: () => db.select().from(siteContent).orderBy(desc(siteContent.createdAt)),
    columns: [["id", "ID"], ["contentType", "Type"], ["title", "Title"], ["mediaUrl", "Media URL"], ["bodyText", "Text"], ["isFeatured", "Featured"], ["isPublished", "Published"], ["createdAt", "Created"]],
  },
  users: {
    load: () => db.select({ id: users.id, name: users.name, email: users.email, phone: users.phone, role: users.role, status: users.status, provider: users.provider, createdAt: users.createdAt }).from(users).orderBy(desc(users.createdAt)),
    columns: [["id", "ID"], ["name", "Name"], ["email", "Email"], ["phone", "Phone"], ["role", "Role"], ["status", "Status"], ["provider", "Sign-in"], ["createdAt", "Joined"]],
  },
  subscribers: {
    load: () => db.select().from(subscribers).orderBy(desc(subscribers.createdAt)),
    columns: [["email", "Email"], ["phone", "Phone"], ["status", "Status"], ["source", "Source"], ["createdAt", "Joined"]],
  },
  enquiries: {
    load: () => db.select().from(enquiries).orderBy(desc(enquiries.createdAt)),
    columns: [["name", "Name"], ["phone", "Phone"], ["email", "Email"], ["subject", "Subject"], ["message", "Message"], ["status", "Status"], ["createdAt", "Received"]],
  },
  reviews: {
    load: () => db.select().from(reviews).orderBy(desc(reviews.createdAt)),
    columns: [["name", "Name"], ["rating", "Rating"], ["comment", "Comment"], ["status", "Status"], ["createdAt", "Received"]],
  },
  audit: {
    load: () => db.select().from(auditLogs).orderBy(desc(auditLogs.id)).limit(5000),
    columns: [["id", "ID"], ["createdAt", "When"], ["actorName", "Who"], ["actorRole", "Role"], ["action", "Action"], ["summary", "What happened"]],
  },
};

// GET /api/admin/export?type=booking-requests|account-bookings|content|users|audit  → CSV download
export async function GET(request) {
  const guard = await requirePermission("export:read");
  if (guard.error) return guard.error;

  const type = new URL(request.url).searchParams.get("type");
  const spec = EXPORTS[type];
  if (!spec) return NextResponse.json({ error: "Choose a valid export type." }, { status: 400 });

  const rows = await spec.load();
  await logAudit(guard.staff, "export", `Exported ${rows.length} rows of ${type.replace("-", " ")}`, { targetType: "export", targetId: type });

  const stamp = new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Gaborone" }).format(new Date());
  return new NextResponse("\uFEFF" + toCsv(spec.columns, rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="city-bike-tours-${type}-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
