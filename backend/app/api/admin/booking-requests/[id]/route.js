import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { bookingRequests, companyRoutesConfig } from "@/db/schema";
import { bookingRequestUpdateSchema } from "@/lib/validators";
import { isAdmin } from "@/lib/admin";
import { notify, notifyBoth } from "@/lib/sms";
import { normalizePhone } from "@/lib/phone";
import { createRidePassToken, createRidePassUrl } from "@/lib/ride-pass";

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

  const { dateIso, phone, ...changes } = parsed.data;
  const updates = {
    ...changes,
    ...(dateIso ? { rideDate: dateIso } : {}),
    ...(phone ? { phone: normalizePhone(phone) } : {}),
  };

  const [updated] = await db.update(bookingRequests)
    .set(updates)
    .where(eq(bookingRequests.id, params.id))
    .returning();

  let notifications = null;
  let ticketUrl = null;

  if (current.status !== updated.status && updated.status === "confirmed") {
    const [route] = await db.select().from(companyRoutesConfig).where(eq(companyRoutesConfig.routeId, updated.routeId));
    ticketUrl = createRidePassUrl(createRidePassToken(updated.id), request.url);
    const routeName = route?.routeName || "City Bike Tours ride";
    const reference = updated.id.slice(0, 8).toUpperCase();
    const body = `Dumela ${updated.name}! Your ${routeName} is confirmed for ${updated.rideDate} for ${updated.riders} rider${updated.riders === 1 ? "" : "s"}. Meet at Main Mall, Gaborone. Show your ride pass at check-in: ${ticketUrl} Ref: ${reference}`;
    notifications = await notifyBoth(updated.phone, body, {
      "1": updated.name,
      "2": routeName,
      "3": updated.rideDate,
      "4": String(updated.riders),
      "5": ticketUrl,
      "6": reference,
    });
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
