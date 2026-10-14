import { NextResponse } from "next/server";
import { and, count, countDistinct, desc, eq, gte, isNotNull, like, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { bookingRequests, pageViews } from "@/db/schema";
import { requirePermission } from "@/lib/rbac";

export const dynamic = "force-dynamic";

const gaboroneDay = (offset = 0) => {
  const d = new Date(Date.now() - offset * 86400000);
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Gaborone" }).format(d);
};

// GET /api/admin/analytics?days=7|30|90
export async function GET(request) {
  const guard = await requirePermission("analytics:read");
  if (guard.error) return guard.error;

  const days = [7, 30, 90].includes(Number(new URL(request.url).searchParams.get("days"))) ? Number(new URL(request.url).searchParams.get("days")) : 30;
  const since = gaboroneDay(days - 1);
  const inRange = gte(pageViews.day, since);

  const [daily, pages, referrers, devices, sessions, bookPage, requests] = await Promise.all([
    db.select({ day: pageViews.day, views: count(), visitors: countDistinct(pageViews.visitor) }).from(pageViews).where(inRange).groupBy(pageViews.day).orderBy(pageViews.day),
    db.select({ path: pageViews.path, views: count(), visitors: countDistinct(pageViews.visitor) }).from(pageViews).where(inRange).groupBy(pageViews.path).orderBy(desc(count())).limit(8),
    db.select({ name: pageViews.referrer, views: count() }).from(pageViews).where(and(inRange, isNotNull(pageViews.referrer))).groupBy(pageViews.referrer).orderBy(desc(count())).limit(6),
    db.select({ name: pageViews.device, views: count() }).from(pageViews).where(inRange).groupBy(pageViews.device),
    db.select({ day: pageViews.day, visitor: pageViews.visitor, n: count() }).from(pageViews).where(inRange).groupBy(pageViews.day, pageViews.visitor),
    db.select({ n: countDistinct(sql`${pageViews.day} || ${pageViews.visitor}`) }).from(pageViews).where(and(inRange, like(pageViews.path, "/book%"))),
    db.select({ status: bookingRequests.status, checkedIn: bookingRequests.checkedInAt }).from(bookingRequests).where(gte(bookingRequests.createdAt, new Date(`${since}T00:00:00+02:00`))),
  ]);

  // Fill days with no visits so the chart doesn't skip them.
  const byDay = Object.fromEntries(daily.map((d) => [d.day, d]));
  const series = Array.from({ length: days }, (_, i) => {
    const day = gaboroneDay(days - 1 - i);
    return { day, views: Number(byDay[day]?.views ?? 0), visitors: Number(byDay[day]?.visitors ?? 0) };
  });

  const totalViews = series.reduce((s, d) => s + d.views, 0);
  const visits = sessions.length; // one visit per visitor per day
  const bounced = sessions.filter((s) => Number(s.n) === 1).length;
  const nums = (rows) => rows.map((r) => ({ ...r, views: Number(r.views), visitors: r.visitors == null ? undefined : Number(r.visitors) }));

  return NextResponse.json({
    days,
    totals: { views: totalViews, visitors: visits, bounceRate: visits ? Math.round((bounced / visits) * 100) : 0, viewsPerVisit: visits ? Math.round((totalViews / visits) * 10) / 10 : 0 },
    series,
    pages: nums(pages),
    referrers: nums(referrers),
    devices: nums(devices),
    funnel: [
      { label: "Visited the site", value: visits },
      { label: "Opened the booking page", value: Number(bookPage[0]?.n ?? 0) },
      { label: "Sent a booking request", value: requests.length },
      { label: "Request confirmed", value: requests.filter((r) => r.status === "confirmed").length },
      { label: "Rode with you (checked in)", value: requests.filter((r) => r.checkedIn).length },
    ],
  });
}
