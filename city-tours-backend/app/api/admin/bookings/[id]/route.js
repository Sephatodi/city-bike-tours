import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { bookings, companyRoutesConfig, users } from "@/db/schema";
import { bookingStatusSchema } from "@/lib/validators";
import { isAdmin } from "@/lib/admin";
import { createRidePassToken, createRidePassUrl } from "@/lib/ride-pass";
import { notify, notifyBoth } from "@/lib/sms";

const MESSAGES = {
  cancelled: "has been CANCELLED. Contact City Bike Tours if this is a mistake.",
};

export async function PATCH(request, { params }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Admin access required." }, { status: 403 });

  const parsed = bookingStatusSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid booking status." }, { status: 400 });

  const [current] = await db.select({
    id: bookings.id,
    status: bookings.status,
    name: users.name,
    phone: users.phone,
    routeId: bookings.routeId,
  }).from(bookings).innerJoin(users, eq(bookings.userId, users.id)).where(eq(bookings.id, params.id));
  if (!current) return NextResponse.json({ error: "Booking not found." }, { status: 404 });

  const [updated] = await db.update(bookings)
    .set({ status: parsed.data.status })
    .where(eq(bookings.id, params.id))
    .returning();

  let notifications = null;
  let ticketUrl = null;
  if (current.status !== updated.status && updated.status === "confirmed") {
    const [route] = updated.routeId
      ? await db.select().from(companyRoutesConfig).where(eq(companyRoutesConfig.routeId, updated.routeId))
      : [];
    ticketUrl = createRidePassUrl(createRidePassToken(updated.id, "booking"), request.url);
    const routeName = route?.routeName || "cycling lesson";
    const reference = updated.id.slice(0, 8).toUpperCase();
    const body = `Dumela ${current.name}! Your City Bike Tours ${routeName} is confirmed for ${updated.rideDate} (${updated.timeSlot}). Meet at Main Mall, Gaborone. Show your ride pass at check-in: ${ticketUrl} Ref: ${reference}`;
    notifications = await notifyBoth(current.phone, body, {
      "1": current.name,
      "2": routeName,
      "3": updated.rideDate,
      "4": "1",
      "5": ticketUrl,
      "6": reference,
    });
  } else if (current.status !== updated.status && MESSAGES[updated.status]) {
    await notify(current.phone, `City Bike Tours: your ${updated.rideDate} booking ${MESSAGES[updated.status]} Ref: ${updated.id.slice(0, 8)}`);
  }

  return NextResponse.json({ booking: updated, notifications, ticketUrl });
}