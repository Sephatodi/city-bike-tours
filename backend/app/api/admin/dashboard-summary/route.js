import { NextResponse } from "next/server";
import { asc, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { bookingRequests, bookings, companyRoutesConfig, enquiries, infobipSmsLogs, reviews, siteContent, users } from "@/db/schema";
import { requirePermission, can } from "@/lib/rbac";
import { getDailyCapacity } from "@/lib/settings";

export const dynamic = "force-dynamic";

const gaboroneToday = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Gaborone" }).format(new Date());

function addDays(iso, n) {
  const d = new Date(`${iso}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

function lastMonths(todayIso, count) {
  const [y, m] = todayIso.split("-").map(Number);
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(Date.UTC(y, m - 1 - (count - 1 - i), 1));
    return d.toISOString().slice(0, 7);
  });
}

export async function GET() {
  const guard = await requirePermission("dashboard:read");
  if (guard.error) return guard.error;
  const staff = guard.staff;

  try {
    const [confirmedBookings, requestRows, routesConfig, content, messageLogs, capacity, [customerCount], [newEnquiries], [pendingReviews]] = await Promise.all([
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
        checkedInAt: bookings.checkedInAt,
      })
        .from(bookings)
        .innerJoin(users, sql`${bookings.userId} = ${users.id}`)
        .orderBy(asc(bookings.rideDate), asc(bookings.timeSlot)),
      db.select().from(bookingRequests).orderBy(desc(bookingRequests.createdAt)),
      db.select().from(companyRoutesConfig).orderBy(asc(companyRoutesConfig.routeId)),
      db.select().from(siteContent).orderBy(desc(siteContent.createdAt)),
      db.select().from(infobipSmsLogs).orderBy(desc(infobipSmsLogs.sentAt)).limit(100),
      getDailyCapacity(),
      db.select({ n: sql`COUNT(*)::int` }).from(users).where(eq(users.role, "customer")),
      db.select({ n: sql`COUNT(*)::int` }).from(enquiries).where(eq(enquiries.status, "new")),
      db.select({ n: sql`COUNT(*)::int` }).from(reviews).where(eq(reviews.status, "pending")),
    ]);

    const today = gaboroneToday();
    const priceOf = Object.fromEntries(routesConfig.map((r) => [r.routeId, Number(r.priceBwp)]));
    const nameOf = Object.fromEntries(routesConfig.map((r) => [r.routeId, r.routeName]));

    // Normalise both booking sources into one list of rides that actually count (confirmed).
    const rides = [
      ...requestRows.filter((r) => r.status === "confirmed").map((r) => ({
        date: r.rideDate, riders: r.riders, revenue: r.riders * (priceOf[r.routeId] ?? 0), routeId: r.routeId, checkedIn: !!r.checkedInAt,
      })),
      ...confirmedBookings.filter((b) => b.status === "confirmed").map((b) => ({
        date: b.rideDate, riders: 1, revenue: Number(b.price ?? 0), routeId: b.routeId || b.category, checkedIn: !!b.checkedInAt,
      })),
    ];

    const months = lastMonths(today, 6);
    const monthly = months.map((month) => {
      const inMonth = rides.filter((r) => r.date.startsWith(month));
      return { month, rides: inMonth.length, riders: inMonth.reduce((s, r) => s + r.riders, 0), revenue: inMonth.reduce((s, r) => s + r.revenue, 0) };
    });

    const byRoute = {};
    for (const r of rides) {
      const key = r.routeId || "other";
      byRoute[key] ??= { routeId: key, name: nameOf[key] || (key === "lesson" ? "Cycling lessons" : key), riders: 0, revenue: 0 };
      byRoute[key].riders += r.riders;
      byRoute[key].revenue += r.revenue;
    }

    // Riders booked (pending + confirmed) per day for the next 14 days, against daily capacity.
    const upcoming = Array.from({ length: 14 }, (_, i) => {
      const date = addDays(today, i);
      const booked =
        requestRows.filter((r) => r.rideDate === date && ["pending", "confirmed"].includes(r.status)).reduce((s, r) => s + r.riders, 0) +
        confirmedBookings.filter((b) => b.rideDate === date && b.status === "confirmed").length;
      return { date, booked };
    });

    const thisMonth = months[months.length - 1];
    const todayRides = rides.filter((r) => r.date === today);
    const pendingCount = requestRows.filter((r) => r.status === "pending").length;

    return NextResponse.json({
      me: { id: staff.id, name: staff.name, email: staff.email, role: staff.role },
      today,
      bookings: confirmedBookings,
      bookingRequests: requestRows,
      summary: {
        totalBookings: confirmedBookings.length + requestRows.length,
        totalRiders: confirmedBookings.length + requestRows.reduce((sum, request) => sum + request.riders, 0),
        pendingCount,
        ridersToday: todayRides.reduce((s, r) => s + r.riders, 0),
        checkedInToday: todayRides.filter((r) => r.checkedIn).reduce((s, r) => s + r.riders, 0),
        revenueThisMonth: monthly.find((m) => m.month === thisMonth)?.revenue ?? 0,
        ridersThisMonth: monthly.find((m) => m.month === thisMonth)?.riders ?? 0,
        customers: Number(customerCount?.n ?? 0),
        inboxCount: Number(newEnquiries?.n ?? 0) + Number(pendingReviews?.n ?? 0),
      },
      capacity,
      monthly,
      byRoute: Object.values(byRoute).sort((a, b) => b.riders - a.riders),
      upcoming,
      messageLogs: can(staff.role, "messages:read") ? messageLogs : [],
      routesConfig,
      content,
    });
  } catch (error) {
    console.error("Admin dashboard query failed:", error);
    return NextResponse.json({ error: "Dashboard data is unavailable." }, { status: 503 });
  }
}
