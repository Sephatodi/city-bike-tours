import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { softwareUpdates } from "@/db/schema";
import { softwareUpdateSchema } from "@/lib/validators";
import { getAdminSession, requirePermission } from "@/lib/admin";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  requirePermission(session, "updates:read");

  try {
    const updates = await db.select().from(softwareUpdates).orderBy(desc(softwareUpdates.checkedAt));
    return NextResponse.json({ updates });
  } catch (error) {
    console.error("Admin updates query failed:", error);
    return NextResponse.json({ error: "Failed to load updates." }, { status: 503 });
  }
}

export async function POST(request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  requirePermission(session, "updates:update");

  const parsed = softwareUpdateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid update data." }, { status: 400 });

  try {
    const [existing] = await db.select().from(softwareUpdates).where(eq(softwareUpdates.component, parsed.data.component)).limit(1);
    if (existing) return NextResponse.json({ error: "Update for this component already exists." }, { status: 409 });

    const crypto = await import("crypto");
    const [created] = await db.insert(softwareUpdates).values({
      id: crypto.randomUUID(),
      ...parsed.data,
      checkedAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    return NextResponse.json({ update: created }, { status: 201 });
  } catch (error) {
    console.error("Admin update create failed:", error);
    return NextResponse.json({ error: "Failed to create update record." }, { status: 503 });
  }
}