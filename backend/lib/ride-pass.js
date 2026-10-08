import { createHmac, timingSafeEqual } from "node:crypto";

function getSecret() {
  const secret = process.env.RIDE_PASS_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("Set RIDE_PASS_SECRET or NEXTAUTH_SECRET to issue ride passes.");
  return secret;
}

export function createRidePassToken(bookingId, bookingType = "request") {
  const encodedId = Buffer.from(`${bookingType}:${bookingId}`).toString("base64url");
  const signature = createHmac("sha256", getSecret()).update(encodedId).digest("base64url");
  return `${encodedId}.${signature}`;
}

export function verifyRidePassToken(token) {
  if (typeof token !== "string") return null;
  const [encodedId, signature, extra] = token.split(".");
  if (!encodedId || !signature || extra || !/^[A-Za-z0-9_-]+$/.test(encodedId)) return null;

  let expected;
  try {
    expected = createHmac("sha256", getSecret()).update(encodedId).digest();
  } catch {
    return null;
  }

  let supplied;
  try {
    supplied = Buffer.from(signature, "base64url");
  } catch {
    return null;
  }
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return null;

  try {
    const decoded = Buffer.from(encodedId, "base64url").toString();
    const separator = decoded.indexOf(":");
    const bookingType = decoded.slice(0, separator);
    const bookingId = decoded.slice(separator + 1);
    if (separator < 1 || !["request", "booking"].includes(bookingType) || !bookingId) return null;
    return { id: bookingId, type: bookingType };
  } catch {
    return null;
  }
}

export function createRidePassUrl(token, requestUrl) {
  const frontendOrigin = (process.env.PUBLIC_FRONTEND_URL || process.env.FRONTEND_ORIGIN || "")
    .split(",")[0].trim().replace(/\/$/, "") || new URL(requestUrl).origin;
  return `${frontendOrigin}/ticket/${token}`;
}