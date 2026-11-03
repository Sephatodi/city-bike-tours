import nodemailer from "nodemailer";

export const DEFAULT_BOOKING_EMAIL = "aobakweramoleko3@yahoo.com";

export function getBookingEmailConfig() {
  const host = process.env.BOOKING_CONFIRMATION_SMTP_HOST || "smtp.mail.yahoo.com";
  const port = Number(process.env.BOOKING_CONFIRMATION_SMTP_PORT || (host.includes("yahoo") ? 465 : 587));
  const secure = String(process.env.BOOKING_CONFIRMATION_SMTP_SECURE ?? (port === 465 ? "true" : "false")).toLowerCase() === "true";
  const from = process.env.BOOKING_CONFIRMATION_EMAIL || process.env.BOOKING_CONFIRMATION_FROM || DEFAULT_BOOKING_EMAIL;
  const user = process.env.BOOKING_CONFIRMATION_SMTP_USER || from;
  const pass = process.env.BOOKING_CONFIRMATION_SMTP_PASS || "";

  return { host, port, secure, from, user, pass };
}

export function bookingEmailReady() {
  const { host, user, pass, from } = getBookingEmailConfig();
  return Boolean(host && user && pass && from);
}

export async function sendBookingConfirmationEmail({
  to,
  name,
  date,
  time,
  guests,
  routeName,
  link,
  confirmationCode,
}) {
  if (!to || !bookingEmailReady()) {
    return { status: "not_configured" };
  }

  const { from, host, port, secure, user, pass } = getBookingEmailConfig();
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });

  const rideSummary = routeName ? `${routeName} · ${date} at ${time}` : `${date} at ${time}`;
  const subject = `City Bike Tours booking confirmed · ${date}`;
  const text = [
    `Hi ${name},`,
    "",
    `Your City Bike Tours booking is confirmed for ${rideSummary}.`,
    `Riders: ${guests}`,
    `Confirmation code: ${confirmationCode}`,
    `Ride pass: ${link}`,
    "",
    "Thanks for riding with us!",
    "City Bike Tours",
  ].join("\n");

  const html = `
    <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6;">
      <p>Hi ${name},</p>
      <p>Your City Bike Tours booking is confirmed for <strong>${rideSummary}</strong>.</p>
      <ul>
        <li><strong>Riders:</strong> ${guests}</li>
        <li><strong>Confirmation code:</strong> ${confirmationCode}</li>
      </ul>
      <p><a href="${link}" style="color: #0f766e; font-weight: 700;">Open your ride pass</a></p>
      <p>Thanks for riding with us!</p>
      <p><strong>City Bike Tours</strong></p>
    </div>
  `;

  await transporter.sendMail({
    from,
    to,
    subject,
    text,
    html,
  });

  return { status: "sent", provider: "smtp" };
}
