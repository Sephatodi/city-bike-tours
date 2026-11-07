import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { requirePermission, STAFF_ROLES } from "@/lib/rbac";
import { issueActivationCode } from "@/lib/admin-activation";
import { renderEmailTemplate } from "@/lib/email-templates";
import { sendEmail } from "@/lib/email";
import { getSettings } from "@/lib/settings";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function POST(request, { params }) {
  const guard = await requirePermission("users:write");
  if (guard.error) return guard.error;
  const [target] = await db.select({ id: users.id, email: users.email, name: users.name, role: users.role, status: users.status, provider: users.provider })
    .from(users).where(eq(users.id, params.id)).limit(1);
  if (!target) return NextResponse.json({ error: "User not found." }, { status: 404 });
  if (target.status !== "active" || !STAFF_ROLES.includes(target.role) || target.provider !== "credentials") {
    return NextResponse.json({ error: "Activation codes are for active staff accounts that sign in with email and password." }, { status: 409 });
  }
  const { code, expiresAt } = await issueActivationCode(db, { userId: target.id, email: target.email, createdBy: guard.staff.id });
  const settings = await getSettings();
  const loginUrl = new URL("/admin/login?activate=1", (process.env.FRONTEND_ORIGIN || process.env.PUBLIC_FRONTEND_URL || request.url).split(",")[0].trim() || "https://example.com").toString();
  const rendered = renderEmailTemplate("adminActivation", {
    name: target.name, code, expiresAt: expiresAt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Gaborone" }), loginUrl,
  }, settings);
  const sent = await sendEmail({ to: target.email, ...rendered, template: "adminActivation", relatedType: "user", relatedId: target.id });
  await logAudit(guard.staff, "admin.activation.issue", `Issued activation code for ${target.name} (${target.email})`, { targetType: "user", targetId: target.id });
  return NextResponse.json({ ok: true, message: sent?.ok ? "Activation code sent by email." : "Activation code created, but email delivery may be unavailable. Share the code securely.", code: sent?.ok ? null : code });
}
