import { NextResponse } from "next/server";
import { getDailyRiderCount } from "@/lib/capacity";
import { getDailyCapacity } from "@/lib/settings";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const dateIso = searchParams.get("date");
  const timeSlot = searchParams.get("timeSlot");

  const date = dateIso && new Date(`${dateIso}T00:00:00.000Z`);
  if (!dateIso || !/^\d{4}-\d{2}-\d{2}$/.test(dateIso) || Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== dateIso) {
    return NextResponse.json({ error: "Provide a valid ?date=YYYY-MM-DD." }, { status: 400 });
  }
  if (timeSlot && !["morning", "evening"].includes(timeSlot)) {
    return NextResponse.json({ error: "Use ?timeSlot=morning|evening when specifying a time." }, { status: 400 });
  }

  const booked = await getDailyRiderCount(dateIso);

  const capacity = await getDailyCapacity();
  const remaining = Math.max(0, capacity - booked);

  return NextResponse.json({
    date: dateIso,
    timeSlot,
    capacity,
    booked,
    remaining,
    full: remaining === 0,
  }, { headers: { "Cache-Control": "no-store" } });
}
