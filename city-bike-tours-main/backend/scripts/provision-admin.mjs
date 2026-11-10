import "dotenv/config";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import { getDatabaseUrl } from "../lib/database-url.js";

const email = (process.env.ADMIN_EMAIL || "admin@citybike.com").trim().toLowerCase();
const name = (process.env.ADMIN_NAME || "Default Admin").trim() || "Default Admin";
const password = process.env.ADMIN_PASSWORD || "admin1@....";
const databaseUrl = getDatabaseUrl();

if (!email || !password || password.length < 8) {
  console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD (at least 8 characters) before provisioning.");
  process.exit(1);
}

if (!databaseUrl) {
  console.error("Set NEON_DATABASE_URL or DATABASE_URL before provisioning.");
  process.exit(1);
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: databaseUrl?.includes("sslmode=require") ? { rejectUnauthorized: false } : undefined,
});

try {
  const passwordHash = await bcrypt.hash(password, 12);
  await pool.query(
    `INSERT INTO users (
       id, name, email, password_hash, provider, role, status,
       activation_required, activation_code_hash, activation_code_expires_at, activation_attempts
     )
     VALUES ($1, $2, $3, $4, 'credentials', 'admin', 'active', false, NULL, NULL, 0)
     ON CONFLICT (email) DO UPDATE
       SET name = EXCLUDED.name,
           password_hash = EXCLUDED.password_hash,
           role = 'admin',
           status = 'active',
           activation_required = false,
           activation_code_hash = NULL,
           activation_code_expires_at = NULL,
           activation_attempts = 0`,
    [randomUUID(), name, email, passwordHash]
  );
  console.log(`Administrator account provisioned: ${email}`);
} catch (error) {
  console.error("Administrator provisioning failed:", error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
