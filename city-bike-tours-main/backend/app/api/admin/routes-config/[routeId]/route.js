import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { companyRoutesConfig } from "@/db/schema";
import { routeConfigSchema } from "@/lib/validators";
import { requirePermission } from "@/lib/rbac";
import { logAudit } from "@/lib/audit";

export async function PUT(request, { params }) {
  const guard = await requirePermission("routes:write");
  if (guard.error) return guard.error;
  const staff = guard.staff;

  const parsed = routeConfigSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid route settings." }, { status: 400 });

  const [updated] = await db.update(companyRoutesConfig)
    .set(parsed.data)
    .where(eq(companyRoutesConfig.routeId, params.routeId))
    .returning();

  if (!updated) return NextResponse.json({ error: "Route configuration not found." }, { status: 404 });
  await logAudit(staff, "route.update", `Updated ${updated.routeName}: P${updated.priceBwp}, ${updated.scheduleSlots}`, { targetType: "route", targetId: updated.routeId });
  return NextResponse.json({ route: updated });
}