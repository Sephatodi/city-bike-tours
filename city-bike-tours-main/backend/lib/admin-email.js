import { and, count, eq, gt } from "drizzle-orm";
import { db } from "@/db/client";
import { emailLogs } from "@/db/schema";
import { sendEmail } from "@/lib/email";
import { renderEmailTemplate } from "@/lib/email-templates";
import { getSettings } from "@/lib/settings";

export async function notifyAdmins(template, data, { relatedType, relatedId } = {}) {
  try {
    const settings = await getSettings();
    const configured = process.env.ADMIN_NOTIFY_EMAILS || settings.notifyEmails || "";
    const recipients = [...new Set(configured.split(",").map((address) => address.trim().toLowerCase()).filter(Boolean))];
    if (!recipients.length) return { sent: 0, skipped: true };

    const [recent] = await db.select({ total: count() }).from(emailLogs).where(and(
      eq(emailLogs.template, template),
      gt(emailLogs.createdAt, new Date(Date.now() - 60 * 60 * 1000)),
    ));
    if (Number(recent?.total || 0) >= 20) {
      console.warn(`Admin email alert throttled for ${template}.`);
      return { sent: 0, throttled: true };
    }

    const rendered = renderEmailTemplate(template, {
      ...data,
      adminUrl: process.env.PUBLIC_BACKEND_URL || process.env.NEXTAUTH_URL || "",
    }, settings);
    const results = [];
    for (const to of recipients) {
      results.push(await sendEmail({
        to,
        ...rendered,
        template,
        relatedType: relatedType || "admin_alert",
        relatedId,
      }));
    }
    return { sent: results.filter((result) => result.ok).length };
  } catch (error) {
    console.error("Could not send admin email alert:", error instanceof Error ? error.message : "unknown error");
    return { sent: 0, error: true };
  }
}
