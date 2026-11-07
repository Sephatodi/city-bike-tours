import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function POST() {
  const session = await getServerSession(authOptions);
  try { if (session?.user) await logAudit(session.user, "auth.signout", "Signed out from admin", { targetType: "user", targetId: session.user.id }); } catch {}
  return NextResponse.json({ ok: true });
}
