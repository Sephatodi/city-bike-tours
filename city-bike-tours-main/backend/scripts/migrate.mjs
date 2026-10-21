import dotenv from "dotenv";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";
import { fileURLToPath } from "node:url";
import { getDatabaseUrl } from "../lib/database-url.js";

dotenv.config({ path: fileURLToPath(new URL("../.env", import.meta.url)) });

const databaseUrl = getDatabaseUrl();

if (!databaseUrl) {
  throw new Error("Set NEON_DATABASE_URL on Replit before running migrations.");
}

const db = drizzle(neon(databaseUrl));
const migrationsFolder = fileURLToPath(new URL("../db/migrations", import.meta.url));

try {
  await migrate(db, { migrationsFolder });
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
