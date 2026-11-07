import { NextResponse } from "next/server";
import { desc, eq, sql, and } from "drizzle-orm";
import { db } from "@/db/client";
import { systemLogs, users } from "@/db/schema";
import { getAdminSession, requirePermission } from "@/lib/admin";

export async function GET(request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  requirePermission(session, "logs:read");

  const { searchParams } = new URL(request.url);
  const level = searchParams.get("level");
  const limit = Math.min(parseInt(searchParams.get("limit") || "100"), 500);
  const offset = parseInt(searchParams.get("offset") || "0");
  const userId = searchParams.get("userId");

  try {
    const conditions = [];
    if (level) conditions.push(eq(systemLogs.level, level));
    if (userId) conditions.push(eq(systemLogs.userId, userId));

    const [logs, total] = await Promise.all([
      db.select({
        id: systemLogs.id,
        level: systemLogs.level,
        message: systemLogs.message,
        context: systemLogs.context,
        userId: systemLogs.userId,
        ipAddress: systemLogs.ipAddress,
        userAgent: systemLogs.userAgent,
        createdAt: systemLogs.createdAt,
        userName: users.name,
        userEmail: users.email,
      })
        .from(systemLogs)
        .leftJoin(users, eq(systemLogs.userId, users.id))
        .where(conditions.length ? and(...conditions) : undefined)
        .orderBy(desc(systemLogs.createdAt))
        .limit(limit)
        .offset(offset),
      db.select({ count: sql<number>`count(*)` })
        .from(systemLogs)
        .where(conditions.length ? and(...conditions) : undefined),
    ]);

    return NextResponse.json({
      logs,
      total: total[0]?.count || 0,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Admin logs query failed:", error);
    return NextResponse.json({ error: "Failed to load logs." }, { status: 503 });
  }
}