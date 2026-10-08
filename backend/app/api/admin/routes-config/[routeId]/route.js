import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { companyRoutesConfig } from "@/db/schema";
import { routeConfigSchema } from "@/lib/validators";
import { isAdmin } from "@/lib/admin";

export async function PUT(request, { params }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Admin access required." }, { status: 403 });

  const parsed = routeConfigSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid route settings." }, { status: 400 });

  const [updated] = await db.update(companyRoutesConfig)
    .set(parsed.data)
    .where(eq(companyRoutesConfig.routeId, params.routeId))
    .returning();

  if (!updated) return NextResponse.json({ error: "Route configuration not found." }, { status: 404 });
  return NextResponse.json({ route: updated });
}