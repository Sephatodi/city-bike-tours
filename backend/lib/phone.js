// Normalises Botswana-style input ("+267 71 234 567", "71234567", "0026771234567") to E.164 where possible.
export function normalizePhone(raw) {
  let p = String(raw ?? "").replace(/[\s\-().]/g, "");
  if (p.startsWith("00")) p = `+${p.slice(2)}`;
  if (/^267\d{8}$/.test(p)) p = `+${p}`;
  if (/^7\d{7}$/.test(p)) p = `+267${p}`;
  return p;
}

export const isE164 = (p) => /^\+[1-9]\d{7,14}$/.test(p);
