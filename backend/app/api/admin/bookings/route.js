import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { asc, eq } from "drizzle-orm";
import { authOptions } from "@/lib/auth";
import { db } from "@/db/client";
import { bookings, users } from "@/db/schema";

async function isAdmin() {
  const session = await getServerSession(authOptions);
  return Boolean(session?.user?.email && process.env.ADMIN_EMAIL && session.user.email === process.env.ADMIN_EMAIL);
}

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