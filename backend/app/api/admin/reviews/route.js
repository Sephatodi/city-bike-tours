import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { db } from "@/db/client";
import { reviews } from "@/db/schema";
import { requirePermission } from "@/lib/rbac";

export const dynamic = "force-dynamic";

export async function GET() {
  const guard = await requirePermission("inbox:read");
  if (guard.error) return guard.error;
  return NextResponse.json({ reviews: await db.select().from(reviews).orderBy(desc(reviews.createdAt)).limit(300) });
}
