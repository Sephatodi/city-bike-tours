import { NextResponse } from "next/server";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { count, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { bookingRequests, bookings, enquiries, pageViews, siteContent, users } from "@/db/schema";
import { requirePermission } from "@/lib/rbac";
import { getDatabaseUrl } from "@/lib/database-url";

export const dynamic = "force-dynamic";

async function timed(fn) {
  const t = Date.now();
  try { await fn(); return { ok: true, ms: Date.now() - t }; } catch (e) { return { ok: false, ms: Date.now() - t, error: e.message }; }
}

export async function GET() {
  const guard = await requirePermission("system:read");
  if (guard.error) return guard.error;

  const ping = await timed(() => db.execute(sql`select 1`));
  const tables = {};
  const queries = { users, bookings, bookingRequests, siteContent, enquiries, pageViews };
  const queryTime = await timed(async () => {
    for (const [name, table] of Object.entries(queries)) tables[name] = Number((await db.select({ n: count() }).from(table))[0]?.n ?? 0);
  });

  let pkg = { dependencies: {}, devDependencies: {} };
  try { pkg = JSON.parse(readFileSync(join(process.cwd(), "package.json"), "utf8")); } catch { /* keep empty */ }
  const installed = (name) => { try { return JSON.parse(readFileSync(join(process.cwd(), "node_modules", name, "package.json"), "utf8")).version; } catch { return null; } };
  const dependencies = Object.entries({ ...pkg.dependencies }).map(([name, wanted]) => ({ name, wanted, installed: installed(name) }));

  const has = (k) => !!process.env[k];
  return NextResponse.json({
    checkedAt: new Date().toISOString(),
    database: { ...ping, queryMs: queryTime.ms, queryOk: queryTime.ok },
    tables,
    services: [
      { name: "Database (Neon)", ok: Boolean(getDatabaseUrl()) },
      { name: "Sign-in secret", ok: has("NEXTAUTH_SECRET") },
      { name: "WhatsApp click-to-chat (wa.me)", ok: true },
      { name: "File uploads (Vercel Blob)", ok: has("BLOB_READ_WRITE_TOKEN") },
      { name: "AI article drafts", ok: has("ANTHROPIC_API_KEY") || has("OPENAI_API_KEY"), optional: true },
      { name: "Public backend address", ok: has("PUBLIC_BACKEND_URL") },
    ],
    runtime: { node: process.version, next: installed("next"), uptimeSeconds: Math.round(process.uptime()), region: process.env.VERCEL_REGION || null },
    dependencies,
  });
}
