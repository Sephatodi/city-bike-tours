import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { configuredFrontendOrigins, isAllowedFrontendOrigin } from "@/lib/origins";

import { authenticateCustomer, isValidCustomerSession } from "./customer-auth-core.js";

export {
  CUSTOMER_COOKIE,
  clearCustomerCookie,
  issueCustomerHandoff,
  issueCustomerToken,
  resolveCustomerCookie,
  setCustomerCookie,
  verifyCustomerHandoff,
  verifyCustomerToken,
} from "./customer-auth-core.js";


export const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email?.endsWith("@phone.citybiketours.invalid") ? null : user.email,
  phone: user.phone || null,
  image: user.image || null,
  provider: user.provider,
});

export async function requireCustomer(request) {
  const user = await authenticateCustomer(request, async (id) => {
    const [found] = await db.select().from(users).where(eq(users.id, id));
    return found;
  });
  if (!user) return { error: NextResponse.json({ error: "Please sign in to continue." }, { status: 401 }) };
  return { user };
}

export async function optionalCustomer(request) {
  const result = await requireCustomer(request);
  return { user: result.user || null };
}

export function frontendOrigins() {
  return configuredFrontendOrigins();
}

export function isAllowedCustomerReturnOrigin(origin) {
  return isAllowedFrontendOrigin(origin);
}

export function isValidCustomerHandoffUser(user, handoff) {
  return isValidCustomerSession(user, handoff, "handoff");
}
