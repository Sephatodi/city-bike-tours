import { infobipSmsLogs } from "@/db/schema";
import { sendSmsMessage, sendWhatsAppMessage, smsProviders, whatsappReady } from "@/lib/otp";
import { sendBookingConfirmationEmail } from "@/lib/email";

async function recordDelivery(db, { bookingRequestId, channel, recipient, message, provider, messageId, status }) {
  try {
    await db.insert(infobipSmsLogs).values({
      bookingRequestId,
      provider,
      channel,
      recipient,
      message,
      messageId,
      status,
      statusUpdatedAt: new Date(),
    });
  } catch (error) {
    console.error(`Could not record ${channel} booking notification:`, error.message);
  }
}

async function deliver(db, { bookingRequestId, channel, recipient, message, provider, send }) {
  try {
    const result = await send();
    await recordDelivery(db, {
      bookingRequestId,
      channel,
      recipient,
      message,
      provider: result.provider || provider,
      messageId: result.messageId,
      status: "QUEUED",
    });
    return { status: "accepted", provider: result.provider || provider, mode: result.mode || null };
  } catch (error) {
    console.error(`${channel} booking confirmation failed:`, error.message);
    await recordDelivery(db, {
      bookingRequestId,
      channel,
      recipient,
      message,
      provider,
      messageId: null,
      status: "FAILED",
    });
    return { status: "failed" };
  }
}

export async function sendBookingNotifications(db, {
  bookingRequestId,
  phone,
  email,
  name,
  smsMessage,
  whatsappMessage,
  qrImageUrl,
  whatsappContentSid,
  whatsappContentVariables,
  routeName,
  date,
  time,
  guests,
  confirmationCode,
  link,
}) {
  const smsConfigured = smsProviders().length > 0;
  const whatsappConfigured = whatsappReady();
  const emailConfigured = Boolean(email && process.env.BOOKING_CONFIRMATION_SMTP_PASS);
  const [sms, whatsapp, mail] = await Promise.all([
    smsConfigured
      ? deliver(db, {
        bookingRequestId,
        channel: "sms",
        recipient: phone,
        message: smsMessage,
        provider: "sms",
        send: () => sendSmsMessage({ phone, body: smsMessage }),
      })
      : { status: "not_configured" },
    whatsappConfigured
      ? deliver(db, {
        bookingRequestId,
        channel: "whatsapp",
        recipient: phone,
        message: whatsappMessage,
        provider: "twilio",
        send: () => sendWhatsAppMessage({
          phone,
          body: whatsappMessage,
          mediaUrl: qrImageUrl,
          contentSid: whatsappContentSid,
          contentVariables: whatsappContentVariables,
        }),
      })
      : { status: "not_configured" },
    emailConfigured
      ? deliver(db, {
        bookingRequestId,
        channel: "email",
        recipient: email,
        message: `Booking confirmation emailed to ${email}`,
        provider: "smtp",
        send: () => sendBookingConfirmationEmail({
          to: email,
          name,
          date,
          time,
          guests,
          routeName,
          confirmationCode,
          link,
        }),
      })
      : { status: "not_configured" },
  ]);

  return {
    sms,
    whatsapp,
    email: mail,
    messagingConfigured: smsConfigured || whatsappConfigured || emailConfigured,
  };
}
