import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { bookingRequests, companyRoutesConfig } from "@/db/schema";
import { bookingRequestUpdateSchema } from "@/lib/validators";
import { isAdmin } from "@/lib/admin";
import { notify, notifyWhatsApp } from "@/lib/sms";
import { normalizePhone } from "@/lib/phone";
import { createRidePassToken, createRidePassUrl } from "@/lib/ride-pass";
import { getDailyRiderCount } from "@/lib/capacity";
import { RIDE_CAPACITY } from "@/lib/data";
import { createBookingConfirmation } from "@/lib/confirmation";

const MESSAGES = {
  confirmed: "is CONFIRMED. See you at Main Mall!",
  declined: "could not be accommodated. Please contact us to pick another date.",
  cancelled: "has been CANCELLED. Contact us if this is a mistake.",
};

export async function PATCH(request, { params }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Admin access required." }, { status: 403 });

  const parsed = bookingRequestUpdateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid booking request update." }, { status: 400 });

  const [current] = await db.select().from(bookingRequests).where(eq(bookingRequests.id, params.id));
  if (!current) return NextResponse.json({ error: "Booking request not found." }, { status: 404 });

  const { dateIso, phone, resendConfirmation, ...changes } = parsed.data;
  if (resendConfirmation && current.status !== "confirmed") {
    return NextResponse.json({ error: "Only confirmed bookings can have a confirmation resent." }, { status: 409 });
  }
  const updates = {
    ...changes,
    ...(dateIso ? { rideDate: dateIso } : {}),
    ...(phone ? { phone: normalizePhone(phone) } : {}),
  };
  if (phone && !updates.phone) {
    return NextResponse.json({ error: "Enter a valid phone number, including its country code if outside Botswana." }, { status: 400 });
  }

  const nextStatus = updates.status ?? current.status;
  const nextRideDate = updates.rideDate ?? current.rideDate;
  const nextRiders = updates.riders ?? current.riders;
  const needsCapacityCheck =
    ["pending", "confirmed"].includes(nextStatus) &&
    (nextStatus !== current.status || nextRideDate !== current.rideDate || nextRiders !== current.riders);

  if (needsCapacityCheck) {
    const booked = await getDailyRiderCount(nextRideDate, current.id);
    const remaining = Math.max(0, RIDE_CAPACITY - booked);
    if (nextRiders > remaining) {
      return NextResponse.json({
        error: `This date has room for only ${remaining} more rider${remaining === 1 ? "" : "s"}.`,
        remaining,
      }, { status: 409 });
    }
  }

  let updated = current;
  if (Object.keys(updates).length) {
    [updated] = await db.update(bookingRequests)
      .set(updates)
      .where(and(eq(bookingRequests.id, params.id), eq(bookingRequests.status, current.status)))
      .returning();
    if (!updated) {
      return NextResponse.json({ error: "This booking request changed. Refresh and try again." }, { status: 409 });
    }
  }

  let notifications = null;
  let ticketUrl = null;

  if (updated.status === "confirmed" && (current.status !== "confirmed" || resendConfirmation)) {
    const [route] = await db.select().from(companyRoutesConfig).where(eq(companyRoutesConfig.routeId, updated.routeId));
    ticketUrl = createRidePassUrl(createRidePassToken(updated.id), request.url);
    const preferredTime = updated.notes?.match(/Preferred start time:\s*(\d{2}:\d{2})/)?.[1] || "09:00";
    const confirmation = await createBookingConfirmation({
      name: updated.name,
      date: updated.rideDate,
      time: preferredTime,
      guests: updated.riders,
      link: ticketUrl,
    });
    notifications = {
      whatsapp: await notifyWhatsApp(updated.phone, confirmation.body, confirmation.whatsappVariables, confirmation.contentSid),
      template: confirmation.templateKey,
    };
  }

  // Send operational status changes through the existing best-effort channel.
  if (current.status !== updated.status && MESSAGES[updated.status]) {
    if (updated.status !== "confirmed") {
      await notify(updated.phone, `City Bike Tours: your request for ${updated.rideDate} ${MESSAGES[updated.status]} Ref: ${current.id.slice(0, 8)}`);
    }
  } else if (dateIso || phone || changes.name || changes.routeId || changes.riders || changes.notes) {
    await notify(updated.phone, `City Bike Tours: your booking request details were updated for ${updated.rideDate}, ${updated.riders} rider${updated.riders === 1 ? "" : "s"}. Ref: ${current.id.slice(0, 8)}`);
  }
  return NextResponse.json({ request: updated, notifications, ticketUrl });
}
