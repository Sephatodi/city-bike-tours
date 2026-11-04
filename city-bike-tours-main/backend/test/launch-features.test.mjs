import assert from "node:assert/strict";
import test from "node:test";
import { deliverEmail } from "../lib/email-delivery.js";
import { bookingPriceTotal, canCancelBooking } from "../lib/booking-lifecycle.js";
import { formatGaboroneDate, gaboroneDateTime } from "../lib/time.js";
import { renderEmailTemplate } from "../lib/email-templates.js";
import { getPaymentProvider } from "../lib/payments/index.js";

test("Resend delivery posts the message and reports provider errors", async () => {
  let request;
  const config = { provider: "resend", from: "City Bike Tours <bookings@example.com>", resendKey: "test-key", smtp: {} };
  const message = { to: "rider@example.com", subject: "Ride", html: "<p>Ride</p>", text: "Ride", replyTo: "help@example.com" };
  const success = await deliverEmail(config, message, {
    fetchImpl: async (url, options) => {
      request = { url, options };
      return new Response(null, { status: 202 });
    },
  });
  assert.deepEqual(success, { status: "sent", error: null });
  assert.equal(request.url, "https://api.resend.com/emails");
  assert.equal(request.options.headers.Authorization, "Bearer test-key");
  assert.deepEqual(JSON.parse(request.options.body).to, ["rider@example.com"]);

  const failed = await deliverEmail(config, message, {
    fetchImpl: async () => new Response("provider unavailable", { status: 503 }),
  });
  assert.equal(failed.status, "failed");
  assert.match(failed.error, /503/);
});

test("invalid and blank email recipients are skipped without a network send", async () => {
  let sends = 0;
  const config = { provider: "resend", from: "bookings@example.com", resendKey: "test-key", smtp: {} };
  for (const to of ["26771234567@phone.citybiketours.invalid", ""]) {
    const result = await deliverEmail(config, { to, subject: "", html: "", text: "" }, {
      fetchImpl: async () => { sends += 1; return new Response(null, { status: 202 }); },
    });
    assert.equal(result.status, "skipped");
  }
  assert.equal(sends, 0);
});

test("branded email templates escape user text and provide a text alternative", () => {
  const rendered = renderEmailTemplate("bookingReceived", {
    name: '<img src=x onerror="alert(1)">',
    date: "Wednesday, 4 November 2026",
    guests: 2,
  }, { contactEmail: "help@example.com", siteName: "City Bike Tours" });
  assert.ok(rendered.html.includes("&lt;img src=x onerror=&quot;alert(1)&quot;&gt;"));
  assert.ok(!rendered.html.includes('<img src=x onerror="alert(1)">'));
  assert.ok(rendered.text.includes("City Bike Tours"));
  assert.ok(rendered.text.includes("Wednesday, 4 November 2026"));
});

test("booking totals and cancellation windows use Gaborone ride times", () => {
  assert.equal(bookingPriceTotal(250, 2), "500.00");
  const rideStart = gaboroneDateTime("2030-01-01", "09:00").getTime();
  assert.equal(canCancelBooking("confirmed", "2030-01-01", "09:00", 24, rideStart - 12 * 60 * 60 * 1000), false);
  assert.equal(canCancelBooking("pending", "2030-01-01", "09:00", 24, rideStart - 48 * 60 * 60 * 1000), true);
  assert.equal(canCancelBooking("cancelled", "2030-01-01", "09:00", 0, rideStart - 48 * 60 * 60 * 1000), false);
  assert.match(formatGaboroneDate("2030-01-01"), /1 January 2030/);
});

test("manual payment provider records payment metadata without a gateway", async () => {
  const payment = await getPaymentProvider().record({ method: "cash", amount: 250, reference: "receipt-1" });
  assert.deepEqual(payment, { provider: "manual", method: "cash", amount: 250, reference: "receipt-1" });
});
