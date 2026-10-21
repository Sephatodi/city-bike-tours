import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db/client";
import { siteSettings } from "@/db/schema";
import { requirePermission } from "@/lib/rbac";
import { logAudit } from "@/lib/audit";
import { SETTING_DEFS, getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function GET() {
  const guard = await requirePermission("settings:read");
  if (guard.error) return guard.error;
  return NextResponse.json({ settings: await getSettings() });
}

const rules = {
  contactEmail: z.string().email("Enter a valid contact email.").or(z.literal("")),
  logoUrl: z.string().url("Logo must be a full https:// link.").or(z.literal("")),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Accent colour must look like #a24bff."),
  dailyCapacity: z.string().regex(/^\d{1,3}$/, "Daily capacity must be a whole number.").refine((v) => Number(v) >= 1, "Daily capacity must be at least 1."),
  bookingsOpen: z.enum(["true", "false"]),
  siteName: z.string().min(1, "Site name can't be empty."),
  siteUrl: z.string().url("Site address must start with https://").or(z.literal("")),
  noindexSite: z.enum(["true", "false"]),
  requireMfa: z.enum(["true", "false"]),
  gaId: z.string().regex(/^G-[A-Z0-9]{4,14}$/, "Google Analytics ID looks like G-XXXXXXXXXX.").or(z.literal("")),
  gtmId: z.string().regex(/^GTM-[A-Z0-9]{4,10}$/, "Tag Manager ID looks like GTM-XXXXXXX.").or(z.literal("")),
  metaPixelId: z.string().regex(/^\d{6,20}$/, "Meta Pixel ID is a number.").or(z.literal("")),
  webhookUrl: z.string().url("Webhook address must be a full https:// link.").refine((v) => v.startsWith("https://"), "Webhook address must use https.").or(z.literal("")),
  sessionMinutes: z.string().regex(/^\d{1,5}$/, "Session length must be a number of minutes.").refine((v) => Number(v) >= 5 && Number(v) <= 10080, "Session length must be between 5 minutes and 7 days."),
  maxFailedLogins: z.string().regex(/^\d{1,2}$/, "Use a whole number.").refine((v) => Number(v) >= 3 && Number(v) <= 20, "Allow between 3 and 20 failed sign-ins."),
};

export async function PUT(request) {
  const guard = await requirePermission("settings:write");
  if (guard.error) return guard.error;

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Invalid settings." }, { status: 400 });

  const entries = [];
  for (const [key, raw] of Object.entries(body)) {
    const def = SETTING_DEFS[key];
    if (!def) return NextResponse.json({ error: `Unknown setting: ${key}.` }, { status: 400 });
    const value = String(raw ?? "").trim();
    if (value.length > def.max) return NextResponse.json({ error: `${key} must be ${def.max} characters or fewer.` }, { status: 400 });
    const rule = rules[key];
    if (rule) {
      const check = rule.safeParse(value);
      if (!check.success) return NextResponse.json({ error: check.error.issues[0].message }, { status: 400 });
    }
    entries.push([key, value]);
  }
  if (!entries.length) return NextResponse.json({ error: "Nothing to update." }, { status: 400 });

  const before = await getSettings();
  const changed = entries.filter(([key, value]) => before[key] !== value).map(([key]) => key);
  for (const [key, value] of entries) {
    await db.insert(siteSettings)
      .values({ key, value, updatedBy: guard.staff.id })
      .onConflictDoUpdate({ target: siteSettings.key, set: { value, updatedBy: guard.staff.id, updatedAt: new Date() } });
  }
  if (changed.length) await logAudit(guard.staff, "settings.update", `Changed site settings: ${changed.join(", ")}`, { targetType: "settings" });
  return NextResponse.json({ settings: await getSettings() });
}
