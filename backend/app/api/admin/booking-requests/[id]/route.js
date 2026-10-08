import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { bookingRequests } from "@/db/schema";
import { bookingRequestStatusSchema } from "@/lib/validators";
import { isAdmin } from "@/lib/admin";

export async function PATCH(request, { params }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Admin access required." }, { status: 403 });

  const parsed = bookingRequestStatusSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid booking request status." }, { status: 400 });

  const [updated] = await db.update(bookingRequests)
    .set({ status: parsed.data.status })
    .where(eq(bookingRequests.id, params.id))
    .returning({ id: bookingRequests.id, status: bookingRequests.status });

  if (!updated) return NextResponse.json({ error: "Booking request not found." }, { status: 404 });
  return NextResponse.json({ request: updated });
}