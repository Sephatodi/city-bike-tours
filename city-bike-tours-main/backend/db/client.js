import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { getDatabaseUrl } from "../lib/database-url";
import * as schema from "./schema";

const databaseUrl = getDatabaseUrl();

export const db = databaseUrl
  ? drizzle(neon(databaseUrl), { schema })
  : new Proxy({}, {
      get() {
        throw new Error("Set NEON_DATABASE_URL or DATABASE_URL before running database queries.");
      },
    });
