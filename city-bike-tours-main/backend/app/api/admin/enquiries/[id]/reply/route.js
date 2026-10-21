import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import { enquiries } from "@/db/schema";
import { requirePermission } from "@/lib/rbac";
import { logAudit } from "@/lib/audit";
import { buildWaLink } from "@/lib/wa";

const schema = z.object({ message: z.string().trim().min(2).max(600) });

// Replies by WhatsApp/SMS when the person left a phone number. For email-only enquiries staff reply from their own mailbox.
export async function POST(request, { params }) {
  const guard = await requirePermission("messages:send");
  if (guard.error) return guard.error;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Write a reply first." }, { status: 400 });
  const [row] = await db.select().from(enquiries).where(eq(enquiries.id, params.id));
  if (!row) return NextResponse.json({ error: "Enquiry not found." }, { status: 404 });
  if (!row.phone) return NextResponse.json({ error: "This person only left an email address. Reply from your email." }, { status: 409 });

  const waLink = buildWaLink(row.phone, `City Bike Tours: ${parsed.data.message}`);
  if (!waLink) return NextResponse.json({ error: "Could not generate WhatsApp link for this phone number." }, { status: 409 });
  await db.update(enquiries).set({ status: row.status === "new" ? "in_progress" : row.status, updatedAt: new Date() }).where(eq(enquiries.id, row.id));
  await logAudit(guard.staff, "inbox.reply", `Replied to ${row.name} by message`, { targetType: "enquiry", targetId: row.id });
  return NextResponse.json({ success: true, waLink });
}
