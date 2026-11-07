import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { backups, users } from "@/db/schema";
import { backupSchema } from "@/lib/validators";
import { getAdminSession, requirePermission } from "@/lib/admin";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  requirePermission(session, "backups:read");

  try {
    const allBackups = await db.select({
      id: backups.id,
      type: backups.type,
      status: backups.status,
      filePath: backups.filePath,
      fileSize: backups.fileSize,
      errorMessage: backups.errorMessage,
      startedAt: backups.startedAt,
      completedAt: backups.completedAt,
      createdBy: backups.createdBy,
      creatorName: users.name,
    })
      .from(backups)
      .leftJoin(users, eq(backups.createdBy, users.id))
      .orderBy(desc(backups.startedAt))
      .limit(50);

    return NextResponse.json({ backups: allBackups });
  } catch (error) {
    console.error("Admin backups query failed:", error);
    return NextResponse.json({ error: "Failed to load backups." }, { status: 503 });
  }
}

export async function POST(request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  requirePermission(session, "backups:create");

  const parsed = backupSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid backup type." }, { status: 400 });

  try {
    const crypto = await import("crypto");
    const backupId = crypto.randomUUID();

    const [created] = await db.insert(backups).values({
      id: backupId,
      type: parsed.data.type,
      status: "in_progress",
      createdBy: session.user.id,
    }).returning();

    // Simulate backup process (in production, this would be a background job)
    setTimeout(async () => {
      try {
        // In production, actually perform backup here
        await db.update(backups)
          .set({
            status: "completed",
            filePath: `/backups/${backupId}.sql`,
            fileSize: "10.5 MB",
            completedAt: new Date(),
          })
          .where(eq(backups.id, backupId));
      } catch (error) {
        await db.update(backups)
          .set({ status: "failed", errorMessage: error.message, completedAt: new Date() })
          .where(eq(backups.id, backupId));
      }
    }, 2000);

    return NextResponse.json({ backup: created }, { status: 201 });
  } catch (error) {
    console.error("Admin backup create failed:", error);
    return NextResponse.json({ error: "Failed to create backup." }, { status: 503 });
  }
}