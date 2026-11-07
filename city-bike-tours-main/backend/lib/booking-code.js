import { randomInt } from "node:crypto";
import { and, eq, isNull } from "drizzle-orm";
import { bookingRequests } from "@/db/schema";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
export const BOOKING_CODE_RE = /^\d{4}[A-Z]{2}$/;

export function normalizeBookingCode(input) {
  const code = String(input || "")
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "");
  return BOOKING_CODE_RE.test(code) ? code : "";
}

export function generateBookingCode() {
  const digits = String(randomInt(0, 10000)).padStart(4, "0");
  const letters = `${LETTERS[randomInt(0, LETTERS.length)]}${LETTERS[randomInt(0, LETTERS.length)]}`;
  return `${digits}${letters}`;
}

export async function getOrCreateBookingCode(db, bookingRequestId) {
  const [existing] = await db.select({ code: bookingRequests.confirmationCode })
    .from(bookingRequests)
    .where(eq(bookingRequests.id, bookingRequestId));
  if (!existing) throw new Error("Booking request not found while assigning its confirmation code.");
  if (existing.code) return normalizeBookingCode(existing.code) || existing.code;

  for (let attempt = 0; attempt < 12; attempt += 1) {
    try {
      const [updated] = await db.update(bookingRequests)
        .set({ confirmationCode: generateBookingCode() })
        .where(and(eq(bookingRequests.id, bookingRequestId), isNull(bookingRequests.confirmationCode)))
        .returning({ code: bookingRequests.confirmationCode });
      if (updated?.code) return updated.code;

      const [current] = await db.select({ code: bookingRequests.confirmationCode })
        .from(bookingRequests)
        .where(eq(bookingRequests.id, bookingRequestId));
      if (current?.code) return normalizeBookingCode(current.code) || current.code;
      if (!current) throw new Error("Booking request not found while assigning its confirmation code.");
    } catch (error) {
      if ((error?.code || error?.cause?.code) !== "23505") throw error;
    }
  }

  throw new Error("Could not allocate a unique booking confirmation code.");
}
