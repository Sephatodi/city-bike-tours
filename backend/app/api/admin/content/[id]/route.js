import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { siteContent } from "@/db/schema";
import { siteContentUpdateSchema } from "@/lib/validators";
import { isAdmin } from "@/lib/admin";

const parseId = (value) => (/^\d+$/.test(value) ? Number(value) : null);

export async function PATCH(request, { params }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  const id = parseId(params.id);
  if (id === null) return NextResponse.json({ error: "Invalid id." }, { status: 400 });

  const parsed = siteContentUpdateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid content." }, { status: 400 });

  const patch = { ...parsed.data };
  if ("mediaUrl" in patch) patch.mediaUrl = patch.mediaUrl || null;
  if ("bodyText" in patch) patch.bodyText = patch.bodyText || null;

  const [updated] = await db.update(siteContent).set(patch).where(eq(siteContent.id, id)).returning();
  if (!updated) return NextResponse.json({ error: "Content not found." }, { status: 404 });
  return NextResponse.json({ content: updated });
}

export async function DELETE(_request, { params }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  const id = parseId(params.id);
  if (id === null) return NextResponse.json({ error: "Invalid id." }, { status: 400 });
  await db.delete(siteContent).where(eq(siteContent.id, id));
  return NextResponse.json({ success: true });
}
