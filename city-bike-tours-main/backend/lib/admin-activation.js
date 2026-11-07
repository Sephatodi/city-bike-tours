import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { and, desc, eq, isNull } from "drizzle-orm";
import { adminActivationCodes } from "@/db/schema";
import { newId } from "@/lib/id";

export const ACTIVATION_TTL_MINUTES = 30;
const CODE_RE = /^\d{6}$/;

export function normalizeActivationCode(input) {
  const code = String(input || "").trim().replace(/[\s-]+/g, "");
  return CODE_RE.test(code) ? code : "";
}

export function generateActivationCode() {
  // 6-digit numeric, zero-padded; easy to type from email.
  return String(randomBytes(4).readUInt32BE(0) % 1_000_000).padStart(6, "0");
}

export function hashActivationCode(email, code) {
  // Bind code to account email so a code can't be reused across accounts.
  return createHash("sha256").update(`${String(email).trim().toLowerCase()}:${code}`).digest("hex");
}

export async function issueActivationCode(db, { userId, email, createdBy = null, ttlMinutes = ACTIVATION_TTL_MINUTES }) {
  const code = generateActivationCode();
  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);
  // Invalidate any unused codes for this user.
  await db.update(adminActivationCodes)
    .set({ usedAt: new Date() })
    .where(and(eq(adminActivationCodes.userId, userId), isNull(adminActivationCodes.usedAt)));
  await db.insert(adminActivationCodes).values({
    id: newId(),
    userId,
    codeHash: hashActivationCode(email, code),
    expiresAt,
    createdBy,
  });
  return { code, expiresAt };
}

export async function verifyActivationCode(db, { userId, email, code }) {
  const normalized = normalizeActivationCode(code);
  if (!normalized) return { ok: false, error: "Enter the 6-digit activation code from your email." };
  const [row] = await db.select().from(adminActivationCodes)
    .where(and(eq(adminActivationCodes.userId, userId), isNull(adminActivationCodes.usedAt)))
    .orderBy(desc(adminActivationCodes.createdAt))
    .limit(1);
  if (!row) return { ok: false, error: "This activation code is invalid or has already been used." };
  if (new Date(row.expiresAt).getTime() < Date.now()) return { ok: false, error: "This activation code has expired. Ask an admin to send a new one." };
  const expected = Buffer.from(row.codeHash, "hex");
  const actual = Buffer.from(hashActivationCode(email, normalized), "hex");
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    return { ok: false, error: "This activation code is invalid." };
  }
  return { ok: true, row };
}
