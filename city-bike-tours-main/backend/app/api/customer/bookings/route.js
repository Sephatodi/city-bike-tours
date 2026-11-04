import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { bookingRequests, companyRoutesConfig } from "@/db/schema";
import { requireCustomer } from "@/lib/customer-auth";
import { getSettings } from "@/lib/settings";
import { gaboroneDate } from "@/lib/time";
import { createRidePassToken, createRidePassUrl } from "@/lib/ride-pass";
import { canCancelBooking } from "@/lib/booking-lifecycle";

export const dynamic = "force-dynamic";

const rideTime = (booking) => booking.notes?.match(/Preferred start time:\s*(\d{2}:\d{2})/)?.[1] || "09:00";

export async function GET(request) {
  const auth = await requireCustomer(request);
  if (auth.error) return auth.error;
  const [settings, rows] = await Promise.all([
    getSettings(),
    db.select({
      id: bookingRequests.id,
      routeId: bookingRequests.routeId,
      routeName: companyRoutesConfig.routeName,
      rideDate: bookingRequests.rideDate,
      riders: bookingRequests.riders,
      priceTotal: bookingRequests.priceTotal,
      status: bookingRequests.status,
      paymentStatus: bookingRequests.paymentStatus,
      notes: bookingRequests.notes,
      confirmationCode: bookingRequests.confirmationCode,
    }).from(bookingRequests)
      .leftJoin(companyRoutesConfig, eq(bookingRequests.routeId, companyRoutesConfig.routeId))
      .where(eq(bookingRequests.userId, auth.user.id))
      .orderBy(desc(bookingRequests.rideDate)),
  ]);
  const cancellationHours = Number(settings.cancellationHours ?? 24);
  const bookings = rows.map((booking) => {
    const time = rideTime(booking);
    const cancellable = canCancelBooking(booking.status, booking.rideDate, time, cancellationHours);
    return {
      ...booking,
      time,
      ridePassUrl: booking.status === "confirmed"
        ? createRidePassUrl(createRidePassToken(booking.id), request.url)
        : null,
      cancellable,
    };
  });
  return NextResponse.json({ bookings, cancellationHours, today: gaboroneDate() });
}
