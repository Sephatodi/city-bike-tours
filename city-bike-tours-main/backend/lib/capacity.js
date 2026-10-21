import { and, count, eq, inArray, ne, sum } from "drizzle-orm";
import { db } from "@/db/client";
import { bookingRequests, bookings } from "@/db/schema";

export async function getDailyRiderCount(dateIso, excludeRequestId) {
  const requestConditions = [
    eq(bookingRequests.rideDate, dateIso),
    inArray(bookingRequests.status, ["pending", "confirmed"]),
  ];
  if (excludeRequestId) requestConditions.push(ne(bookingRequests.id, excludeRequestId));

  const [accountBookings, requestBookings] = await Promise.all([
    db.select({ riders: count() })
      .from(bookings)
      .where(and(eq(bookings.rideDate, dateIso), eq(bookings.status, "confirmed"))),
    db.select({ riders: sum(bookingRequests.riders) })
      .from(bookingRequests)
      .where(and(...requestConditions)),
  ]);

  return Number(accountBookings[0]?.riders ?? 0) + Number(requestBookings[0]?.riders ?? 0);
}
