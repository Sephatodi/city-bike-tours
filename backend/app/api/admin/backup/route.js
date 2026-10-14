import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { bookingRequests, bookings, companyRoutesConfig, enquiries, reviews, seoPages, siteContent, siteSettings, subscribers, users } from "@/db/schema";
import { requirePermission } from "@/lib/rbac";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

// A one-click copy of your business data as a single JSON file. Passwords and two-step secrets are never included.
export async function GET() {
  const guard = await requirePermission("backup:write");
  if (guard.error) return guard.error;

  const [content, routes, settings, requests, accountBookings, userRows, enquiryRows, reviewRows, subscriberRows, seoRows] = await Promise.all([
    db.select().from(siteContent), db.select().from(companyRoutesConfig), db.select().from(siteSettings),
    db.select().from(bookingRequests), db.select().from(bookings),
    db.select({ id: users.id, name: users.name, email: users.email, phone: users.phone, role: users.role, status: users.status, team: users.team, createdAt: users.createdAt }).from(users),
    db.select().from(enquiries), db.select().from(reviews), db.select().from(subscribers), db.select().from(seoPages),
  ]);

  const backup = {
    app: "city-bike-tours", version: 1, createdAt: new Date().toISOString(),
    tables: { siteContent: content, companyRoutesConfig: routes, siteSettings: settings, bookingRequests: requests, bookings: accountBookings, users: userRows, enquiries: enquiryRows, reviews: reviewRows, subscribers: subscriberRows, seoPages: seoRows },
  };
  await logAudit(guard.staff, "backup.download", "Downloaded a data backup", { targetType: "backup" });

  const stamp = new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Gaborone" }).format(new Date());
  return new NextResponse(JSON.stringify(backup, null, 2), {
    headers: { "Content-Type": "application/json", "Content-Disposition": `attachment; filename="city-bike-tours-backup-${stamp}.json"`, "Cache-Control": "no-store" },
  });
}
