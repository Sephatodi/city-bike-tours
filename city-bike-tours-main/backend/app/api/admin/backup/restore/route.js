import { NextResponse } from "next/server";
import { getTableColumns } from "drizzle-orm";
import { db } from "@/db/client";
import { bookingRequests, bookings, companyRoutesConfig, seoPages, siteContent, siteSettings } from "@/db/schema";
import { requirePermission } from "@/lib/rbac";
import { logAudit } from "@/lib/audit";

// What a restore does, table by table. "replace" overwrites rows with the same id; "add" only fills in rows that are missing.
const PLAN = [
  ["companyRoutesConfig", companyRoutesConfig, "routeId", "replace"],
  ["siteSettings", siteSettings, "key", "replace"],
  ["seoPages", seoPages, "path", "replace"],
  ["siteContent", siteContent, "id", "replace"],
  ["bookingRequests", bookingRequests, "id", "add"],
  ["bookings", bookings, "id", "add"],
];

function clean(table, row) {
  const columns = getTableColumns(table);
  const out = {};
  for (const [key, column] of Object.entries(columns)) {
    if (!(key in row)) continue;
    const value = row[key];
    out[key] = value != null && column.dataType === "date" ? new Date(value) : value;
  }
  return out;
}

export async function POST(request) {
  const guard = await requirePermission("backup:write");
  if (guard.error) return guard.error;

  const backup = await request.json().catch(() => null);
  if (backup?.app !== "city-bike-tours" || backup?.version !== 1 || typeof backup.tables !== "object") {
    return NextResponse.json({ error: "That isn't a City Bike Tours backup file." }, { status: 400 });
  }

  const report = {};
  for (const [name, table, key, mode] of PLAN) {
    const rows = Array.isArray(backup.tables[name]) ? backup.tables[name] : [];
    let done = 0; let skipped = 0;
    for (const raw of rows) {
      try {
        const values = clean(table, raw);
        if (!values[key]) { skipped++; continue; }
        const query = db.insert(table).values(values);
        if (mode === "replace") await query.onConflictDoUpdate({ target: table[key], set: values });
        else await query.onConflictDoNothing();
        done++;
      } catch {
        skipped++; // e.g. a booking whose account no longer exists
      }
    }
    report[name] = { done, skipped };
  }
  await logAudit(guard.staff, "backup.restore", "Restored data from a backup file", { targetType: "backup", detail: report });
  return NextResponse.json({ report });
}
