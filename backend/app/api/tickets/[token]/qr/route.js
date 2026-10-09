import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { bookingRequests, bookings } from "@/db/schema";
import { createRidePassUrl, verifyRidePassToken } from "@/lib/ride-pass";

export async function GET(request, { params }) {
  const pass = verifyRidePassToken(params.token);
  if (!pass) return NextResponse.json({ error: "This ride pass is not valid." }, { status: 404 });

  const [booking] = pass.type === "request"
    ? await db.select({ status: bookingRequests.status }).from(bookingRequests).where(eq(bookingRequests.id, pass.id))
    : await db.select({ status: bookings.status }).from(bookings).where(eq(bookings.id, pass.id));
  if (!booking || booking.status !== "confirmed") {
    return NextResponse.json({ error: "This ride pass is not available." }, { status: 404 });
  }

  const image = await QRCode.toBuffer(createRidePassUrl(params.token, request.url), {
    type: "png",
    width: 512,
    margin: 2,
    errorCorrectionLevel: "M",
  });
  return new Response(new Uint8Array(image), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "private, no-store",
    },
  });
}