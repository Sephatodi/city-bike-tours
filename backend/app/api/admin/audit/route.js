import { NextResponse } from "next/server";
import { and, desc, like, lt } from "drizzle-orm";
import { db } from "@/db/client";
import { auditLogs } from "@/db/schema";
import { requirePermission } from "@/lib/rbac";

export const dynamic = "force-dynamic";

// GET /api/admin/audit?area=booking|user|content|route|settings|checkin|message&limit=50&before=<id>
export async function GET(request) {
  const guard = await requirePermission("audit:read");
  if (guard.error) return guard.error;

  const { searchParams } = new URL(request.url);
  const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "50", 10) || 50, 1), 200);
  const area = searchParams.get("area");
  const before = parseInt(searchParams.get("before") || "", 10);

  const conditions = [];
  if (area && /^[a-z_]+$/.test(area)) conditions.push(like(auditLogs.action, `${area}%`));
  if (Number.isFinite(before)) conditions.push(lt(auditLogs.id, before));

  const rows = await db.select().from(auditLogs)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(auditLogs.id))
    .limit(limit + 1);

  return NextResponse.json({ logs: rows.slice(0, limit), hasMore: rows.length > limit });
}
