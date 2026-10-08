import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;

export const db = databaseUrl
  ? drizzle(neon(databaseUrl), { schema })
  : new Proxy({}, {
      get() {
        throw new Error("DATABASE_URL must be configured before database queries can run.");
      },
    });
