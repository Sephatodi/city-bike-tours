import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { and, count, desc, eq, gte } from "drizzle-orm";
import { db } from "@/db/client";
import { blockedIps, loginAttempts } from "@/db/schema";

/* ── client address ─────────────────────────────────────── */
export function ipFromHeaders(headers) {
  const get = (k) => (typeof headers?.get === "function" ? headers.get(k) : headers?.[k]);
  return String(get("x-forwarded-for") || get("x-real-ip") || "").split(",")[0].trim() || "unknown";
}

/* ── blocklist + attempts ───────────────────────────────── */
export async function isIpBlocked(ip) {
  if (!ip || ip === "unknown") return false;
  try {
    const [row] = await db.select({ ip: blockedIps.ip }).from(blockedIps).where(eq(blockedIps.ip, ip));
    return !!row;
  } catch {
    return false; // never lock everyone out because of a database hiccup
  }
}

export async function recordAttempt({ email, ip, success, reason }) {
  try {
    await db.insert(loginAttempts).values({ email: email || null, ip: ip || null, success, reason: reason || null });
  } catch (error) {
    console.error("Could not record sign-in attempt:", error.message);
  }
}

export async function recentFailures(email, minutes = 15) {
  const since = new Date(Date.now() - minutes * 60 * 1000);
  const [row] = await db.select({ n: count() }).from(loginAttempts)
    .where(and(eq(loginAttempts.email, email), eq(loginAttempts.success, false), gte(loginAttempts.createdAt, since)));
  return Number(row?.n ?? 0);
}

export const listAttempts = (limit = 100) => db.select().from(loginAttempts).orderBy(desc(loginAttempts.id)).limit(limit);

/* ── authenticator-app codes (RFC 6238, 30s, 6 digits) ───── */
const B32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function newTotpSecret() {
  let bits = "";
  for (const b of randomBytes(20)) bits += b.toString(2).padStart(8, "0");
  let out = "";
  for (let i = 0; i + 5 <= bits.length; i += 5) out += B32[parseInt(bits.slice(i, i + 5), 2)];
  return out;
}

function b32decode(text) {
  let bits = "";
  for (const c of text.replace(/=+$/, "")) bits += B32.indexOf(c).toString(2).padStart(5, "0");
  const bytes = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) bytes.push(parseInt(bits.slice(i, i + 8), 2));
  return Buffer.from(bytes);
}

export function hotp(key, counter) {
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64BE(BigInt(counter));
  const h = createHmac("sha1", key).update(buf).digest();
  const o = h[h.length - 1] & 0xf;
  const code = ((h[o] & 0x7f) << 24) | (h[o + 1] << 16) | (h[o + 2] << 8) | h[o + 3];
  return String(code % 1_000_000).padStart(6, "0");
}

export function verifyTotp(secret, token, window = 1) {
  const t = String(token || "").replace(/\s/g, "");
  if (!/^\d{6}$/.test(t) || !secret) return false;
  const key = b32decode(secret);
  const counter = Math.floor(Date.now() / 30000);
  let ok = false;
  for (let w = -window; w <= window; w++) {
    const expected = Buffer.from(hotp(key, counter + w));
    if (timingSafeEqual(expected, Buffer.from(t))) ok = true;
  }
  return ok;
}

export const otpauthUri = (email, secret) =>
  `otpauth://totp/${encodeURIComponent(`City Bike Tours:${email}`)}?secret=${secret}&issuer=${encodeURIComponent("City Bike Tours")}&period=30&digits=6`;

/* ── keep the authenticator secret encrypted at rest ─────── */
const encKey = () => createHash("sha256").update(String(process.env.NEXTAUTH_SECRET || "dev-only-secret")).digest();

export function sealSecret(plain) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encKey(), iv);
  const data = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return [iv, cipher.getAuthTag(), data].map((b) => b.toString("base64")).join(".");
}

export function openSecret(sealed) {
  try {
    const [iv, tag, data] = String(sealed).split(".").map((p) => Buffer.from(p, "base64"));
    const decipher = createDecipheriv("aes-256-gcm", encKey(), iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
  } catch {
    return null;
  }
}

/** True when the sign-in is newer than the "session length" set in Settings. */
export async function sessionIsFresh(session) {
  const { getSettings } = await import("@/lib/settings");
  const minutes = parseInt((await getSettings()).sessionMinutes, 10) || 480;
  const at = session?.user?.loginAt;
  return !!at && Date.now() - at < minutes * 60 * 1000;
}
