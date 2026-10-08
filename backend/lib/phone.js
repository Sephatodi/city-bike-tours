import { parsePhoneNumber } from "awesome-phonenumber";

export function normalizePhone(raw) {
  const input = String(raw ?? "").trim();
  if (!input) return "";
  const parsed = parsePhoneNumber(input, { regionCode: "BW" });
  return parsed.valid ? parsed.number.e164 : "";
}

export const isE164 = (p) => /^\+[1-9]\d{7,14}$/.test(p);
