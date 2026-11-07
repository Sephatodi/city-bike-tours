import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { STAFF_ROLES } from "@/lib/rbac";
import { issueActivationCode } from "@/lib/admin-activation";
import { renderEmailTemplate } from "@/lib/email-templates";
import { sendEmail } from "@/lib/email";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";
const schema = z.object({ email: z.string().trim().email().max(120) });
const ok = () => NextResponse.json({ ok: true, message: "If that staff account can be activated, we sent an activation code to its email." });

export async function POST(request) {
  const ip = clientIp(request);
  if (!rateLimit(`admin-activate-ip:${ip}`, 10, 60 * 60 * 1000)) return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return ok();
  const email = parsed.data.email.toLowerCase();
  if (!rateLimit(`admin-activate-email:${email}`, 5, 60 * 60 * 1000)) return ok();
  try {
    const [user] = await db.select({ id: users.id, email: users.email, name: users.name, role: users.role, status: users.status, provider: users.provider })
      .from(users).where(eq(users.email, email)).limit(1);
    if (!user || user.status !== "active" || !STAFF_ROLES.includes(user.role) || user.provider !== "credentials") return ok();
    const { code, expiresAt } = await issueActivationCode(db, { userId: user.id, email: user.email });
    const settings = await getSettings();
    const base = (process.env.FRONTEND_ORIGIN || process.env.PUBLIC_FRONTEND_URL || request.url).split(",")[0].trim() || "https://example.com";
    const loginUrl = new URL("/admin/login?activate=1", base).toString();
    const rendered = renderEmailTemplate("adminActivation", {
      name: user.name, code, expiresAt: expiresAt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Gaborone" }), loginUrl,
    }, settings);
    await sendEmail({ to: user.email, ...rendered, template: "adminActivation", relatedType: "user", relatedId: user.id });
  } catch (error) {
    console.error("Admin activation request failed:", error?.message);
  }
  return ok();
}
