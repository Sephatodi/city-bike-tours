import { NextResponse } from "next/server";
import { or, eq, desc } from "drizzle-orm";
import { db } from "@/db/client";
import { infobipSmsLogs, bookingRequests, bookings, users, companyRoutesConfig } from "@/db/schema";
import { normalizePhone } from "@/lib/phone";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const rawPhone = searchParams.get("phone") || "";
  const phone = normalizePhone(rawPhone);

  if (!phone) {
    return NextResponse.json({ error: "Phone number is required." }, { status: 400 });
  }

  // Find all logs for this phone number
  const logs = await db.select().from(infobipSmsLogs).where(eq(infobipSmsLogs.recipient, phone)).orderBy(desc(infobipSmsLogs.sentAt)).limit(100);

  // Enrich with booking details
  const messages = await Promise.all(logs.map(async (log) => {
    let rideDate = null;
    let routeName = null;
    let ticketUrl = null;

    if (log.bookingRequestId) {
      const [br] = await db.select({ rideDate: bookingRequests.rideDate, routeId: bookingRequests.routeId }).from(bookingRequests).where(eq(bookingRequests.id, log.bookingRequestId));
      if (br) {
        rideDate = br.rideDate;
        const [route] = await db.select({ routeName: companyRoutesConfig.routeName }).from(companyRoutesConfig).where(eq(companyRoutesConfig.routeId, br.routeId));
        routeName = route?.routeName || "City Bike Tours ride";
        // Generate ticket URL for this booking request
        const { createRidePassToken, createRidePassUrl } = await import("@/lib/ride-pass");
        const token = createRidePassToken(br.id);
        ticketUrl = createRidePassUrl(token, request.url);
      }
    } else if (log.bookingId) {
      const [bk] = await db.select({ rideDate: bookings.rideDate, routeId: bookings.routeId, category: bookings.category }).from(bookings).where(eq(bookings.id, log.bookingId));
      if (bk) {
        rideDate = bk.rideDate;
        if (bk.routeId) {
          const [route] = await db.select({ routeName: companyRoutesConfig.routeName }).from(companyRoutesConfig).where(eq(companyRoutesConfig.routeId, bk.routeId));
          routeName = route?.routeName || "City Bike Tours ride";
        } else {
          routeName = bk.category === "lesson" ? "Cycling lesson" : "City Bike Tours ride";
        }
        const { createRidePassToken, createRidePassUrl } = await import("@/lib/ride-pass");
        const token = createRidePassToken(bk.id, "booking");
        ticketUrl = createRidePassUrl(token, request.url);
      }
    }

    return {
      type: log.channel,
      message: log.message,
      sentAt: log.sentAt,
      status: log.status,
      rideDate,
      routeName,
      link: ticketUrl,
    };
  }));

  return NextResponse.json({ messages });
}