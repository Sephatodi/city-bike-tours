import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import { reviews } from "@/db/schema";
import { requirePermission } from "@/lib/rbac";
import { logAudit } from "@/lib/audit";

export async function PATCH(request, { params }) {
  const guard = await requirePermission("inbox:write");
  if (guard.error) return guard.error;
  const parsed = z.object({ status: z.enum(["pending", "approved", "rejected"]) }).safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Choose approve, reject or pending." }, { status: 400 });
  const [updated] = await db.update(reviews).set({ status: parsed.data.status }).where(eq(reviews.id, params.id)).returning();
  if (!updated) return NextResponse.json({ error: "Review not found." }, { status: 404 });
  await logAudit(guard.staff, "inbox.review", `${updated.status === "approved" ? "Approved" : updated.status === "rejected" ? "Rejected" : "Reset"} ${updated.name}'s review`, { targetType: "review", targetId: updated.id });
  return NextResponse.json({ review: updated });
}

export async function DELETE(_request, { params }) {
  const guard = await requirePermission("inbox:write");
  if (guard.error) return guard.error;
  const [removed] = await db.delete(reviews).where(eq(reviews.id, params.id)).returning();
  if (removed) await logAudit(guard.staff, "inbox.review_delete", `Deleted ${removed.name}'s review`, { targetType: "review", targetId: removed.id });
  return NextResponse.json({ success: true });
}
