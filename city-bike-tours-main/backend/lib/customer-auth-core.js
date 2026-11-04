import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";

const TOKEN_DAYS = 30;
const TOKEN_MAX_AGE = TOKEN_DAYS * 24 * 60 * 60;
const HANDOFF_TTL = 2 * 60 * 1000;
const usedHandoffs = new Map();

const secret = () => {
  const value = process.env.CUSTOMER_TOKEN_SECRET;
  if (!value) throw new Error("CUSTOMER_TOKEN_SECRET must be set.");
  return value;
};
const b64 = (value) => Buffer.from(value).toString("base64url");
const sign = (body) => createHmac("sha256", secret()).update(body).digest("base64url");

export function resolveCustomerCookie(nodeEnv = process.env.NODE_ENV) {
  const secure = nodeEnv === "production";
  return {
    name: secure ? "__Host-cbt-customer" : "cbt-customer",
    options: {
      httpOnly: true,
      secure,
      sameSite: "lax",
      path: "/",
      maxAge: TOKEN_MAX_AGE,
    },
  };
}

export const CUSTOMER_COOKIE = resolveCustomerCookie().name;

export function setCustomerCookie(response, token) {
  const { name, options } = resolveCustomerCookie();
  response.cookies.set(name, token, options);
  return response;
}

export function clearCustomerCookie(response) {
  const { name, options } = resolveCustomerCookie();
  response.cookies.set(name, "", { ...options, maxAge: 0 });
  return response;
}

export function issueCustomerToken(userId) {
  const iat = Date.now();
  const body = b64(JSON.stringify({ typ: "customer", uid: userId, iat, exp: iat + TOKEN_MAX_AGE * 1000 }));
  return `${body}.${sign(body)}`;
}

export function issueCustomerHandoff(userId) {
  const iat = Date.now();
  const body = b64(JSON.stringify({
    typ: "handoff",
    uid: userId,
    iat,
    exp: iat + HANDOFF_TTL,
    jti: randomUUID(),
  }));
  return `${body}.${sign(body)}`;
}

function readSignedPayload(token) {
  const parts = String(token || "").split(".");
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
  const [body, signature] = parts;
  const expected = Buffer.from(sign(body));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString());
    return payload && typeof payload === "object" && payload.exp > Date.now() ? payload : null;
  } catch {
    return null;
  }
}

export function verifyCustomerToken(token) {
  const payload = readSignedPayload(token);
  return payload?.typ === "customer" && payload.uid ? payload : null;
}

export function verifyCustomerHandoff(token) {
  const payload = readSignedPayload(token);
  if (payload?.typ !== "handoff" || !payload.uid || !payload.jti) return null;
  const now = Date.now();
  for (const [jti, expiresAt] of usedHandoffs) {
    if (expiresAt <= now) usedHandoffs.delete(jti);
  }
  if (usedHandoffs.has(payload.jti)) return null;
  // This per-instance Set is defense in depth, not a distributed single-use guarantee.
  usedHandoffs.set(payload.jti, payload.exp);
  return payload;
}

function readCustomerCookie(request) {
  const { name } = resolveCustomerCookie();
  const value = request.cookies?.get(name);
  if (typeof value === "string") return value;
  if (value?.value) return value.value;
  const cookieHeader = request.headers.get("cookie") || "";
  for (const cookie of cookieHeader.split(";")) {
    const separator = cookie.indexOf("=");
    if (separator >= 0 && cookie.slice(0, separator).trim() === name) {
      return cookie.slice(separator + 1).trim();
    }
  }
  return "";
}

export function isValidCustomerSession(user, payload, expectedType = "customer") {
  const issuedAt = Number(payload?.iat) || Number(payload?.exp) - TOKEN_MAX_AGE * 1000;
  return Boolean(user
    && payload?.typ === expectedType
    && user.role === "customer"
    && user.status === "active"
    && !(user.passwordChangedAt && issuedAt < new Date(user.passwordChangedAt).getTime()));
}

export async function authenticateCustomer(request, findUser) {
  const payload = verifyCustomerToken(readCustomerCookie(request));
  if (!payload) return null;
  const user = await findUser(payload.uid);
  return isValidCustomerSession(user, payload) ? user : null;
}
