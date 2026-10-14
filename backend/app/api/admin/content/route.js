import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { db } from "@/db/client";
import { siteContent } from "@/db/schema";
import { siteContentSchema } from "@/lib/validators";
import { requirePermission } from "@/lib/rbac";
import { logAudit } from "@/lib/audit";

export async function GET() {
  const guard = await requirePermission("content:read");
  if (guard.error) return guard.error;
  const staff = guard.staff;
  const content = await db.select().from(siteContent).orderBy(desc(siteContent.createdAt));
  return NextResponse.json({ content });
}

export async function POST(request) {
  const guard = await requirePermission("content:write");
  if (guard.error) return guard.error;
  const staff = guard.staff;

  const parsed = siteContentSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid content." }, { status: 400 });

  const [created] = await db.insert(siteContent).values({
    ...parsed.data,
    mediaUrl: parsed.data.mediaUrl || null,
    bodyText: parsed.data.bodyText || null,
  }).returning();

  await logAudit(staff, "content.create", `Published ${created.contentType} "${created.title}"`, { targetType: "content", targetId: created.id });
  return NextResponse.json({ content: created }, { status: 201 });
}