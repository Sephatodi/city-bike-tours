import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

// Reuse the pool across hot reloads in dev so we don't open a new one on
// every file save (Next.js re-evaluates modules on each edit in dev mode).
// Deliberately does NOT throw if DATABASE_URL is missing at import time —
// `pg` connects lazily on the first query, so `next build` (which bundles
// this module without executing any queries) still succeeds even before
// you've configured a database. The first real query fails naturally, with
// a clear connection error, once you actually hit an API route.
const globalForDb = globalThis;

const pool =
  globalForDb.__kgalePool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes("sslmode=require") ? { rejectUnauthorized: false } : undefined,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__kgalePool = pool;
}

export const db = drizzle(pool, { schema });
