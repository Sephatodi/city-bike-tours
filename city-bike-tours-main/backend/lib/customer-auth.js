import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { configuredFrontendOrigins } from "@/lib/origins";

const TOKEN_DAYS = 30;

const secret = () => {
  const value = process.env.CUSTOMER_TOKEN_SECRET || process.env.NEXTAUTH_SECRET || process.env.SESSION_SECRET;
  if (!value) throw new Error("SESSION_SECRET (or NEXTAUTH_SECRET / CUSTOMER_TOKEN_SECRET) must be set.");
  return value;
};
const b64 = (value) => Buffer.from(value).toString("base64url");
const sign = (body) => createHmac("sha256", secret()).update(body).digest("base64url");

export function issueCustomerToken(userId) {
  const body = b64(JSON.stringify({ uid: userId, exp: Date.now() + TOKEN_DAYS * 86400000 }));
  return `${body}.${sign(body)}`;
}

function readToken(token) {
  const [body, signature] = String(token || "").split(".");
  if (!body || !signature) return null;
  const expected = Buffer.from(sign(body));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString());
    return payload.uid && payload.exp > Date.now() ? payload : null;
  } catch {
    return null;
  }
}

export const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email?.endsWith("@phone.citybiketours.invalid") ? null : user.email,
  phone: user.phone || null,
  image: user.image || null,
  provider: user.provider,
});

export async function requireCustomer(request) {
  const header = request.headers.get("authorization") || "";
  const payload = readToken(header.startsWith("Bearer ") ? header.slice(7) : "");
  if (!payload) return { error: NextResponse.json({ error: "Please sign in to continue." }, { status: 401 }) };
  const [user] = await db.select().from(users).where(eq(users.id, payload.uid));
  if (!user || user.status !== "active") {
    return { error: NextResponse.json({ error: "Please sign in to continue." }, { status: 401 }) };
  }
  return { user };
}

export async function optionalCustomer(request) {
  const result = await requireCustomer(request);
  return { user: result.user || null };
}

export function frontendOrigins() {
  return configuredFrontendOrigins();
}
