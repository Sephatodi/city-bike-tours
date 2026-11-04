import { NextResponse } from "next/server";
import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import { auditLogs, bookingRequests, companyRoutesConfig } from "@/db/schema";
import { requireCustomer } from "@/lib/customer-auth";
import { getSettings } from "@/lib/settings";
import { formatGaboroneDate } from "@/lib/time";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { renderEmailTemplate } from "@/lib/email-templates";
import { sendEmail } from "@/lib/email";
import { notifyAdmins } from "@/lib/admin-email";
import { sendSmsMessage, smsProviders } from "@/lib/otp";
import { canCancelBooking } from "@/lib/booking-lifecycle";

const cancelSchema = z.object({ reason: z.string().trim().max(500).optional().default("") });
const rideTime = (booking) => booking.notes?.match(/Preferred start time:\s*(\d{2}:\d{2})/)?.[1] || "09:00";

export async function POST(request, { params }) {
  const auth = await requireCustomer(request);
  if (auth.error) return auth.error;
  if (!rateLimit(`booking-cancel:${auth.user.id}:${clientIp(request)}`, 5, 60 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many cancellation requests. Please try again later." }, { status: 429 });
  }
  const parsed = cancelSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid cancellation." }, { status: 400 });

  const [booking] = await db.select().from(bookingRequests).where(and(
    eq(bookingRequests.id, params.id),
    eq(bookingRequests.userId, auth.user.id),
  ));
  if (!booking) return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  if (!["pending", "confirmed"].includes(booking.status)) {
    return NextResponse.json({ error: "This booking can no longer be cancelled." }, { status: 409 });
  }

  const settings = await getSettings();
  const cancellationHours = Number(settings.cancellationHours ?? 24);
  if (!canCancelBooking(booking.status, booking.rideDate, rideTime(booking), cancellationHours)) {
    return NextResponse.json({ error: `Bookings can only be cancelled more than ${cancellationHours} hours before the ride.` }, { status: 409 });
  }

  const now = new Date();
  const [updated] = await db.update(bookingRequests).set({
    status: "cancelled",
    cancelledAt: now,
    cancelledBy: "customer",
    cancelReason: parsed.data.reason || null,
  }).where(and(
    eq(bookingRequests.id, booking.id),
    eq(bookingRequests.userId, auth.user.id),
    inArray(bookingRequests.status, ["pending", "confirmed"]),
  )).returning();
  if (!updated) return NextResponse.json({ error: "This booking has already changed." }, { status: 409 });

  await db.insert(auditLogs).values({
    actorId: auth.user.id,
    actorName: auth.user.name,
    actorRole: "customer",
    action: "booking.customer_cancel",
    targetType: "booking_request",
    targetId: booking.id,
    summary: `Customer cancelled booking ${booking.id} for ${booking.rideDate}.`,
    detail: { reason: parsed.data.reason || null },
  });
  const route = (await db.select({ routeName: companyRoutesConfig.routeName })
    .from(companyRoutesConfig).where(eq(companyRoutesConfig.routeId, booking.routeId)))[0];
  const date = formatGaboroneDate(booking.rideDate);
  if (booking.email) {
    const rendered = renderEmailTemplate("bookingCancelled", {
      name: booking.name,
      date,
      reason: parsed.data.reason,
    }, settings);
    await sendEmail({
      to: booking.email,
      ...rendered,
      template: "bookingCancelled",
      relatedType: "booking_request",
      relatedId: booking.id,
    });
  }

  const smsMessage = `City Bike Tours: your booking for ${date} has been cancelled.`;
  if (smsProviders().length) {
    try {
      await sendSmsMessage({ phone: booking.phone, body: smsMessage });
    } catch (error) {
      console.error("Customer cancellation SMS failed:", error instanceof Error ? error.message : "unknown error");
    }
  }
  await notifyAdmins("cancelledBooking", {
    id: booking.id,
    rider: booking.name,
    route: route?.routeName || booking.routeId,
    date,
    riders: String(booking.riders),
    reason: parsed.data.reason,
  }, { relatedType: "booking_request", relatedId: booking.id });

  return NextResponse.json({ booking: updated });
}
