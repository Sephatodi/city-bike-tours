import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { customerMessages, users } from "@/db/schema";
import { requirePermission } from "@/lib/rbac";

export const dynamic = "force-dynamic";

// One row per rider who has written in: their latest message and how many are unanswered.
export async function GET() {
  const guard = await requirePermission("inbox:read");
  if (guard.error) return guard.error;
  const rows = await db.select({
    id: customerMessages.id, userId: customerMessages.userId, sender: customerMessages.sender, body: customerMessages.body,
    createdAt: customerMessages.createdAt, name: users.name, phone: users.phone, email: users.email,
  }).from(customerMessages).innerJoin(users, eq(users.id, customerMessages.userId)).orderBy(desc(customerMessages.createdAt)).limit(1500);

  const threads = new Map();
  for (const row of rows) {
    let thread = threads.get(row.userId);
    if (!thread) {
      thread = {
        userId: row.userId, name: row.name, phone: row.phone,
        email: row.email?.endsWith("@phone.citybiketours.invalid") ? null : row.email,
        lastMessage: row.body, lastSender: row.sender, lastAt: row.createdAt, awaitingReply: row.sender === "customer", total: 0,
      };
      threads.set(row.userId, thread);
    }
    thread.total += 1;
  }
  return NextResponse.json({ threads: [...threads.values()] });
}
