import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { bookingRequests, companyRoutesConfig } from "@/db/schema";
import { bookingRequestSchema } from "@/lib/validators";
import { newId } from "@/lib/id";
import { normalizePhone } from "@/lib/phone";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { buildWaLink, logWaMessage } from "@/lib/wa";
import { getDailyRiderCount } from "@/lib/capacity";
import { getDailyCapacity, getSettings } from "@/lib/settings";
import { fireWebhook } from "@/lib/webhook";
import { isIpBlocked } from "@/lib/security";
import { createRidePassToken, createRidePassUrl } from "@/lib/ride-pass";

export async function POST(request) {
  if (await isIpBlocked(clientIp(request))) return NextResponse.json({ error: "Booking from this address is blocked. Please contact us." }, { status: 403 });
  // Each request can trigger WhatsApp/SMS messages that cost money, so throttle per IP.
  if (!rateLimit(`booking-request:${clientIp(request)}`, 5, 10 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many requests. Please try again in a few minutes." }, { status: 429 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = bookingRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  }
  const { dateIso, ...rest } = parsed.data;
  const phone = normalizePhone(rest.phone);
  if (!phone) {
    return NextResponse.json({ error: "Enter a valid phone number, including its country code if outside Botswana." }, { status: 400 });
  }

  try {
    const { bookingsOpen } = await getSettings();
    if (bookingsOpen === "false") {
      return NextResponse.json({ error: "Online booking is paused for now. Please call or message us to book." }, { status: 503 });
    }
    const booked = await getDailyRiderCount(dateIso);
    const capacity = await getDailyCapacity();
    const remaining = Math.max(0, capacity - booked);
    if (rest.riders > remaining) {
      return NextResponse.json({
        error: remaining === 0
          ? "This date is fully booked. Please choose another date."
          : `Only ${remaining} rider${remaining === 1 ? "" : "s"} remain available for this date.`,
        remaining,
      }, { status: 409 });
    }

    const [created] = await db
      .insert(bookingRequests)
      .values({ id: newId(), ...rest, phone, rideDate: dateIso, status: "pending" })
      .returning({ id: bookingRequests.id, status: bookingRequests.status });

    const [route] = await db.select().from(companyRoutesConfig).where(eq(companyRoutesConfig.routeId, rest.routeId));
    const total = route ? ` Total: P${(Number(route.priceBwp) * rest.riders).toFixed(2).replace(/\.00$/, "")}, payable on the day.` : "";
    const ref = created.id.slice(0, 8);

    await fireWebhook("booking_request.created", { id: created.id, name: rest.name, phone, routeId: rest.routeId, rideDate: dateIso, riders: rest.riders });
    // The pass link works once staff confirm the booking; the site can show its QR now and say so.
    const ridePassUrl = createRidePassUrl(createRidePassToken(created.id), request.url);

    // Build WhatsApp click-to-chat link for the rider (non-blocking, best-effort)
    const riderMsg = `Dumela ${rest.name}! We received your City Bike Tours request (${route?.routeName ?? rest.routeId}) for ${dateIso}, ${rest.riders} rider${rest.riders > 1 ? "s" : ""}.${total} We'll confirm shortly. Ref: ${ref}`;
    const waLink = buildWaLink(phone, riderMsg);
    if (waLink) {
      const { infobipSmsLogs } = await import("@/db/schema");
      await logWaMessage(db, infobipSmsLogs, {
        bookingRequestId: created.id,
        recipient: phone,
        message: riderMsg,
      });
    }

    return NextResponse.json({ request: created, ridePassUrl, ridePassActive: false }, { status: 201 });
  } catch (error) {
    console.error("Failed to save booking request:", error);
    return NextResponse.json({ error: "We couldn't save your request. Please try again." }, { status: 503 });
  }
}
