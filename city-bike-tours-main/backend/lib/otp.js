import { createHmac, randomInt, timingSafeEqual } from "node:crypto";

const secret = () => process.env.CUSTOMER_TOKEN_SECRET || process.env.NEXTAUTH_SECRET || "dev-only-secret";

export const OTP_TTL_MS = 10 * 60 * 1000;
export const OTP_MAX_ATTEMPTS = 5;

export const generateCode = () => String(randomInt(0, 1000000)).padStart(6, "0");
export const hashCode = (phone, code) => createHmac("sha256", secret()).update(`${phone}:${code}`).digest("hex");
export function codeMatches(phone, code, hash) {
  const a = Buffer.from(hashCode(phone, String(code)));
  const b = Buffer.from(hash);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function otpChannels() {
  const base = Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN);
  return {
    sms: base && Boolean(process.env.TWILIO_PHONE_NUMBER),
    whatsapp: base && Boolean(process.env.TWILIO_WHATSAPP_FROM),
  };
}

/**
 * Sends the one-time code through Twilio. WhatsApp uses an approved template when
 * TWILIO_WHATSAPP_OTP_CONTENT_SID is set (needed outside the 24-hour window);
 * otherwise it sends plain text, which Twilio only delivers inside that window or in the sandbox.
 */
export async function sendOtp({ phone, channel, code }) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const auth = Buffer.from(`${sid}:${process.env.TWILIO_AUTH_TOKEN}`).toString("base64");
  const params = new URLSearchParams();
  if (channel === "whatsapp") {
    params.set("From", process.env.TWILIO_WHATSAPP_FROM.startsWith("whatsapp:") ? process.env.TWILIO_WHATSAPP_FROM : `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`);
    params.set("To", `whatsapp:${phone}`);
    if (process.env.TWILIO_WHATSAPP_OTP_CONTENT_SID) {
      params.set("ContentSid", process.env.TWILIO_WHATSAPP_OTP_CONTENT_SID);
      params.set("ContentVariables", JSON.stringify({ 1: code }));
    } else {
      params.set("Body", `Your City Bike Tours code is ${code}. It expires in 10 minutes.`);
    }
  } else {
    params.set("From", process.env.TWILIO_PHONE_NUMBER);
    params.set("To", phone);
    params.set("Body", `Your City Bike Tours code is ${code}. It expires in 10 minutes.`);
  }
  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: "POST",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Twilio rejected the message (${response.status}) ${detail.slice(0, 200)}`);
  }
}
