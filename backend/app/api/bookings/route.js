import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { and, eq, count, desc } from "drizzle-orm";
import { authOptions } from "@/lib/auth";
import { db } from "@/db/client";
import { bookings } from "@/db/schema";
import { bookingSchema } from "@/lib/validators";
import { validateBooking } from "@/lib/booking-rules";
import { computePrice } from "@/lib/pricing";
import { RIDE_CAPACITY } from "@/lib/data";
import { newId } from "@/lib/id";
import { sendBookingConfirmation } from "@/lib/sms";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in to view your bookings." }, { status: 401 });
  }

  const rows = await db
    .select()
    .from(bookings)
    .where(eq(bookings.userId, session.user.id))
    .orderBy(desc(bookings.rideDate));

  return NextResponse.json({ bookings: rows });
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in to book a ride." }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = bookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  }
  const { category, dateIso, timeSlot, routeId, isKid } = parsed.data;

  // Re-validate everything server-side — the client's selection is a
  // suggestion, not a source of truth.
  const validation = validateBooking({ category, dateIso, timeSlot, routeId, isKid });
  if (!validation.ok) {
    return NextResponse.json({ error: validation.message }, { status: 400 });
  }

  // Capacity check.
  const [{ value: booked }] = await db
    .select({ value: count() })
    .from(bookings)
    .where(and(eq(bookings.rideDate, dateIso), eq(bookings.timeSlot, timeSlot), eq(bookings.status, "confirmed")));

  if (Number(booked) >= RIDE_CAPACITY) {
    return NextResponse.json({ error: "That ride is fully booked. Pick another date or time." }, { status: 409 });
  }

  const price = computePrice({ category, routeId, isKid });

  const [created] = await db
    .insert(bookings)
    .values({
      id: newId(),
      userId: session.user.id,
      category,
      rideDate: dateIso,
      timeSlot,
      routeId: routeId ?? null,
      isKid: Boolean(isKid),
      price,
      status: "confirmed",
    })
    .returning();

  await sendBookingConfirmation({ user: session.user, booking: created, routeId });

  return NextResponse.json({ booking: created }, { status: 201 });
}
