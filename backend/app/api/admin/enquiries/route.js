import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { db } from "@/db/client";
import { enquiries } from "@/db/schema";
import { requirePermission } from "@/lib/rbac";

export const dynamic = "force-dynamic";

export async function GET() {
  const guard = await requirePermission("inbox:read");
  if (guard.error) return guard.error;
  return NextResponse.json({ enquiries: await db.select().from(enquiries).orderBy(desc(enquiries.createdAt)).limit(300) });
}
