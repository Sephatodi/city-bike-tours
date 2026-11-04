import nodemailer from "nodemailer";

export async function deliverEmail(config, message, {
  fetchImpl = fetch,
  createTransporter = (options) => nodemailer.createTransport(options),
} = {}) {
  const to = typeof message.to === "string" ? message.to.trim() : "";
  if (!to || to.toLowerCase().endsWith(".invalid")) {
    return { status: "skipped", error: to ? "Recipient address is not deliverable." : "Recipient address is empty." };
  }
  if (!config.from) return { status: "failed", error: "EMAIL_FROM is required." };

  try {
    if (config.provider === "resend") {
      if (!config.resendKey) return { status: "failed", error: "RESEND_API_KEY is required for Resend." };
      const response = await fetchImpl("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: config.from,
          to: [to],
          subject: message.subject,
          html: message.html,
          text: message.text,
          ...(message.replyTo ? { reply_to: message.replyTo } : {}),
        }),
      });
      if (!response.ok) {
        const detail = await response.text().catch(() => "");
        return { status: "failed", error: `Resend returned ${response.status}${detail ? `: ${detail}` : ""}` };
      }
      return { status: "sent", error: null };
    }

    if (config.provider === "smtp") {
      const { host, port, secure, user, pass } = config.smtp;
      if (!host || !user || !pass || !Number.isInteger(port) || port < 1 || port > 65535) {
        return { status: "failed", error: "SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS are required." };
      }
      const transporter = createTransporter({ host, port, secure, auth: { user, pass } });
      await transporter.sendMail({
        from: config.from,
        to,
        subject: message.subject,
        html: message.html,
        text: message.text,
        ...(message.replyTo ? { replyTo: message.replyTo } : {}),
      });
      return { status: "sent", error: null };
    }
    return { status: "failed", error: "EMAIL_PROVIDER must be resend or smtp." };
  } catch (error) {
    return { status: "failed", error: error instanceof Error ? error.message : "Email delivery failed." };
  }
}
