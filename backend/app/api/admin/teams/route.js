import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { teams, users } from "@/db/schema";
import { teamSchema } from "@/lib/validators";
import { getAdminSession, requirePermission } from "@/lib/admin";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  requirePermission(session, "teams:read");

  try {
    const allTeams = await db.select({
      id: teams.id,
      name: teams.name,
      description: teams.description,
      permissions: teams.permissions,
      createdAt: teams.createdAt,
      updatedAt: teams.updatedAt,
      memberCount: sql<number>`count(${users.id})`.as("member_count"),
    })
      .from(teams)
      .leftJoin(users, eq(users.teamId, teams.id))
      .groupBy(teams.id)
      .orderBy(desc(teams.createdAt));

    return NextResponse.json({ teams: allTeams });
  } catch (error) {
    console.error("Admin teams query failed:", error);
    return NextResponse.json({ error: "Failed to load teams." }, { status: 503 });
  }
}

export async function POST(request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  requirePermission(session, "teams:create");

  const parsed = teamSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid team data." }, { status: 400 });

  try {
    const crypto = await import("crypto");
    const [created] = await db.insert(teams).values({
      id: crypto.randomUUID(),
      ...parsed.data,
    }).returning();

    return NextResponse.json({ team: created }, { status: 201 });
  } catch (error) {
    console.error("Admin team create failed:", error);
    return NextResponse.json({ error: "Failed to create team." }, { status: 503 });
  }
}