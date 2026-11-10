import { createHmac, randomInt, timingSafeEqual } from "node:crypto";
import bcrypt from "bcryptjs";

const ACTIVATION_SECRET = process.env.NEXTAUTH_SECRET || process.env.SESSION_SECRET || "";

export function generateActivationCode() {
  return String(randomInt(0, 1000000)).padStart(6, "0");
}

export async function hashActivationCode(code) {
  return bcrypt.hash(String(code), 10);
}

export async function verifyActivationCode(code, hash) {
  if (!code || !hash) return false;
  return bcrypt.compare(String(code), hash);
}

export function activationExpiry() {
  return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
}

export const ACTIVATION_MAX_ATTEMPTS = 8;

function b64url(input) {
  return Buffer.from(input).toString("base64url");
}
function fromB64url(input) {
  return Buffer.from(String(input), "base64url").toString("utf8");
}
function sign(data) {
  if (!ACTIVATION_SECRET) throw new Error("Activation signing is not configured.");
  return createHmac("sha256", ACTIVATION_SECRET).update(data).digest("base64url");
}

export function createActivationToken(userId) {
  const payload = JSON.stringify({ sub: userId, purpose: "admin-activation", exp: Date.now() + 15 * 60 * 1000 });
  const body = b64url(payload);
  return `${body}.${sign(body)}`;
}

export function verifyActivationToken(token) {
  if (!ACTIVATION_SECRET || typeof token !== "string") return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = sign(body);
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch { return null; }
  try {
    const payload = JSON.parse(fromB64url(body));
    if (payload?.purpose !== "admin-activation" || !payload?.sub) return null;
    if (!payload.exp || Date.now() > payload.exp) return null;
    return payload;
  } catch { return null; }
}
