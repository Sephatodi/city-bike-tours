import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { isAdmin } from "@/lib/admin";
import { db } from "@/db/client";
import { bookings, users } from "@/db/schema";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Admin access required." }, { status: 403 });

  const rows = await db
    .select({
      id: bookings.id,
      name: users.name,
      email: users.email,
      phone: users.phone,
      category: bookings.category,
      rideDate: bookings.rideDate,
      timeSlot: bookings.timeSlot,
      routeId: bookings.routeId,
      riders: bookings.isKid,
      price: bookings.price,
      status: bookings.status,
    })
    .from(bookings)
    .innerJoin(users, eq(bookings.userId, users.id))
    .where(eq(bookings.status, "confirmed"))
    .orderBy(asc(bookings.rideDate), asc(bookings.timeSlot));

  return NextResponse.json({ bookings: rows });
}