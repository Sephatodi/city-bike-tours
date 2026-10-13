import { NextResponse } from "next/server";
import { sql, desc } from "drizzle-orm";
import { db } from "@/db/client";
import { bookings, bookingRequests, users, siteContent, systemLogs } from "@/db/schema";
import { getAdminSession, requirePermission } from "@/lib/admin";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  requirePermission(session, "analytics:read");

  try {
    const [
      totalUsers,
      totalBookings,
      totalRequests,
      totalContent,
      recentUsers,
      recentBookings,
      bookingsByMonth,
      requestsByStatus,
      bookingsByRoute,
      trafficSources,
    ] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(users),
      db.select({ count: sql<number>`count(*)` }).from(bookings),
      db.select({ count: sql<number>`count(*)` }).from(bookingRequests),
      db.select({ count: sql<number>`count(*)` }).from(siteContent),
      db.select({ id: users.id, name: users.name, email: users.email, createdAt: users.createdAt, adminRole: users.adminRole })
        .from(users)
        .orderBy(desc(users.createdAt))
        .limit(10),
      db.select({ id: bookings.id, userId: bookings.userId, rideDate: bookings.rideDate, status: bookings.status, createdAt: bookings.createdAt })
        .from(bookings)
        .orderBy(desc(bookings.createdAt))
        .limit(10),
      db.execute(sql`
        SELECT to_char(date_trunc('month', to_date(ride_date, 'YYYY-MM-DD')), 'YYYY-MM') AS month,
               COUNT(*)::int AS bookings,
               SUM(CASE WHEN category = 'weekday' THEN 1 ELSE 0 END)::int AS weekday,
               SUM(CASE WHEN category = 'saturday' THEN 1 ELSE 0 END)::int AS saturday,
               SUM(CASE WHEN category = 'holiday' THEN 1 ELSE 0 END)::int AS holiday
        FROM bookings
        WHERE to_date(ride_date, 'YYYY-MM-DD') >= date_trunc('month', CURRENT_DATE) - INTERVAL '11 months'
        GROUP BY 1
        ORDER BY 1
      `),
      db.execute(sql`
        SELECT status, COUNT(*)::int AS count
        FROM website_booking_requests
        GROUP BY status
      `),
      db.execute(sql`
        SELECT COALESCE(route_id, 'lesson') AS route, COUNT(*)::int AS count
        FROM bookings
        GROUP BY route_id
      `),
      db.execute(sql`
        SELECT provider, COUNT(*)::int AS count
        FROM users
        WHERE provider IS NOT NULL
        GROUP BY provider
      `),
    ]);

    return NextResponse.json({
      overview: {
        totalUsers: totalUsers[0]?.count || 0,
        totalBookings: totalBookings[0]?.count || 0,
        totalRequests: totalRequests[0]?.count || 0,
        totalContent: totalContent[0]?.count || 0,
      },
      recentUsers,
      recentBookings,
      bookingsByMonth: bookingsByMonth.rows,
      requestsByStatus: requestsByStatus.rows,
      bookingsByRoute: bookingsByRoute.rows,
      trafficSources: trafficSources.rows,
    });
  } catch (error) {
    console.error("Admin analytics query failed:", error);
    return NextResponse.json({ error: "Failed to load analytics." }, { status: 503 });
  }
}