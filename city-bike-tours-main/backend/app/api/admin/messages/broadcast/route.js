import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { bookingRequests, bookings, infobipSmsLogs, subscribers, users } from "@/db/schema";
import { requirePermission } from "@/lib/rbac";
import { logAudit } from "@/lib/audit";
import { broadcastSchema } from "@/lib/validators";
import { normalizePhone } from "@/lib/phone";
import { buildWaLink, logWaMessage } from "@/lib/wa";
import { rateLimit } from "@/lib/rate-limit";

const MAX_RECIPIENTS = 60;

async function subscriberRecipients() {
  const rows = await db.select({ id: subscribers.id, name: subscribers.email, phone: subscribers.phone }).from(subscribers).where(eq(subscribers.status, "subscribed"));
  return rows.filter((r) => r.phone).map((r) => ({ ...r, name: r.name || r.phone, source: "subscriber" }));
}

async function recipientsFor(rideDate) {
  const [requests, accountRows] = await Promise.all([
    db.select({ id: bookingRequests.id, name: bookingRequests.name, phone: bookingRequests.phone })
      .from(bookingRequests)
      .where(and(eq(bookingRequests.rideDate, rideDate), eq(bookingRequests.status, "confirmed"))),
    db.select({ id: bookings.id, name: users.name, phone: users.phone })
      .from(bookings)
      .innerJoin(users, eq(bookings.userId, users.id))
      .where(and(eq(bookings.rideDate, rideDate), eq(bookings.status, "confirmed"))),
  ]);
  const seen = new Set();
  const list = [];
  for (const r of requests) if (r.phone && !seen.has(r.phone)) { seen.add(r.phone); list.push({ ...r, source: "request" }); }
  for (const r of accountRows) if (r.phone && !seen.has(r.phone)) { seen.add(r.phone); list.push({ ...r, source: "booking" }); }
  return list;
}

// Sends one message to everyone with a confirmed ride on a date (weather delay, meeting point change, ...).
export async function POST(request) {
  const guard = await requirePermission("messages:send");
  if (guard.error) return guard.error;
  const staff = guard.staff;

  const parsed = broadcastSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid message." }, { status: 400 });
  const { audience, rideDate, message, dryRun } = parsed.data;
  if (audience === "riders" && !rideDate) return NextResponse.json({ error: "Choose a ride date." }, { status: 400 });

  const recipients = audience === "subscribers" ? await subscriberRecipients() : await recipientsFor(rideDate);
  const reachable = recipients.filter((r) => normalizePhone(r.phone));
  if (dryRun) return NextResponse.json({ count: reachable.length, skipped: recipients.length - reachable.length });

  if (!reachable.length) return NextResponse.json({ error: "No one to send to: nobody with a valid phone number matches." }, { status: 409 });
  if (reachable.length > MAX_RECIPIENTS) return NextResponse.json({ error: `That's ${reachable.length} recipients; the limit is ${MAX_RECIPIENTS} per send.` }, { status: 409 });
  if (!rateLimit(`broadcast:${staff.id}`, 5, 10 * 60 * 1000)) {
    return NextResponse.json({ error: "You've sent several messages in a row. Wait a few minutes and try again." }, { status: 429 });
  }

  const body = `City Bike Tours: ${message}`;
  const waLinks = [];
  for (const r of reachable) {
    const waLink = buildWaLink(r.phone, body);
    waLinks.push({ ...r, waLink });
    if (waLink) {
      await logWaMessage(db, infobipSmsLogs, {
        bookingRequestId: r.source === "request" ? r.id : null,
        bookingId: r.source === "booking" ? r.id : null,
        recipient: r.phone,
        message: body,
      });
    }
  }

  const sent = waLinks.filter((x) => x.waLink).length;
  await logAudit(staff, "message.broadcast", `Prepared ${sent} of ${reachable.length} WhatsApp links for ${audience === "subscribers" ? "subscribers" : `riders for ${rideDate}`}`, { targetType: "broadcast", targetId: rideDate || "subscribers", detail: { message } });
  return NextResponse.json({ sent, failed: reachable.length - sent, total: reachable.length, waLinks });
}
