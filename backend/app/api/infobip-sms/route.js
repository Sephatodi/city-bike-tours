import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { infobipSmsLogs } from "@/db/schema";
import { isAdmin } from "@/lib/admin";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { isE164 } from "@/lib/phone";

export const runtime = "nodejs";

export async function POST(request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  if (!rateLimit(`infobip-sms:${clientIp(request)}`, 5, 10 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const recipient = typeof body?.recipient === "string" ? body.recipient.trim() : "";
  const message = typeof body?.message === "string" ? body.message.trim() : "";
  if (!isE164(recipient) || !message || message.length > 1600) {
    return NextResponse.json({ error: "Provide a valid international phone number and a message of 1 to 1600 characters." }, { status: 400 });
  }

  const baseUrl = process.env.INFOBIP_BASE_URL?.replace(/\/$/, "");
  const apiKey = process.env.INFOBIP_API_KEY;
  if (!baseUrl || !apiKey) {
    return NextResponse.json({ error: "Infobip is not configured." }, { status: 503 });
  }

  try {
    const response = await fetch(`${baseUrl}/sms/2/text/advanced`, {
      method: "POST",
      headers: {
        Authorization: `App ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        messages: [{
          destinations: [{ to: recipient }],
          from: process.env.INFOBIP_SENDER || "InfoSMS",
          text: message,
        }],
      }),
    });

    let data;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    const messageInfo = data?.messages?.[0];
    const messageId = messageInfo?.messageId ?? null;
    const status = response.ok ? messageInfo?.status?.name ?? "PENDING" : "FAILED";

    await db.insert(infobipSmsLogs).values({ recipient, message, messageId, status });

    if (!response.ok) {
      return NextResponse.json({ error: "Infobip dispatch failed.", details: data }, { status: 502 });
    }

    return NextResponse.json({ success: true, messageId });
  } catch (error) {
    console.error("Failed to dispatch or log Infobip SMS:", error);
    return NextResponse.json({ error: "Internal server error processing dispatch." }, { status: 500 });
  }
}