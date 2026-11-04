import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import { bookingRequests } from "@/db/schema";
import { requirePermission } from "@/lib/rbac";
import { logAudit } from "@/lib/audit";
import { getPaymentProvider } from "@/lib/payments";

const schema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("record"),
    method: z.enum(["cash", "card", "eft", "mobile_money", "other"]),
    amount: z.coerce.number().positive().max(1000000).optional(),
    reference: z.string().trim().max(160).optional().default(""),
  }),
  z.object({ action: z.literal("refund") }),
  z.object({ action: z.literal("waive") }),
]);

export async function POST(request, { params }) {
  const guard = await requirePermission("bookings:write");
  if (guard.error) return guard.error;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid payment action." }, { status: 400 });
  const [booking] = await db.select().from(bookingRequests).where(eq(bookingRequests.id, params.id));
  if (!booking) return NextResponse.json({ error: "Booking request not found." }, { status: 404 });

  const { action } = parsed.data;
  let updates;
  if (action === "record") {
    const amount = parsed.data.amount ?? Number(booking.priceTotal || 0);
    const recorded = await getPaymentProvider().record({
      method: parsed.data.method,
      amount,
      reference: parsed.data.reference,
    });
    updates = {
      paymentStatus: "paid",
      paymentMethod: recorded.method,
      paymentAmount: recorded.amount.toFixed(2),
      paymentReference: recorded.reference,
      paidAt: new Date(),
    };
  } else if (action === "refund") {
    if (booking.paymentStatus !== "paid") return NextResponse.json({ error: "Only paid bookings can be marked refunded." }, { status: 409 });
    updates = { paymentStatus: "refunded" };
  } else {
    updates = { paymentStatus: "waived", paymentMethod: null, paymentAmount: null, paymentReference: null, paidAt: null };
  }
  const [updated] = await db.update(bookingRequests).set(updates).where(eq(bookingRequests.id, booking.id)).returning();
  await logAudit(guard.staff, `booking.payment_${action}`, `${action === "record" ? "Recorded" : action === "refund" ? "Marked refunded" : "Waived"} payment for ${booking.name}'s booking`, {
    targetType: "booking_request",
    targetId: booking.id,
    detail: { paymentStatus: updated.paymentStatus, paymentMethod: updated.paymentMethod, paymentAmount: updated.paymentAmount },
  });
  return NextResponse.json({ booking: updated });
}
