import { sql } from "drizzle-orm";
import { db } from "@/db/client";

const TEMPLATE_KEYS = ["A", "B", "C"];

export async function createBookingConfirmation({ name, date, time, guests, link }) {
  const result = await db.execute(sql`
    SELECT nextval('public.booking_confirmation_template_seq') AS sequence
  `);
  const sequence = Number(result.rows[0]?.sequence);
  if (!Number.isSafeInteger(sequence) || sequence < 1) {
    throw new Error("Could not allocate a booking confirmation template.");
  }

  const templateKey = TEMPLATE_KEYS[(sequence - 1) % TEMPLATE_KEYS.length];
  const messages = {
    A: `Hi ${name}, your city bike tour is confirmed for ${date} at ${time}! Group size: ${guests}. View details or modify your booking here: ${link}. See you soon! 🚴`,
    B: `Get ready to ride, ${name}! 🚴 Your bike tour booking is locked in for ${date} (${time}). Meet us 15 mins early at the main hub. Directions: ${link}`,
    C: `Confirmed: Bike tour for ${name} on ${date} @ ${time}. Details & meet-up location here: ${link}`,
  };

  return {
    templateKey,
    body: messages[templateKey],
    whatsappVariables: {
      "1": name,
      "2": date,
      "3": time,
      "4": String(guests),
      "5": link,
    },
    contentSid: process.env[`TWILIO_WHATSAPP_CONTENT_SID_${templateKey}`],
  };
}
