import twilio from "twilio";
import { isE164 } from "@/lib/phone";

let client;

function getClient() {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) return null;
  client ??= twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  return client;
}

/**
 * Sends a message to a rider via WhatsApp, falling back to SMS. Never throws; returns true if sent.
 * TWILIO_WHATSAPP_FROM e.g. "whatsapp:+14155238886"; TWILIO_PHONE_NUMBER is the SMS sender.
 */
export async function notify(to, body) {
  const twilioClient = getClient();
  if (!twilioClient || !to || !isE164(to)) return false;

  const waFrom = process.env.TWILIO_WHATSAPP_FROM;
  if (waFrom) {
    try {
      await twilioClient.messages.create({
        from: waFrom.startsWith("whatsapp:") ? waFrom : `whatsapp:${waFrom}`,
        to: `whatsapp:${to}`,
        body,
      });
      return true;
    } catch (error) {
      console.error("WhatsApp message could not be sent:", error.message);
    }
  }
  if (process.env.TWILIO_PHONE_NUMBER) {
    try {
      await twilioClient.messages.create({ from: process.env.TWILIO_PHONE_NUMBER, to, body });
      return true;
    } catch (error) {
      console.error("SMS could not be sent:", error.message);
    }
  }
  return false;
}

export async function notifyBoth(to, body, whatsappVariables = null) {
  const twilioClient = getClient();
  if (!twilioClient || !to || !isE164(to)) return { whatsapp: false, sms: false };

  const [whatsapp, sms] = await Promise.all([
    (async () => {
      const from = process.env.TWILIO_WHATSAPP_FROM;
      if (!from) return false;
      try {
        const message = {
          from: from.startsWith("whatsapp:") ? from : `whatsapp:${from}`,
          to: `whatsapp:${to}`,
        };
        if (process.env.TWILIO_WHATSAPP_CONTENT_SID) {
          message.contentSid = process.env.TWILIO_WHATSAPP_CONTENT_SID;
          message.contentVariables = JSON.stringify(whatsappVariables || { "1": body });
        } else {
          message.body = body;
        }
        await twilioClient.messages.create(message);
        return true;
      } catch (error) {
        console.error("WhatsApp confirmation could not be sent:", error.message);
        return false;
      }
    })(),
    (async () => {
      const from = process.env.TWILIO_PHONE_NUMBER;
      if (!from) return false;
      try {
        await twilioClient.messages.create({ from, to, body });
        return true;
      } catch (error) {
        console.error("SMS confirmation could not be sent:", error.message);
        return false;
      }
    })(),
  ]);

  return { whatsapp, sms };
}

export const notifyAdmin = (body) => notify(process.env.ADMIN_PHONE, body);

export function isValidTwilioRequest(signature, url, params) {
  return twilio.validateRequest(process.env.TWILIO_AUTH_TOKEN, signature, url, params);
}

export async function sendBookingConfirmation({ user, booking, routeId, ticketUrl, whatsappVariables }) {
  if (!user?.phone) return { whatsapp: false, sms: false };
  return notifyBoth(
    user.phone,
    `Dumela ${user.name}! Your City Bike Tours ${routeId ?? "cycling lesson"} booking is confirmed for ${booking.rideDate} (${booking.timeSlot}). Meet at Main Mall, Gaborone. Show your ride pass at check-in: ${ticketUrl} Ref: ${booking.id.slice(0, 8).toUpperCase()}`,
    whatsappVariables
  );
}
