import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { integrations } from "@/db/schema";
import { integrationSchema } from "@/lib/validators";
import { getAdminSession, requirePermission } from "@/lib/admin";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  requirePermission(session, "integrations:read");

  try {
    const allIntegrations = await db.select().from(integrations).orderBy(desc(integrations.createdAt));
    return NextResponse.json({ integrations: allIntegrations });
  } catch (error) {
    console.error("Admin integrations query failed:", error);
    return NextResponse.json({ error: "Failed to load integrations." }, { status: 503 });
  }
}

export async function POST(request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  requirePermission(session, "integrations:update");

  const parsed = integrationSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid integration data." }, { status: 400 });

  try {
    const [existing] = await db.select().from(integrations).where(eq(integrations.id, parsed.data.id)).limit(1);
    if (existing) return NextResponse.json({ error: "Integration ID already exists." }, { status: 409 });

    const [created] = await db.insert(integrations).values({
      ...parsed.data,
      updatedAt: new Date(),
    }).returning();

    return NextResponse.json({ integration: created }, { status: 201 });
  } catch (error) {
    console.error("Admin integration create failed:", error);
    return NextResponse.json({ error: "Failed to create integration." }, { status: 503 });
  }
}