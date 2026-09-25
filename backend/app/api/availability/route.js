import { NextResponse } from "next/server";
import { and, eq, count } from "drizzle-orm";
import { db } from "@/db/client";
import { bookings } from "@/db/schema";
import { RIDE_CAPACITY } from "@/lib/data";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const dateIso = searchParams.get("date");
  const timeSlot = searchParams.get("timeSlot");

  if (!dateIso || !/^\d{4}-\d{2}-\d{2}$/.test(dateIso)) {
    return NextResponse.json({ error: "Provide a valid ?date=YYYY-MM-DD." }, { status: 400 });
  }
  if (!["morning", "evening"].includes(timeSlot)) {
    return NextResponse.json({ error: "Provide ?timeSlot=morning|evening." }, { status: 400 });
  }

  const [{ value: booked }] = await db
    .select({ value: count() })
    .from(bookings)
    .where(and(eq(bookings.rideDate, dateIso), eq(bookings.timeSlot, timeSlot), eq(bookings.status, "confirmed")));

  const remaining = Math.max(0, RIDE_CAPACITY - Number(booked));

  return NextResponse.json({
    date: dateIso,
    timeSlot,
    capacity: RIDE_CAPACITY,
    booked: Number(booked),
    remaining,
    full: remaining === 0,
  });
}
