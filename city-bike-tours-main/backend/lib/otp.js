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

// ─── Providers ───────────────────────────────────────────────────────────────
const twilioReady = () => Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN);
const SMS_READY = {
  twilio: () => twilioReady() && Boolean(process.env.TWILIO_PHONE_NUMBER),
  infobip: () => Boolean(process.env.INFOBIP_API_KEY && process.env.INFOBIP_BASE_URL),
};

// SMS providers that are configured, in the order they are tried. SMS_PROVIDER_ORDER="infobip,twilio" puts Infobip first;
// the default tries Twilio first. If one fails to send, the next one is tried.
export function smsProviders() {
  const wanted = (process.env.SMS_PROVIDER_ORDER || "twilio,infobip").split(",").map((name) => name.trim().toLowerCase());
  const order = [...new Set([...wanted, ...Object.keys(SMS_READY)])];
  return order.filter((name) => SMS_READY[name]?.());
}

export function otpChannels() {
  return {
    sms: smsProviders().length > 0,
    whatsapp: twilioReady() && Boolean(process.env.TWILIO_WHATSAPP_FROM),
  };
}

const message = (code) => `Your City Bike Tours code is ${code}. It expires in 10 minutes.`;

async function sendTwilio({ phone, channel, code }) {
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
      params.set("Body", message(code));
    }
  } else {
    params.set("From", process.env.TWILIO_PHONE_NUMBER);
    params.set("To", phone);
    params.set("Body", message(code));
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

// Infobip group ids that mean the message will not be delivered: 2 UNDELIVERABLE, 4 EXPIRED, 5 REJECTED.
const INFOBIP_FAILED_GROUPS = new Set([2, 4, 5]);

async function sendInfobip({ phone, code }) {
  const host = process.env.INFOBIP_BASE_URL.trim().replace(/^https?:\/\//i, "").replace(/\/+$/, "");
  const sender = (process.env.INFOBIP_SENDER || "").trim();
  const response = await fetch(`https://${host}/sms/2/text/advanced`, {
    method: "POST",
    headers: { Authorization: `App ${process.env.INFOBIP_API_KEY}`, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ messages: [{ destinations: [{ to: phone.replace(/\D/g, "") }], text: message(code), ...(sender && { from: sender }) }] }),
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const detail = body?.requestError?.serviceException?.text || body?.requestError?.serviceException?.messageId || "";
    throw new Error(`Infobip rejected the request (${response.status}) ${String(detail).slice(0, 200)}`);
  }
  const status = body?.messages?.[0]?.status;
  if (status && INFOBIP_FAILED_GROUPS.has(Number(status.groupId))) {
    throw new Error(`Infobip could not send the message (${status.groupName}: ${String(status.description || status.name || "").slice(0, 150)})`);
  }
}

const SENDERS = { twilio: sendTwilio, infobip: sendInfobip };

/**
 * Sends the one-time code. SMS goes through the configured providers in order (see smsProviders) and falls back to the next
 * one if a send fails. WhatsApp uses Twilio, with an approved template when TWILIO_WHATSAPP_OTP_CONTENT_SID is set (needed
 * outside the 24-hour window); otherwise it sends plain text, which Twilio only delivers inside that window or in the sandbox.
 */
export async function sendOtp({ phone, channel, code }) {
  if (channel === "whatsapp") return sendTwilio({ phone, channel, code });
  const providers = smsProviders();
  if (!providers.length) throw new Error("No SMS provider is configured.");
  const failures = [];
  for (const name of providers) {
    try {
      await SENDERS[name]({ phone, channel, code });
      if (failures.length) console.info(`OTP sent through ${name} after ${failures.length} failed attempt(s).`);
      return;
    } catch (error) {
      failures.push(error.message);
      console.error(`OTP send failed through ${name}:`, error.message);
    }
  }
  throw new Error(failures.join(" | "));
}
