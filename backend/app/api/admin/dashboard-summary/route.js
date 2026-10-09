import { NextResponse } from "next/server";
import { asc, desc, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { bookingRequests, bookings, companyRoutesConfig, infobipSmsLogs, siteContent, users } from "@/db/schema";
import { isAdmin } from "@/lib/admin";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Admin access required." }, { status: 403 });

  try {
    const [confirmedBookings, requestRows, routesConfig, content, monthlyStats, messageLogs] = await Promise.all([
      db.select({
        id: bookings.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        category: bookings.category,
        rideDate: bookings.rideDate,
        timeSlot: bookings.timeSlot,
        routeId: bookings.routeId,
        isKid: bookings.isKid,
        price: bookings.price,
        status: bookings.status,
      })
        .from(bookings)
        .innerJoin(users, sql`${bookings.userId} = ${users.id}`)
        .orderBy(asc(bookings.rideDate), asc(bookings.timeSlot)),
      db.select().from(bookingRequests).orderBy(desc(bookingRequests.createdAt)),
      db.select().from(companyRoutesConfig).orderBy(asc(companyRoutesConfig.routeId)),
      db.select().from(siteContent).orderBy(desc(siteContent.createdAt)),
      db.execute(sql`
        SELECT to_char(date_trunc('month', to_date(ride_date, 'YYYY-MM-DD')), 'YYYY-MM') AS billing_month,
          COUNT(*)::int AS booking_count,
          COUNT(*)::int AS total_riders
        FROM bookings
        WHERE to_date(ride_date, 'YYYY-MM-DD') >= date_trunc('month', CURRENT_DATE) - INTERVAL '11 months'
        GROUP BY 1
        ORDER BY 1
      `),
      db.select().from(infobipSmsLogs).orderBy(desc(infobipSmsLogs.sentAt)).limit(100),
    ]);

    const pendingCount = requestRows.filter((request) => request.status === "pending").length;
    return NextResponse.json({
      bookings: confirmedBookings,
      bookingRequests: requestRows,
      summary: {
        totalBookings: confirmedBookings.length + requestRows.length,
        totalRiders: confirmedBookings.length + requestRows.reduce((sum, request) => sum + request.riders, 0),
        pendingCount,
      },
      monthlyStats: monthlyStats.rows,
      messageLogs,
      routesConfig,
      content,
    });
  } catch (error) {
    console.error("Admin dashboard query failed:", error);
    return NextResponse.json({ error: "Dashboard data is unavailable." }, { status: 503 });
  }
}