import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { and, eq } from "drizzle-orm";
import { authOptions } from "@/lib/auth";
import { db } from "@/db/client";
import { bookings } from "@/db/schema";

export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in to manage bookings." }, { status: 401 });
  }

  const { id } = params;

  const [existing] = await db.select().from(bookings).where(eq(bookings.id, id));
  if (!existing) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }
  if (existing.userId !== session.user.id) {
    return NextResponse.json({ error: "You can only cancel your own bookings." }, { status: 403 });
  }

  const [updated] = await db
    .update(bookings)
    .set({ status: "cancelled" })
    .where(and(eq(bookings.id, id), eq(bookings.userId, session.user.id)))
    .returning();

  return NextResponse.json({ booking: updated });
}
