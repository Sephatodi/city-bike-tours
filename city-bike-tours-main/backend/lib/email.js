import { db } from "@/db/client";
import { emailLogs } from "@/db/schema";
import { getSettings } from "@/lib/settings";
import { deliverEmail } from "@/lib/email-delivery";

const LEGACY_SMTP_CONFIGURED = Boolean(process.env.BOOKING_CONFIRMATION_SMTP_PASS);
const emailProvider = () => process.env.EMAIL_PROVIDER || (LEGACY_SMTP_CONFIGURED ? "smtp" : "");

if (process.env.NODE_ENV === "production" && !emailProvider()) {
  console.warn("Transactional email is disabled: configure EMAIL_PROVIDER and EMAIL_FROM.");
}

function smtpConfig() {
  const host = process.env.SMTP_HOST || process.env.BOOKING_CONFIRMATION_SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || process.env.BOOKING_CONFIRMATION_SMTP_PORT || 587);
  const secure = String(process.env.SMTP_SECURE ?? process.env.BOOKING_CONFIRMATION_SMTP_SECURE ?? (port === 465))
    .toLowerCase() === "true";
  const user = process.env.SMTP_USER || process.env.BOOKING_CONFIRMATION_SMTP_USER;
  const pass = process.env.SMTP_PASS || process.env.BOOKING_CONFIRMATION_SMTP_PASS;
  return { host, port, secure, user, pass };
}

function emailConfig() {
  const provider = emailProvider();
  const legacyFrom = process.env.BOOKING_CONFIRMATION_EMAIL || process.env.BOOKING_CONFIRMATION_FROM;
  return {
    provider,
    from: process.env.EMAIL_FROM || legacyFrom || "",
    resendKey: process.env.RESEND_API_KEY || "",
    smtp: smtpConfig(),
  };
}

export function emailConfigured() {
  const { provider, from, resendKey, smtp } = emailConfig();
  if (!provider && process.env.NODE_ENV !== "production") return true;
  if (!from) return false;
  if (provider === "resend") return Boolean(resendKey);
  if (provider === "smtp") return Boolean(smtp.host && smtp.port > 0 && smtp.user && smtp.pass);
  return false;
}

function safeError(error, config) {
  let message = error instanceof Error ? error.message : String(error || "Email delivery failed.");
  for (const secret of [config.resendKey, config.smtp.pass, config.smtp.user]) {
    if (secret) message = message.split(secret).join("[redacted]");
  }
  return message.replace(/(?:Bearer\s+)[^\s]+/gi, "Bearer [redacted]").slice(0, 1000);
}

async function recordAttempt({ to, subject, template, status, error, relatedType, relatedId }) {
  try {
    await db.insert(emailLogs).values({
      toAddress: to,
      subject,
      template: template || null,
      status,
      error: error || null,
      relatedType: relatedType || null,
      relatedId: relatedId || null,
    });
  } catch (logError) {
    console.error("Could not record email attempt:", logError instanceof Error ? logError.message : "unknown error");
  }
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
  replyTo,
  template,
  relatedType,
  relatedId,
}) {
  const recipient = typeof to === "string" ? to.trim() : "";
  const config = emailConfig();
  const settings = await getSettings();
  const effectiveReplyTo = replyTo || settings.contactEmail || undefined;
  let status = "failed";
  let error = null;

  if (!recipient || recipient.toLowerCase().endsWith(".invalid")) {
    status = "skipped";
    error = !recipient ? "Recipient address is empty." : "Recipient address is not deliverable.";
  } else {
    try {
      if (!config.provider) {
        if (process.env.NODE_ENV === "production") {
          status = "skipped";
          error = "Transactional email is not configured.";
        } else {
          console.info("Development email preview:", {
            to: recipient,
            subject,
            text: String(text || "").replace(/([?&]token=)[^&\s]+/gi, "$1[redacted]"),
          });
          status = "skipped";
          error = "Previewed in development; no provider was configured.";
        }
      } else {
        const result = await deliverEmail(config, {
          to: recipient,
          subject,
          html,
          text,
          replyTo: effectiveReplyTo,
        });
        status = result.status;
        if (result.error) {
          error = safeError(result.error, config);
          if (status === "failed") console.error("Transactional email failed:", error);
        }
      }
    } catch (cause) {
      error = safeError(cause, config);
      console.error("Transactional email failed:", error);
    }
  }

  await recordAttempt({ to: recipient || "(blank)", subject: subject || "", template, status, error, relatedType, relatedId });
  return { ok: status === "sent", error };
}

export async function sendBookingConfirmationEmail(options) {
  const { renderEmailTemplate } = await import("@/lib/email-templates");
  const settings = await getSettings();
  const rendered = renderEmailTemplate("bookingConfirmed", {
    ...options,
    meetingPoint: settings.meetupName,
    arriveEarlyNote: settings.arriveEarlyNote,
  }, settings);
  const result = await sendEmail({
    to: options.to,
    ...rendered,
    template: "bookingConfirmed",
    relatedType: "booking",
    relatedId: options.relatedId,
  });
  return result.ok ? { status: "sent", provider: emailConfig().provider || "development" } : { status: "failed" };
}
