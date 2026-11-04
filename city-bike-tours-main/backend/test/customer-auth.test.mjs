import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import test from "node:test";

process.env.CUSTOMER_TOKEN_SECRET = randomBytes(32).toString("base64url");
process.env.NODE_ENV = "test";

const {
  authenticateCustomer,
  clearCustomerCookie,
  issueCustomerHandoff,
  issueCustomerToken,
  isValidCustomerSession,
  resolveCustomerCookie,
  setCustomerCookie,
  verifyCustomerHandoff,
  verifyCustomerToken,
} = await import("../lib/customer-auth-core.js");
const { allowsProtectedMutationOrigin } = await import("../lib/origins.js");

function requestWithCookie(token) {
  const { name } = resolveCustomerCookie();
  return new Request("https://api.example.test/api/customer/me", {
    headers: { cookie: `${name}=${token}` },
  });
}

test("customer tokens and handoffs cannot be used as each other's credentials", () => {
  const customerToken = issueCustomerToken("rider-1");
  const handoff = issueCustomerHandoff("rider-1");
  assert.equal(verifyCustomerToken(customerToken)?.typ, "customer");
  assert.equal(verifyCustomerHandoff(customerToken), null);
  assert.equal(verifyCustomerToken(handoff), null);
  const handoffPayload = verifyCustomerHandoff(handoff);
  assert.equal(handoffPayload?.typ, "handoff");
  assert.equal(isValidCustomerSession({ role: "customer", status: "active" }, handoffPayload, "handoff"), true);
  assert.equal(verifyCustomerHandoff(handoff), null);
});

test("expired customer handoffs are rejected", () => {
  const originalNow = Date.now;
  try {
    Date.now = () => 1_000_000;
    const handoff = issueCustomerHandoff("rider-2");
    Date.now = () => 1_120_001;
    assert.equal(verifyCustomerHandoff(handoff), null);
  } finally {
    Date.now = originalNow;
  }
});

test("tampered customer token signatures are rejected", () => {
  const token = issueCustomerToken("rider-3");
  const replacement = token.endsWith("a") ? "b" : "a";
  assert.equal(verifyCustomerToken(`${token.slice(0, -1)}${replacement}`), null);
});

test("production customer cookie uses the required secure attributes", () => {
  const developmentCookie = resolveCustomerCookie("development");
  assert.equal(developmentCookie.name, "cbt-customer");
  assert.equal(developmentCookie.options.secure, false);

  const originalNodeEnv = process.env.NODE_ENV;
  const calls = [];
  const response = { cookies: { set: (...args) => calls.push(args) } };
  try {
    process.env.NODE_ENV = "production";
    setCustomerCookie(response, "signed-customer-token");
    clearCustomerCookie(response);
  } finally {
    if (originalNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = originalNodeEnv;
  }

  assert.equal(calls[0][0], "__Host-cbt-customer");
  assert.equal(calls[0][1], "signed-customer-token");
  assert.deepEqual(calls[0][2], {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
  });
  assert.equal("domain" in calls[0][2], false);
  assert.equal(calls[1][0], calls[0][0]);
  assert.equal(calls[1][2].maxAge, 0);
});

test("customer authentication rejects non-customer roles and tokens predating password changes", async () => {
  const token = issueCustomerToken("rider-4");
  const request = requestWithCookie(token);
  assert.equal(await authenticateCustomer(request, async () => ({
    id: "rider-4",
    role: "admin",
    status: "active",
  })), null);
  assert.equal(await authenticateCustomer(request, async () => ({
    id: "rider-4",
    role: "customer",
    status: "active",
    passwordChangedAt: new Date(Date.now() + 10_000),
  })), null);

  const bearerOnlyRequest = new Request("https://api.example.test/api/customer/me", {
    headers: { authorization: `Bearer ${token}` },
  });
  assert.equal(await authenticateCustomer(bearerOnlyRequest, async () => ({ role: "customer", status: "active" })), null);
});

test("mutating customer routes reject missing or foreign Origin headers", () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalFrontendOrigin = process.env.FRONTEND_ORIGIN;
  try {
    process.env.NODE_ENV = "production";
    process.env.FRONTEND_ORIGIN = "https://city-bike-tours.vercel.app";
    const missingOrigin = new Request("https://api.example.test/api/customer/login", { method: "POST" });
    const foreignOrigin = new Request("https://api.example.test/api/customer/login", {
      method: "POST",
      headers: { origin: "https://attacker.example" },
    });
    assert.equal(allowsProtectedMutationOrigin(missingOrigin), false);
    assert.equal(allowsProtectedMutationOrigin(foreignOrigin), false);
    assert.equal(allowsProtectedMutationOrigin(new Request("https://api.example.test/api/customer/login", {
      method: "POST",
      headers: { origin: "https://city-bike-tours.vercel.app" },
    })), true);
    assert.equal(allowsProtectedMutationOrigin(new Request("https://api.example.test/api/auth/signin", { method: "POST" })), true);
    assert.equal(allowsProtectedMutationOrigin(new Request("https://api.example.test/api/admin/users", { method: "POST" })), true);
  } finally {
    if (originalNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = originalNodeEnv;
    if (originalFrontendOrigin === undefined) delete process.env.FRONTEND_ORIGIN;
    else process.env.FRONTEND_ORIGIN = originalFrontendOrigin;
  }
});
