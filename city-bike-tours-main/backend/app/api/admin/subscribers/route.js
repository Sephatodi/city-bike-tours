import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { db } from "@/db/client";
import { subscribers } from "@/db/schema";
import { requirePermission } from "@/lib/rbac";

export const dynamic = "force-dynamic";

export async function GET() {
  const guard = await requirePermission("inbox:read");
  if (guard.error) return guard.error;
  return NextResponse.json({ subscribers: await db.select().from(subscribers).orderBy(desc(subscribers.createdAt)).limit(1000) });
}
