import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { infobipSmsLogs } from "@/db/schema";

function authorized(request) {
  const expected = process.env.INFOBIP_WEBHOOK_TOKEN;
  const supplied = request.headers.get("x-infobip-webhook-token") || "";
  if (!expected || supplied.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(supplied), Buffer.from(expected));
}

export async function POST(request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized webhook." }, { status: 401 });
  }

  const payload = await request.json().catch(() => null);
  if (!Array.isArray(payload?.results) || payload.results.length === 0) {
    return NextResponse.json({ error: "Empty delivery report payload." }, { status: 400 });
  }

  try {
    for (const report of payload.results) {
      const messageId = typeof report?.messageId === "string" ? report.messageId : "";
      const status = typeof report?.status?.name === "string" ? report.status.name : "";
      if (!messageId || !status) continue;

      await db.update(infobipSmsLogs)
        .set({ status, statusUpdatedAt: new Date() })
        .where(and(
          eq(infobipSmsLogs.provider, "infobip"),
          eq(infobipSmsLogs.messageId, messageId),
        ));
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Infobip delivery report processing failed:", error);
    return NextResponse.json({ error: "Internal processing failure." }, { status: 500 });
  }
}