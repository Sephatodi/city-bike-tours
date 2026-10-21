import { normalizePhone } from "@/lib/phone";

/**
 * Builds a WhatsApp click-to-chat URL (wa.me) for a given phone number and message.
 * Returns null if the phone number is invalid or empty.
 */
export function buildWaLink(rawPhone, message) {
  const digits = normalizePhone(rawPhone);
  if (!digits) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

/**
 * Logs a WhatsApp message attempt to the database for audit/history purposes.
 * Uses "wa.me" as provider since we're using click-to-chat links, not Twilio.
 */
export async function logWaMessage(db, infobipSmsLogs, { bookingRequestId, bookingId, recipient, message, status = "SENT" }) {
  await db.insert(infobipSmsLogs).values({
    bookingRequestId: bookingRequestId || null,
    bookingId: bookingId || null,
    provider: "wa.me",
    channel: "whatsapp",
    recipient,
    message,
    status,
    statusUpdatedAt: new Date(),
  });
}