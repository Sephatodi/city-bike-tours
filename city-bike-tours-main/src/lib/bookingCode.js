export const BOOKING_CODE_KEY = "cb_booking_code";
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
export function generateBookingCode() {
  const c = globalThis.crypto;
  const bytes = new Uint8Array(6);
  if (c?.getRandomValues) c.getRandomValues(bytes);
  else for (let i = 0; i < 6; i++) bytes[i] = Math.floor(Math.random() * 256);
  const d = ((bytes[0] << 8 | bytes[1]) % 9000) + 1000;
  const l1 = ALPHABET[bytes[2] % 26];
  const l2 = ALPHABET[bytes[3] % 26];
  return `${d}${l1}${l2}`;
}
// No-op: booking codes are issued by the server and should not be persisted in the browser.
export function saveBookingCode() {}
export function readBookingCode() { return ""; }
