import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { requirePermission } from "@/lib/rbac";
import { logAudit } from "@/lib/audit";
import { db } from "@/db/client";
import { bookings, users } from "@/db/schema";

export async function GET() {
  const guard = await requirePermission("bookings:read");
  if (guard.error) return guard.error;
  const staff = guard.staff;

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