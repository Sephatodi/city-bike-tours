import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import { seoPages } from "@/db/schema";
import { requirePermission } from "@/lib/rbac";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

const schema = z.object({
  path: z.string().trim().max(200).regex(/^\/[a-zA-Z0-9\-_/]*$/, "A page address starts with / and has no spaces, like /schedule."),
  title: z.string().trim().max(70).optional().or(z.literal("")),
  description: z.string().trim().max(170).optional().or(z.literal("")),
  keywords: z.string().trim().max(250).optional().or(z.literal("")),
  noindex: z.boolean().optional(),
});

export async function GET() {
  const guard = await requirePermission("seo:read");
  if (guard.error) return guard.error;
  return NextResponse.json({ pages: await db.select().from(seoPages).orderBy(seoPages.path) });
}

export async function PUT(request) {
  const guard = await requirePermission("seo:write");
  if (guard.error) return guard.error;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid page settings." }, { status: 400 });
  const values = { path: parsed.data.path, title: parsed.data.title || null, description: parsed.data.description || null, keywords: parsed.data.keywords || null, noindex: !!parsed.data.noindex, updatedAt: new Date() };
  await db.insert(seoPages).values(values).onConflictDoUpdate({ target: seoPages.path, set: values });
  await logAudit(guard.staff, "seo.update", `Updated search settings for ${values.path}`, { targetType: "seo", targetId: values.path });
  return NextResponse.json({ success: true });
}

export async function DELETE(request) {
  const guard = await requirePermission("seo:write");
  if (guard.error) return guard.error;
  const path = new URL(request.url).searchParams.get("path");
  if (!path) return NextResponse.json({ error: "Missing page." }, { status: 400 });
  await db.delete(seoPages).where(eq(seoPages.path, path));
  await logAudit(guard.staff, "seo.delete", `Removed search settings for ${path}`, { targetType: "seo", targetId: path });
  return NextResponse.json({ success: true });
}
