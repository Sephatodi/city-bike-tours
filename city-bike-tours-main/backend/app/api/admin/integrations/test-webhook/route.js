import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/rbac";
import { fireWebhook } from "@/lib/webhook";
import { getSettings } from "@/lib/settings";

export async function POST() {
  const guard = await requirePermission("settings:write");
  if (guard.error) return guard.error;
  if (!(await getSettings()).webhookUrl) return NextResponse.json({ error: "Save a webhook address first." }, { status: 409 });
  const ok = await fireWebhook("test", { message: "Hello from the City Bike Tours dashboard." });
  return NextResponse.json({ ok });
}
