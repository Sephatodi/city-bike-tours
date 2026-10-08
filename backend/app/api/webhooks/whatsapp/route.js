import { desc, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { bookingRequests } from "@/db/schema";
import { isValidTwilioRequest } from "@/lib/sms";

const escapeXml = (s) => s.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c]));
const twiml = (message) =>
  new Response(`<?xml version="1.0" encoding="UTF-8"?><Response><Message>${escapeXml(message)}</Message></Response>`, {
    headers: { "Content-Type": "text/xml" },
  });

// Twilio "When a message comes in" URL: {PUBLIC_BACKEND_URL}/api/webhooks/whatsapp
// A rider who messages the WhatsApp number gets the status of their latest booking request.
export async function POST(request) {
  try {
    const form = await request.formData();
    const params = Object.fromEntries(form.entries());

    if (process.env.TWILIO_AUTH_TOKEN) {
      const url = `${(process.env.PUBLIC_BACKEND_URL || "").replace(/\/$/, "")}/api/webhooks/whatsapp`;
      if (!isValidTwilioRequest(request.headers.get("x-twilio-signature") || "", url, params)) {
        return new Response("Forbidden", { status: 403 });
      }
    }

    const phone = String(params.From || "").replace("whatsapp:", "");
    const [latest] = await db.select().from(bookingRequests)
      .where(sql`replace(${bookingRequests.phone}, ' ', '') = ${phone}`)
      .orderBy(desc(bookingRequests.createdAt)).limit(1);

    if (!latest) return twiml("Hi from City Bike Tours! We couldn't find a booking for this number. You can book on our website.");
    return twiml(`Your latest request for ${latest.rideDate} is ${latest.status.toUpperCase()}. Ref: ${latest.id.slice(0, 8)}`);
  } catch (error) {
    console.error("WhatsApp webhook error:", error);
    return new Response("Error", { status: 500 });
  }
}
