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
  const parsed = z.object({ status: z.enum(["pending", "approved", "rejected"]).optional(), featured: z.boolean().optional() }).safeParse(await request.json().catch(() => null));
  if (!parsed.success || (parsed.data.status === undefined && parsed.data.featured === undefined)) return NextResponse.json({ error: "Choose approve, reject or pending, or set featured." }, { status: 400 });
  const set = {};
  if (parsed.data.status !== undefined) set.status = parsed.data.status;
  if (parsed.data.featured !== undefined) set.featured = parsed.data.featured;
  const [updated] = await db.update(reviews).set(set).where(eq(reviews.id, params.id)).returning();
  if (!updated) return NextResponse.json({ error: "Review not found." }, { status: 404 });
  const action = parsed.data.status === undefined ? (parsed.data.featured === true ? "Featured" : "Unfeatured") : `${updated.status === "approved" ? "Approved" : updated.status === "rejected" ? "Rejected" : "Reset"}`;
  await logAudit(guard.staff, "inbox.review", `${action} ${updated.name}'s review`, { targetType: "review", targetId: updated.id });
  return NextResponse.json({ review: updated });
}

export async function DELETE(_request, { params }) {
  const guard = await requirePermission("inbox:write");
  if (guard.error) return guard.error;
  const [removed] = await db.delete(reviews).where(eq(reviews.id, params.id)).returning();
  if (removed) await logAudit(guard.staff, "inbox.review_delete", `Deleted ${removed.name}'s review`, { targetType: "review", targetId: removed.id });
  return NextResponse.json({ success: true });
}
