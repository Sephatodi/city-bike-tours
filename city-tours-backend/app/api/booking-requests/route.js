import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { bookingRequests, companyRoutesConfig } from "@/db/schema";
import { bookingRequestSchema } from "@/lib/validators";
import { newId } from "@/lib/id";
import { normalizePhone } from "@/lib/phone";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { notify, notifyAdmin } from "@/lib/sms";

export async function POST(request) {
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

  try {
    const [created] = await db
      .insert(bookingRequests)
      .values({ id: newId(), ...rest, phone, rideDate: dateIso, status: "pending" })
      .returning({ id: bookingRequests.id, status: bookingRequests.status });

    // Best-effort notifications: a Twilio problem must never fail the booking.
    const [route] = await db.select().from(companyRoutesConfig).where(eq(companyRoutesConfig.routeId, rest.routeId));
    const total = route ? ` Total: P${(Number(route.priceBwp) * rest.riders).toFixed(2).replace(/\.00$/, "")}, payable on the day.` : "";
    const ref = created.id.slice(0, 8);
    await Promise.all([
      notify(phone, `Dumela ${rest.name}! We received your City Bike Tours request (${route?.routeName ?? rest.routeId}) for ${dateIso}, ${rest.riders} rider${rest.riders > 1 ? "s" : ""}.${total} We'll confirm shortly. Ref: ${ref}`),
      notifyAdmin(`New booking request: ${rest.name} (${phone}), ${route?.routeName ?? rest.routeId}, ${dateIso}, ${rest.riders} rider(s). Ref ${ref}`),
    ]);

    return NextResponse.json({ request: created }, { status: 201 });
  } catch (error) {
    console.error("Failed to save booking request:", error);
    return NextResponse.json({ error: "We couldn't save your request. Please try again." }, { status: 503 });
  }
}
