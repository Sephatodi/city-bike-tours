import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { bookingRequests, companyRoutesConfig } from "@/db/schema";
import { requirePermission } from "@/lib/rbac";
import { logAudit } from "@/lib/audit";
import { sendBookingConfirmationEmail } from "@/lib/email";
import { getOrCreateBookingCode } from "@/lib/booking-code";
import { createRidePassToken, createRidePassUrl } from "@/lib/ride-pass";
import { formatGaboroneDate } from "@/lib/time";

export async function POST(request, { params }) {
  const guard = await requirePermission("bookings:write");
  if (guard.error) return guard.error;
  const [booking] = await db.select().from(bookingRequests).where(eq(bookingRequests.id, params.id));
  if (!booking) return NextResponse.json({ error: "Booking request not found." }, { status: 404 });
  if (booking.status !== "confirmed") return NextResponse.json({ error: "Only confirmed bookings can receive a confirmation email." }, { status: 409 });
  if (!booking.email || booking.email.toLowerCase().endsWith(".invalid")) {
    return NextResponse.json({ error: "This booking has no deliverable email address." }, { status: 409 });
  }

  const [route] = await db.select().from(companyRoutesConfig).where(eq(companyRoutesConfig.routeId, booking.routeId));
  const time = booking.notes?.match(/Preferred start time:\s*(\d{2}:\d{2})/)?.[1] || "09:00";
  const code = await getOrCreateBookingCode(db, booking.id);
  const link = createRidePassUrl(createRidePassToken(booking.id), request.url);
  const result = await sendBookingConfirmationEmail({
    to: booking.email,
    name: booking.name,
    date: formatGaboroneDate(booking.rideDate),
    time,
    guests: booking.riders,
    routeName: route?.routeName || booking.routeId,
    confirmationCode: code,
    link,
    total: booking.priceTotal,
    relatedId: booking.id,
  });
  await logAudit(guard.staff, "booking.resend_email", `Resent a booking confirmation email for ${booking.name}`, {
    targetType: "booking_request",
    targetId: booking.id,
  });
  if (result.status !== "sent") return NextResponse.json({ error: "The confirmation email could not be sent." }, { status: 502 });
  return NextResponse.json({ ok: true });
}
