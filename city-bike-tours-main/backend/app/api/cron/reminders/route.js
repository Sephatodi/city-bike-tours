import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db/client";
import { auditLogs, bookingRequests, companyRoutesConfig } from "@/db/schema";
import { getSettings } from "@/lib/settings";
import { addRideDays, formatGaboroneDate, gaboroneDate } from "@/lib/time";
import { createRidePassToken, createRidePassUrl } from "@/lib/ride-pass";
import { renderEmailTemplate } from "@/lib/email-templates";
import { sendEmail } from "@/lib/email";
import { sendSmsMessage, smsProviders } from "@/lib/otp";

function authorized(request, secret) {
  const supplied = request.headers.get("authorization") || "";
  const expected = `Bearer ${secret}`;
  const left = createHash("sha256").update(supplied).digest();
  const right = createHash("sha256").update(expected).digest();
  return timingSafeEqual(left, right);
}

const rideTime = (booking) => booking.notes?.match(/Preferred start time:\s*(\d{2}:\d{2})/)?.[1] || "09:00";

export async function POST(request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ error: "disabled" }, { status: 503 });
  if (!authorized(request, secret)) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const tomorrow = addRideDays(gaboroneDate(), 1);
  const candidates = await db.select({ id: bookingRequests.id }).from(bookingRequests)
    .where(and(
      eq(bookingRequests.status, "confirmed"),
      eq(bookingRequests.rideDate, tomorrow),
      isNull(bookingRequests.reminderSentAt),
    ));
  const claimTime = new Date();
  const claimed = await db.update(bookingRequests).set({ reminderSentAt: claimTime })
    .where(and(
      eq(bookingRequests.status, "confirmed"),
      eq(bookingRequests.rideDate, tomorrow),
      isNull(bookingRequests.reminderSentAt),
    )).returning();

  const settings = await getSettings();
  const frontend = process.env.PUBLIC_FRONTEND_URL || process.env.FRONTEND_URL || "";
  const channel = ["email", "sms", "both"].includes(settings.reminderChannel) ? settings.reminderChannel : "email";
  const smsReady = smsProviders().length > 0;
  let sent = 0;
  let failed = 0;

  for (const booking of claimed) {
    const [route] = await db.select({ routeName: companyRoutesConfig.routeName })
      .from(companyRoutesConfig).where(eq(companyRoutesConfig.routeId, booking.routeId));
    const time = rideTime(booking);
    const date = formatGaboroneDate(booking.rideDate);
    const ridePassUrl = createRidePassUrl(createRidePassToken(booking.id), request.url);
    const cancelUrl = frontend ? new URL("/dashboard", frontend).toString() : "";
    const results = [];

    if (channel === "email" || channel === "both") {
      const rendered = renderEmailTemplate("bookingReminder", {
        name: booking.name,
        routeName: route?.routeName || booking.routeId,
        date,
        time,
        meetingPoint: settings.meetupName,
        arriveEarlyNote: settings.arriveEarlyNote,
        link: ridePassUrl,
        cancelUrl,
      }, settings);
      results.push((await sendEmail({
        to: booking.email || "",
        ...rendered,
        template: "bookingReminder",
        relatedType: "booking_request",
        relatedId: booking.id,
      })).ok);
    }

    if (channel === "sms" || channel === "both") {
      if (smsReady) {
        try {
          await sendSmsMessage({
            phone: booking.phone,
            body: `City Bike Tours reminder: your ride is tomorrow, ${date} at ${time}. Meet at ${settings.meetupName}. ${settings.arriveEarlyNote} Ride pass: ${ridePassUrl} Manage/cancel: ${cancelUrl}`,
          });
          results.push(true);
        } catch (error) {
          console.error("Booking reminder SMS failed:", error instanceof Error ? error.message : "unknown error");
          results.push(false);
        }
      } else {
        results.push(false);
      }
    }

    if (results.some(Boolean)) {
      sent += 1;
    } else {
      failed += 1;
      await db.update(bookingRequests).set({ reminderSentAt: null })
        .where(and(
          eq(bookingRequests.id, booking.id),
          eq(bookingRequests.status, "confirmed"),
          eq(bookingRequests.reminderSentAt, claimTime),
        ));
    }
  }

  await db.insert(auditLogs).values({
    actorName: "Scheduled reminder job",
    actorRole: "system",
    action: "booking.reminders",
    targetType: "booking_request",
    summary: `Reminder job checked ${candidates.length} bookings: ${sent} sent, ${failed} failed.`,
    detail: { checked: candidates.length, sent, failed },
  });
  return NextResponse.json({ checked: candidates.length, sent, failed });
}
