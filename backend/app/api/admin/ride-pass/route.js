import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { bookingRequests, bookings } from "@/db/schema";
import { requirePermission } from "@/lib/rbac";
import { createRidePassToken, createRidePassUrl } from "@/lib/ride-pass";

export const dynamic = "force-dynamic";

// GET /api/admin/ride-pass?type=request|booking&id=...
// Gives staff the rider's pass link and QR so they can send it with a free WhatsApp click-to-chat link.
export async function GET(request) {
  const guard = await requirePermission("bookings:read");
  if (guard.error) return guard.error;

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") === "booking" ? "booking" : "request";
  const id = searchParams.get("id") || "";

  const [row] = type === "request"
    ? await db.select({ status: bookingRequests.status }).from(bookingRequests).where(eq(bookingRequests.id, id))
    : await db.select({ status: bookings.status }).from(bookings).where(eq(bookings.id, id));
  if (!row) return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  if (row.status !== "confirmed") return NextResponse.json({ error: "The ride pass works once the booking is confirmed." }, { status: 409 });

  const ticketUrl = createRidePassUrl(createRidePassToken(id, type), request.url);
  const qr = await QRCode.toDataURL(ticketUrl, { width: 256, margin: 1, errorCorrectionLevel: "M" });
  return NextResponse.json({ ticketUrl, qr, messagingConfigured: false });
}
