import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { infobipSmsLogs } from "@/db/schema";
import { isValidTwilioRequest } from "@/lib/sms";

export async function POST(request) {
  const form = await request.formData().catch(() => null);
  if (!form) return new Response("Invalid form data", { status: 400 });

  const params = Object.fromEntries(form.entries());
  const publicUrl = process.env.PUBLIC_BACKEND_URL?.replace(/\/$/, "");
  if (!publicUrl || !isValidTwilioRequest(
    request.headers.get("x-twilio-signature") || "",
    `${publicUrl}/api/webhooks/twilio/status`,
    params,
  )) {
    return new Response("Forbidden", { status: 403 });
  }

  const messageId = String(params.MessageSid || "");
  const status = String(params.MessageStatus || "").toUpperCase();
  if (!messageId || !status) return new Response("Missing status data", { status: 400 });

  try {
    await db.update(infobipSmsLogs)
      .set({ status, statusUpdatedAt: new Date() })
      .where(and(
        eq(infobipSmsLogs.provider, "twilio"),
        eq(infobipSmsLogs.messageId, messageId),
      ));
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Twilio status callback processing failed:", error);
    return NextResponse.json({ error: "Internal processing failure." }, { status: 500 });
  }
}