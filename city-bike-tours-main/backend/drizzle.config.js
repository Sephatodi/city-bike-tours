import "dotenv/config";
import { getDatabaseUrl } from "./lib/database-url.js";

/** @type {import('drizzle-kit').Config} */
export default {
  schema: "./db/schema.js",
  out: "./db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: getDatabaseUrl(),
  },
};
