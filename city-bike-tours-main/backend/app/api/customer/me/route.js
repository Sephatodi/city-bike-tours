import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { normalizePhone } from "@/lib/phone";
import { publicUser, requireCustomer } from "@/lib/customer-auth";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const auth = await requireCustomer(request);
  if (auth.error) return auth.error;
  return NextResponse.json({ user: publicUser(auth.user) });
}

const patchSchema = z.object({ name: z.string().trim().min(1).max(160).optional(), phone: z.string().trim().max(30).optional() })
  .refine((v) => Object.keys(v).length > 0, "Nothing to update.");

export async function PATCH(request) {
  const auth = await requireCustomer(request);
  if (auth.error) return auth.error;
  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input." }, { status: 400 });
  const patch = {};
  if (parsed.data.name) patch.name = parsed.data.name;
  if (parsed.data.phone !== undefined) {
    const phone = parsed.data.phone ? normalizePhone(parsed.data.phone) : "";
    if (parsed.data.phone && !phone) return NextResponse.json({ error: "Enter a valid phone number." }, { status: 400 });
    patch.phone = phone || null;
  }
  const [updated] = await db.update(users).set(patch).where(eq(users.id, auth.user.id)).returning();
  return NextResponse.json({ user: publicUser(updated) });
}
