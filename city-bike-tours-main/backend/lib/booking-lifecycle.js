import { gaboroneDateTime } from "./time.js";

export function bookingPriceTotal(pricePerRider, riders) {
  return (Number(pricePerRider) * Number(riders)).toFixed(2);
}

export function canCancelBooking(status, rideDate, rideTime, cancellationHours = 24, now = Date.now()) {
  if (!["pending", "confirmed"].includes(status)) return false;
  const parsedHours = Number(cancellationHours);
  const hours = Number.isFinite(parsedHours) && parsedHours >= 0 ? parsedHours : 24;
  return gaboroneDateTime(rideDate, rideTime).getTime() - now > hours * 60 * 60 * 1000;
}
