import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { bookings } from "@/db/schema";
import { bookingStatusSchema } from "@/lib/validators";
import { isAdmin } from "@/lib/admin";

export async function PATCH(request, { params }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Admin access required." }, { status: 403 });

  const parsed = bookingStatusSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid booking status." }, { status: 400 });

  const [updated] = await db.update(bookings)
    .set({ status: parsed.data.status })
    .where(eq(bookings.id, params.id))
    .returning({ id: bookings.id, status: bookings.status });

  if (!updated) return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  return NextResponse.json({ booking: updated });
}