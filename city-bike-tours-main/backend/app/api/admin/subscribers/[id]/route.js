import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import { subscribers } from "@/db/schema";
import { requirePermission } from "@/lib/rbac";
import { logAudit } from "@/lib/audit";

export async function PATCH(request, { params }) {
  const guard = await requirePermission("inbox:write");
  if (guard.error) return guard.error;
  const parsed = z.object({ status: z.enum(["subscribed", "unsubscribed"]) }).safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  const [updated] = await db.update(subscribers).set({ status: parsed.data.status }).where(eq(subscribers.id, params.id)).returning();
  if (!updated) return NextResponse.json({ error: "Subscriber not found." }, { status: 404 });
  await logAudit(guard.staff, "inbox.subscriber", `Marked ${updated.email || updated.phone} as ${updated.status}`, { targetType: "subscriber", targetId: updated.id });
  return NextResponse.json({ subscriber: updated });
}

export async function DELETE(_request, { params }) {
  const guard = await requirePermission("inbox:write");
  if (guard.error) return guard.error;
  const [removed] = await db.delete(subscribers).where(eq(subscribers.id, params.id)).returning();
  if (removed) await logAudit(guard.staff, "inbox.subscriber_delete", `Removed ${removed.email || removed.phone} from the list`, { targetType: "subscriber", targetId: removed.id });
  return NextResponse.json({ success: true });
}
