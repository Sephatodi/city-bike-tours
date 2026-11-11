import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL);
const a = await sql`SELECT email,success,reason,ip,created_at FROM login_attempts WHERE email='admin@citybike.com' ORDER BY id DESC LIMIT 20`;
console.log("ATTEMPTS:", JSON.stringify(a, null, 2));
const b = await sql`SELECT * FROM blocked_ips`;
console.log("BLOCKED:", JSON.stringify(b, null, 2));