import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import { blockedIps } from "@/db/schema";
import { requirePermission } from "@/lib/rbac";
import { logAudit } from "@/lib/audit";
import { ipFromHeaders } from "@/lib/security";

const ipSchema = z.object({
  ip: z.string().trim().max(45).regex(/^(\d{1,3}(\.\d{1,3}){3}|[0-9a-fA-F:]{3,45})$/, "Enter an IP address like 203.0.113.7."),
  reason: z.string().trim().max(200).optional(),
});

export async function POST(request) {
  const guard = await requirePermission("security:write");
  if (guard.error) return guard.error;
  const parsed = ipSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid address." }, { status: 400 });
  if (parsed.data.ip === ipFromHeaders(headers())) return NextResponse.json({ error: "That's your own address. Blocking it would lock you out." }, { status: 409 });

  await db.insert(blockedIps).values({ ip: parsed.data.ip, reason: parsed.data.reason || null, createdBy: guard.staff.id }).onConflictDoNothing();
  await logAudit(guard.staff, "security.block_ip", `Blocked ${parsed.data.ip}${parsed.data.reason ? ` (${parsed.data.reason})` : ""}`, { targetType: "ip", targetId: parsed.data.ip });
  return NextResponse.json({ success: true }, { status: 201 });
}

export async function DELETE(request) {
  const guard = await requirePermission("security:write");
  if (guard.error) return guard.error;
  const ip = new URL(request.url).searchParams.get("ip");
  if (!ip) return NextResponse.json({ error: "Missing address." }, { status: 400 });
  await db.delete(blockedIps).where(eq(blockedIps.ip, ip));
  await logAudit(guard.staff, "security.unblock_ip", `Unblocked ${ip}`, { targetType: "ip", targetId: ip });
  return NextResponse.json({ success: true });
}
