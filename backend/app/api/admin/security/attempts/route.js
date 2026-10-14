import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { db } from "@/db/client";
import { blockedIps } from "@/db/schema";
import { requirePermission } from "@/lib/rbac";
import { listAttempts } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function GET() {
  const guard = await requirePermission("security:read");
  if (guard.error) return guard.error;
  const [attempts, blocked] = await Promise.all([listAttempts(150), db.select().from(blockedIps).orderBy(desc(blockedIps.createdAt))]);
  const dayAgo = Date.now() - 24 * 3600 * 1000;
  const recent = attempts.filter((a) => new Date(a.createdAt).getTime() > dayAgo);
  return NextResponse.json({
    attempts,
    blocked,
    summary: { failed24h: recent.filter((a) => !a.success).length, success24h: recent.filter((a) => a.success).length },
  });
}
