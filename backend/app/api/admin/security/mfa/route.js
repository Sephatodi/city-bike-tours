import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { requirePermission } from "@/lib/rbac";
import { logAudit } from "@/lib/audit";
import { getSettings } from "@/lib/settings";
import { newTotpSecret, openSecret, otpauthUri, sealSecret, verifyTotp } from "@/lib/security";

export const dynamic = "force-dynamic";

// Two-step sign-in for the signed-in staff member's own account.
export async function GET() {
  const guard = await requirePermission(null, { allowWithoutMfa: true });
  if (guard.error) return guard.error;
  const settings = await getSettings();
  return NextResponse.json({ enabled: guard.staff.mfaEnabled, required: settings.requireMfa === "true" });
}

export async function POST(request) {
  const guard = await requirePermission(null, { allowWithoutMfa: true });
  if (guard.error) return guard.error;
  const staff = guard.staff;
  const body = await request.json().catch(() => ({}));

  if (body.action === "start") {
    if (staff.mfaEnabled) return NextResponse.json({ error: "Two-step sign-in is already on." }, { status: 409 });
    const secret = newTotpSecret();
    await db.update(users).set({ mfaSecret: sealSecret(secret), mfaEnabled: false }).where(eq(users.id, staff.id));
    const uri = otpauthUri(staff.email, secret);
    return NextResponse.json({ secret, qr: await QRCode.toDataURL(uri, { margin: 1, width: 220 }) });
  }

  const [row] = await db.select({ secret: users.mfaSecret }).from(users).where(eq(users.id, staff.id));
  const secret = row?.secret ? openSecret(row.secret) : null;

  if (body.action === "confirm") {
    if (!secret) return NextResponse.json({ error: "Start setup first." }, { status: 409 });
    if (!verifyTotp(secret, body.code)) return NextResponse.json({ error: "That code didn't match. Wait for a new one and try again." }, { status: 400 });
    await db.update(users).set({ mfaEnabled: true }).where(eq(users.id, staff.id));
    await logAudit(staff, "security.mfa_on", `${staff.name} turned on two-step sign-in`, { targetType: "user", targetId: staff.id });
    return NextResponse.json({ enabled: true });
  }

  if (body.action === "disable") {
    if ((await getSettings()).requireMfa === "true") return NextResponse.json({ error: "Two-step sign-in is required for all staff, so it can't be turned off." }, { status: 409 });
    if (!staff.mfaEnabled || !secret || !verifyTotp(secret, body.code)) return NextResponse.json({ error: "Enter a current code from your authenticator app to turn this off." }, { status: 400 });
    await db.update(users).set({ mfaEnabled: false, mfaSecret: null }).where(eq(users.id, staff.id));
    await logAudit(staff, "security.mfa_off", `${staff.name} turned off two-step sign-in`, { targetType: "user", targetId: staff.id });
    return NextResponse.json({ enabled: false });
  }

  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}
