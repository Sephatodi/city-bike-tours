import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import { enquiries } from "@/db/schema";
import { requirePermission } from "@/lib/rbac";
import { logAudit } from "@/lib/audit";

const schema = z.object({ status: z.enum(["new", "in_progress", "resolved"]).optional(), staffNote: z.string().trim().max(1000).optional() })
  .refine((v) => Object.keys(v).length > 0, "Nothing to update.");

export async function PATCH(request, { params }) {
  const guard = await requirePermission("inbox:write");
  if (guard.error) return guard.error;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid update." }, { status: 400 });
  const [updated] = await db.update(enquiries).set({ ...parsed.data, updatedAt: new Date() }).where(eq(enquiries.id, params.id)).returning();
  if (!updated) return NextResponse.json({ error: "Enquiry not found." }, { status: 404 });
  await logAudit(guard.staff, "inbox.update", `Marked ${updated.name}'s enquiry ${updated.status.replace("_", " ")}`, { targetType: "enquiry", targetId: updated.id });
  return NextResponse.json({ enquiry: updated });
}
