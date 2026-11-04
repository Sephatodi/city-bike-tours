import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { db } from "@/db/client";
import { emailLogs } from "@/db/schema";
import { emailConfigured } from "@/lib/email";
import { requirePermission } from "@/lib/rbac";

export async function GET() {
  const guard = await requirePermission("settings:read");
  if (guard.error) return guard.error;
  const rows = await db.select({
    id: emailLogs.id,
    toAddress: emailLogs.toAddress,
    subject: emailLogs.subject,
    template: emailLogs.template,
    status: emailLogs.status,
    error: emailLogs.error,
    createdAt: emailLogs.createdAt,
  }).from(emailLogs).orderBy(desc(emailLogs.createdAt)).limit(100);
  const provider = process.env.EMAIL_PROVIDER || (process.env.BOOKING_CONFIRMATION_SMTP_PASS ? "smtp" : "");
  const config = {
    provider: provider || (process.env.NODE_ENV === "production" ? "none" : "development preview"),
    configured: emailConfigured(),
    fromConfigured: Boolean(process.env.EMAIL_FROM || process.env.BOOKING_CONFIRMATION_EMAIL || process.env.BOOKING_CONFIRMATION_FROM),
    credentialsConfigured: provider === "resend"
      ? Boolean(process.env.RESEND_API_KEY)
      : provider === "smtp"
        ? Boolean(
          (process.env.SMTP_HOST || process.env.BOOKING_CONFIRMATION_SMTP_HOST)
          && (process.env.SMTP_USER || process.env.BOOKING_CONFIRMATION_SMTP_USER)
          && (process.env.SMTP_PASS || process.env.BOOKING_CONFIRMATION_SMTP_PASS)
        )
        : false,
  };
  return NextResponse.json({ config, logs: rows });
}
