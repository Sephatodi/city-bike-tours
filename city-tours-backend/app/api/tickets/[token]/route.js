import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { bookingRequests, bookings, companyRoutesConfig, users } from "@/db/schema";
import { verifyRidePassToken } from "@/lib/ride-pass";

export async function GET(_request, { params }) {
  const pass = verifyRidePassToken(params.token);
  if (!pass) return NextResponse.json({ error: "This ride pass is not valid." }, { status: 404 });

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

  const [route] = booking.routeId
    ? await db.select().from(companyRoutesConfig).where(eq(companyRoutesConfig.routeId, booking.routeId))
    : [];
  return NextResponse.json({
    ticket: {
      reference: booking.id.slice(0, 8).toUpperCase(),
      name: booking.name,
      routeName: route?.routeName || (booking.category === "lesson" ? "Cycling lesson" : "City Bike Tours ride"),
      rideDate: booking.rideDate,
      riders: booking.riders,
      checkedInAt: booking.checkedInAt,
    },
  }, { headers: { "Cache-Control": "no-store" } });
}