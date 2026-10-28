import dotenv from "dotenv";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";
import { getDatabaseUrl } from "../lib/database-url.js";

dotenv.config({ path: fileURLToPath(new URL("../.env", import.meta.url)) });

const databaseUrl = getDatabaseUrl();
if (!databaseUrl) {
  throw new Error("Set NEON_DATABASE_URL or DATABASE_URL before running migrations.");
}

const sql = neon(databaseUrl);
const db = drizzle(sql);
const migrationsFolder = fileURLToPath(new URL("../db/migrations", import.meta.url));

try {
  // Safe compatibility migration for existing production databases. Additive and repeatable.
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS managed_auth_id text`;
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS users_managed_auth_id_unique ON users (managed_auth_id) WHERE managed_auth_id IS NOT NULL`;
  const journal = fileURLToPath(new URL("../db/migrations/meta/_journal.json", import.meta.url));
  if (existsSync(journal)) {
    await migrate(db, { migrationsFolder });
  } else {
    console.log("No Drizzle migration journal found; applied the managed_auth_id compatibility migration only.");
  }
  console.log("Database migrations applied successfully.");
} catch (error) {
  console.error("Database migration failed:", error.message);
  if (error.cause instanceof Error) {
    console.error("Connection cause:", error.cause.name, error.cause.message);
    if ("code" in error.cause && typeof error.cause.code === "string") {
      console.error("Connection error code:", error.cause.code);
    }
  }
  process.exitCode = 1;
}
