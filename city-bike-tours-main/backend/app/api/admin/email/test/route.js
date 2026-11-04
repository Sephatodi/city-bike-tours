import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/rbac";
import { logAudit } from "@/lib/audit";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/email";
import { renderEmailTemplate } from "@/lib/email-templates";

export async function POST(request) {
  const guard = await requirePermission("settings:write");
  if (guard.error) return guard.error;
  if (!rateLimit(`admin-email-test:${guard.staff.id}:${clientIp(request)}`, 3, 60 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many test emails. Try again later." }, { status: 429 });
  }
  if (!guard.staff.email || guard.staff.email.toLowerCase().endsWith(".invalid")) {
    return NextResponse.json({ error: "Your staff account needs a deliverable email address to receive the test." }, { status: 400 });
  }
  const rendered = renderEmailTemplate("welcome", {
    name: guard.staff.name,
    dashboardUrl: process.env.PUBLIC_BACKEND_URL || process.env.NEXTAUTH_URL || "",
  });
  const result = await sendEmail({
    to: guard.staff.email,
    ...rendered,
    template: "emailTest",
    relatedType: "admin_email_test",
    relatedId: guard.staff.id,
  });
  await logAudit(guard.staff, "email.test", `Sent a test email to ${guard.staff.email}`, { targetType: "email" });
  if (!result.ok) return NextResponse.json({ error: result.error || "The test email could not be sent." }, { status: 502 });
  return NextResponse.json({ ok: true });
}
