import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import { customerMessages, users } from "@/db/schema";
import { newId } from "@/lib/id";
import { requirePermission } from "@/lib/rbac";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function GET(_request, { params }) {
  const guard = await requirePermission("inbox:read");
  if (guard.error) return guard.error;
  const [customer] = await db.select({ id: users.id, name: users.name, phone: users.phone, email: users.email }).from(users).where(eq(users.id, params.userId));
  if (!customer) return NextResponse.json({ error: "Rider not found." }, { status: 404 });
  const messages = await db.select().from(customerMessages).where(eq(customerMessages.userId, params.userId)).orderBy(asc(customerMessages.createdAt)).limit(300);
  return NextResponse.json({ customer, messages });
}

const schema = z.object({ body: z.string().trim().min(1, "Write a reply first.").max(1500) });

export async function POST(request, { params }) {
  const guard = await requirePermission("inbox:write");
  if (guard.error) return guard.error;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Write a reply first." }, { status: 400 });
  const [customer] = await db.select({ id: users.id, name: users.name }).from(users).where(eq(users.id, params.userId));
  if (!customer) return NextResponse.json({ error: "Rider not found." }, { status: 404 });
  const [message] = await db.insert(customerMessages).values({ id: newId(), userId: customer.id, sender: "admin", senderName: guard.staff.name, body: parsed.data.body }).returning();
  await logAudit(guard.staff, "inbox.chat_reply", `Replied to ${customer.name} in chat`, { targetType: "customer", targetId: customer.id });
  return NextResponse.json({ message }, { status: 201 });
}
