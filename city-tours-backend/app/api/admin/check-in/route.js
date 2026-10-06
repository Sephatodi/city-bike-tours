import { NextResponse } from "next/server";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db/client";
import { bookingRequests, bookings, companyRoutesConfig, users } from "@/db/schema";
import { isAdmin } from "@/lib/admin";
import { verifyRidePassToken } from "@/lib/ride-pass";

function gaboroneDate() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Gaborone" }).format(new Date());
}

export async function POST(request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Admin access required." }, { status: 403 });

  const body = await request.json().catch(() => null);
  const pass = verifyRidePassToken(body?.token);
  if (!pass) return NextResponse.json({ error: "This QR pass is not valid." }, { status: 400 });

  let booking;
  if (pass.type === "request") {
    const [requestBooking] = await db.select().from(bookingRequests).where(eq(bookingRequests.id, pass.id));
    booking = requestBooking && { ...requestBooking, riders: requestBooking.riders };
  } else {
    const [accountBooking] = await db.select({
      id: bookings.id,
      name: users.name,
      category: bookings.category,
      rideDate: bookings.rideDate,
      routeId: bookings.routeId,
      status: bookings.status,
      checkedInAt: bookings.checkedInAt,
    }).from(bookings).innerJoin(users, eq(bookings.userId, users.id)).where(eq(bookings.id, pass.id));
    booking = accountBooking && { ...accountBooking, riders: 1 };
  }

  if (!booking || booking.status !== "confirmed") {
    return NextResponse.json({ error: "This booking is not confirmed." }, { status: 404 });
  }
  if (booking.rideDate !== gaboroneDate()) {
    return NextResponse.json({ error: `This pass is for ${booking.rideDate}, not today.` }, { status: 409 });
  }
  if (booking.checkedInAt) {
    return NextResponse.json({ error: "This pass has already been checked in.", checkedInAt: booking.checkedInAt }, { status: 409 });
  }

  const [checkedIn] = pass.type === "request"
    ? await db.update(bookingRequests)
      .set({ checkedInAt: new Date() })
      .where(and(eq(bookingRequests.id, pass.id), eq(bookingRequests.status, "confirmed"), isNull(bookingRequests.checkedInAt)))
      .returning()
    : await db.update(bookings)
      .set({ checkedInAt: new Date() })
      .where(and(eq(bookings.id, pass.id), eq(bookings.status, "confirmed"), isNull(bookings.checkedInAt)))
      .returning();

  if (!checkedIn) {
    return NextResponse.json({ error: "This pass has already been checked in." }, { status: 409 });
  }

  const [route] = checkedIn.routeId
    ? await db.select().from(companyRoutesConfig).where(eq(companyRoutesConfig.routeId, checkedIn.routeId))
    : [];
  return NextResponse.json({
    ticket: {
      reference: checkedIn.id.slice(0, 8).toUpperCase(),
      name: pass.type === "booking" ? booking.name : checkedIn.name,
      routeName: route?.routeName || (booking.category === "lesson" ? "Cycling lesson" : "City Bike Tours ride"),
      rideDate: checkedIn.rideDate,
      riders: checkedIn.riders,
      checkedInAt: checkedIn.checkedInAt,
    },
  });
}