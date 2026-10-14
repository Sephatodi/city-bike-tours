import { createHmac } from "node:crypto";
import { getSettings } from "@/lib/settings";

/**
 * Tells another system (Zapier, a CRM, Slack automation...) that something happened.
 * Sends JSON signed with HMAC-SHA256 in the `X-Signature` header. Never throws, never blocks for long.
 */
export async function fireWebhook(event, data) {
  try {
    const { webhookUrl, webhookSecret } = await getSettings();
    if (!webhookUrl) return false;
    const body = JSON.stringify({ event, sentAt: new Date().toISOString(), data });
    const signature = webhookSecret ? createHmac("sha256", webhookSecret).update(body).digest("hex") : "";
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Event": event, ...(signature ? { "X-Signature": `sha256=${signature}` } : {}) },
      body,
      signal: AbortSignal.timeout(4000),
    });
    return response.ok;
  } catch (error) {
    console.error("Webhook failed:", error.message);
    return false;
  }
}
