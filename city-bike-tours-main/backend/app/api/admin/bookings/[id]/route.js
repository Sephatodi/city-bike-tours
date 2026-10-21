import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { bookings, users } from "@/db/schema";
import { bookingStatusSchema } from "@/lib/validators";
import { requirePermission } from "@/lib/rbac";
import { logAudit } from "@/lib/audit";
import { createRidePassToken, createRidePassUrl } from "@/lib/ride-pass";
import { buildWaLink, logWaMessage } from "@/lib/wa";
import { createBookingConfirmation } from "@/lib/confirmation";

const MESSAGES = {
  cancelled: "has been CANCELLED. Contact City Bike Tours if this is a mistake.",
};

export async function PATCH(request, { params }) {
  const guard = await requirePermission("bookings:write");
  if (guard.error) return guard.error;
  const staff = guard.staff;

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
    ticketUrl = createRidePassUrl(createRidePassToken(updated.id, "booking"), request.url);
    const confirmation = await createBookingConfirmation({
      name: current.name,
      date: updated.rideDate,
      time: updated.timeSlot,
      guests: 1,
      link: ticketUrl,
    });
    const waLink = buildWaLink(current.phone, confirmation.body);
    if (waLink) {
      await logWaMessage(db, (await import("@/db/schema")).infobipSmsLogs, {
        bookingId: updated.id,
        recipient: current.phone,
        message: confirmation.body,
      });
    }
    notifications = {
      whatsapp: !!waLink,
      template: confirmation.templateKey,
      waLink,
    };
  } else if (current.status !== updated.status && MESSAGES[updated.status]) {
    const msg = `City Bike Tours: your ${updated.rideDate} booking ${MESSAGES[updated.status]} Ref: ${updated.id.slice(0, 8)}`;
    const waLink = buildWaLink(current.phone, msg);
    if (waLink) {
      await logWaMessage(db, (await import("@/db/schema")).infobipSmsLogs, {
        bookingId: updated.id,
        recipient: current.phone,
        message: msg,
      });
    }
  }

  await logAudit(staff, `booking.${updated.status}`, `Set ${current.name}'s account booking for ${updated.rideDate} to ${updated.status}`, { targetType: "booking", targetId: updated.id });
  return NextResponse.json({ booking: updated, notifications, ticketUrl });
}