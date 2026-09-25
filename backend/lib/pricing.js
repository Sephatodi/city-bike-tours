import { ROUTES, SATURDAY_PRICING, LESSON_PRICE } from "./data";

/**
 * The single source of truth for what a booking costs. The client shows a
 * price for UX, but this function is what actually gets written to the DB.
 * Returns null for weekday/holiday rides, which are priced by a human when
 * the booking is confirmed (not a fixed rate) — matches BACKEND.md.
 */
export function computePrice({ category, routeId, isKid }) {
  if (category === "lesson") return LESSON_PRICE;

  if (category === "saturday") {
    if (isKid) return SATURDAY_PRICING.kids;
    const route = ROUTES.find((r) => r.id === routeId);
    if (!route) return null;
    return SATURDAY_PRICING[route.tier] ?? null;
  }

  // weekday / holiday — rate confirmed on booking, not auto-priced.
  return null;
}
