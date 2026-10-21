import { NextResponse } from "next/server";
import { and, asc, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import { customerMessages } from "@/db/schema";
import { newId } from "@/lib/id";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { requireCustomer } from "@/lib/customer-auth";
import { fireWebhook } from "@/lib/webhook";

export const dynamic = "force-dynamic";

// The signed-in customer's conversation with the team. Opening it marks the team's replies as read.
export async function GET(request) {
  const auth = await requireCustomer(request);
  if (auth.error) return auth.error;
  const messages = await db.select({
    id: customerMessages.id, sender: customerMessages.sender, senderName: customerMessages.senderName,
    body: customerMessages.body, createdAt: customerMessages.createdAt,
  }).from(customerMessages).where(eq(customerMessages.userId, auth.user.id)).orderBy(asc(customerMessages.createdAt)).limit(200);
  await db.update(customerMessages).set({ readAt: new Date() })
    .where(and(eq(customerMessages.userId, auth.user.id), eq(customerMessages.sender, "admin"), isNull(customerMessages.readAt)));
  return NextResponse.json({ messages });
}

const schema = z.object({ body: z.string().trim().min(1, "Write a message first.").max(1500, "Keep it under 1,500 characters.") });

export async function POST(request) {
  const auth = await requireCustomer(request);
  if (auth.error) return auth.error;
  if (!rateLimit(`cust-msg:${auth.user.id}:${clientIp(request)}`, 20, 60 * 60 * 1000)) return NextResponse.json({ error: "You're sending messages very quickly. Please wait a little." }, { status: 429 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Check your message." }, { status: 400 });
  const [message] = await db.insert(customerMessages).values({
    id: newId(), userId: auth.user.id, sender: "customer", senderName: auth.user.name, body: parsed.data.body,
  }).returning({ id: customerMessages.id, sender: customerMessages.sender, senderName: customerMessages.senderName, body: customerMessages.body, createdAt: customerMessages.createdAt });
  await fireWebhook("customer_message.created", { id: message.id, name: auth.user.name, phone: auth.user.phone, message: parsed.data.body });
  return NextResponse.json({ message }, { status: 201 });
}
