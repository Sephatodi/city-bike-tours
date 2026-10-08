import "dotenv/config";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const name = process.env.ADMIN_NAME?.trim() || "Tour Administrator";
const password = process.env.ADMIN_PASSWORD;

if (!email || !password || password.length < 12) {
  console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD (at least 12 characters) before provisioning.");
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes("sslmode=require") ? { rejectUnauthorized: false } : undefined,
});

try {
  const passwordHash = await bcrypt.hash(password, 12);
  await pool.query(
    `INSERT INTO users (id, name, email, password_hash, provider, role)
     VALUES ($1, $2, $3, $4, 'credentials', 'admin')
     ON CONFLICT (email) DO UPDATE
       SET name = EXCLUDED.name, password_hash = EXCLUDED.password_hash, role = 'admin'`,
    [randomUUID(), name, email, passwordHash]
  );
  console.log("Administrator account provisioned.");
} catch (error) {
  console.error("Administrator provisioning failed:", error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}