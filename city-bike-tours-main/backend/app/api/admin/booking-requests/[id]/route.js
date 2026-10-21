import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { bookingRequests, companyRoutesConfig, infobipSmsLogs } from "@/db/schema";
import { bookingRequestUpdateSchema } from "@/lib/validators";
import { requirePermission } from "@/lib/rbac";
import { logAudit } from "@/lib/audit";
import { fireWebhook } from "@/lib/webhook";
import { normalizePhone } from "@/lib/phone";
import { createRidePassQrUrl, createRidePassToken, createRidePassUrl } from "@/lib/ride-pass";
import { getDailyRiderCount } from "@/lib/capacity";
import { getDailyCapacity } from "@/lib/settings";
import { createBookingConfirmation } from "@/lib/confirmation";
import { buildWaLink, logWaMessage } from "@/lib/wa";

const MESSAGES = {
  confirmed: "is CONFIRMED. See you at Main Mall!",
  declined: "could not be accommodated. Please contact us to pick another date.",
  cancelled: "has been CANCELLED. Contact us if this is a mistake.",
};

export async function PATCH(request, { params }) {
  const guard = await requirePermission("bookings:write");
  if (guard.error) return guard.error;
  const staff = guard.staff;

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
    const capacity = await getDailyCapacity();
    const remaining = Math.max(0, capacity - booked);
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
    const ridePassToken = createRidePassToken(updated.id);
    ticketUrl = createRidePassUrl(ridePassToken, request.url);
    const qrImageUrl = createRidePassQrUrl(ridePassToken, request.url);
    const preferredTime = updated.notes?.match(/Preferred start time:\s*(\d{2}:\d{2})/)?.[1] || "09:00";
    const confirmation = await createBookingConfirmation({
      name: updated.name,
      date: updated.rideDate,
      time: preferredTime,
      guests: updated.riders,
      link: ticketUrl,
    });
    // Build WhatsApp click-to-chat link (free, no Twilio needed)
    const digits = normalizePhone(updated.phone);
    const waLink = digits ? `https://wa.me/${digits}?text=${encodeURIComponent(confirmation.body)}` : null;
    const messageLog = await db.insert(infobipSmsLogs).values({
      bookingRequestId: updated.id,
      provider: "wa.me",
      channel: "whatsapp",
      recipient: updated.phone,
      message: confirmation.body,
      status: "QUEUED",
    }).returning({ id: infobipSmsLogs.id });
    // Mark as SENT since we generated the link (actual sending is manual via click-to-chat)
    await db.update(infobipSmsLogs)
      .set({ status: "SENT", statusUpdatedAt: new Date() })
      .where(eq(infobipSmsLogs.id, messageLog[0].id));
    notifications = {
      whatsapp: true,
      messageId: null,
      status: "SENT",
      template: "click-to-chat",
      waLink,
      qrImageUrl,
    };
  }

  // Send operational status changes through WhatsApp click-to-chat links.
  if (current.status !== updated.status && MESSAGES[updated.status]) {
    if (updated.status !== "confirmed") {
      const msg = `City Bike Tours: your request for ${updated.rideDate} ${MESSAGES[updated.status]} Ref: ${current.id.slice(0, 8)}`;
      const waLink = buildWaLink(updated.phone, msg);
      if (waLink) await logWaMessage(db, infobipSmsLogs, { bookingRequestId: updated.id, recipient: updated.phone, message: msg });
    }
  } else if (dateIso || phone || changes.name || changes.routeId || changes.riders || changes.notes) {
    const msg = `City Bike Tours: your booking request details were updated for ${updated.rideDate}, ${updated.riders} rider${updated.riders === 1 ? "" : "s"}. Ref: ${current.id.slice(0, 8)}`;
    const waLink = buildWaLink(updated.phone, msg);
    if (waLink) await logWaMessage(db, infobipSmsLogs, { bookingRequestId: updated.id, recipient: updated.phone, message: msg });
  }
  const statusChanged = current.status !== updated.status;
  if (statusChanged) await fireWebhook(`booking_request.${updated.status}`, { id: updated.id, name: updated.name, rideDate: updated.rideDate, riders: updated.riders });
  await logAudit(staff, resendConfirmation ? "booking.resend" : statusChanged ? `booking.${updated.status}` : "booking.edit",
    resendConfirmation
      ? `Resent the WhatsApp ride pass to ${updated.name}`
      : statusChanged
        ? `Set ${updated.name}'s request for ${updated.rideDate} to ${updated.status}`
        : `Edited ${updated.name}'s request for ${updated.rideDate}`,
    { targetType: "booking_request", targetId: updated.id });
  return NextResponse.json({ request: updated, notifications, ticketUrl });
}
