import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { siteContent } from "@/db/schema";
import { siteContentUpdateSchema } from "@/lib/validators";
import { requirePermission } from "@/lib/rbac";
import { logAudit } from "@/lib/audit";

const parseId = (value) => (/^\d+$/.test(value) ? Number(value) : null);

export async function PATCH(request, { params }) {
  const guard = await requirePermission("content:write");
  if (guard.error) return guard.error;
  const staff = guard.staff;
  const id = parseId(params.id);
  if (id === null) return NextResponse.json({ error: "Invalid id." }, { status: 400 });

  const parsed = siteContentUpdateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid content." }, { status: 400 });

  const patch = { ...parsed.data };
  if ("mediaUrl" in patch) patch.mediaUrl = patch.mediaUrl || null;
  if ("bodyText" in patch) patch.bodyText = patch.bodyText || null;

  const [updated] = await db.update(siteContent).set(patch).where(eq(siteContent.id, id)).returning();
  if (!updated) return NextResponse.json({ error: "Content not found." }, { status: 404 });
  const what = "isPublished" in parsed.data ? (parsed.data.isPublished ? "Published" : "Hid") : "Edited";
  await logAudit(staff, "content.update", `${what} "${updated.title}"`, { targetType: "content", targetId: updated.id });
  return NextResponse.json({ content: updated });
}

export async function DELETE(_request, { params }) {
  const guard = await requirePermission("content:write");
  if (guard.error) return guard.error;
  const staff = guard.staff;
  const id = parseId(params.id);
  if (id === null) return NextResponse.json({ error: "Invalid id." }, { status: 400 });
  const [removed] = await db.delete(siteContent).where(eq(siteContent.id, id)).returning();
  if (removed) await logAudit(staff, "content.delete", `Deleted "${removed.title}"`, { targetType: "content", targetId: id });
  return NextResponse.json({ success: true });
}
