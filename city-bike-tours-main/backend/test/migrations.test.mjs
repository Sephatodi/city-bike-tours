import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import test from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { readMigrationFiles } from "drizzle-orm/migrator";

const backendDirectory = dirname(dirname(fileURLToPath(import.meta.url)));
const migrationsFolder = join(backendDirectory, "db", "migrations");
const journalPath = join(migrationsFolder, "meta", "_journal.json");

test("registered migrations load and are repeatable in PGlite", async () => {
  const journal = JSON.parse(await readFile(journalPath, "utf8"));
  const migrations = readMigrationFiles({ migrationsFolder });
  assert.equal(migrations.length, journal.entries.length);
  assert.ok(journal.entries.some((entry) => entry.tag === "0025_launch_features"));

  const postgres = new PGlite();
  try {
    for (let pass = 0; pass < 2; pass += 1) {
      for (const [index, migration] of migrations.entries()) {
        for (const query of migration.sql) {
          try {
            await postgres.exec(query);
          } catch (error) {
            throw new Error(`Pass ${pass + 1}, migration ${journal.entries[index].tag}: ${error.message}`);
          }
        }
      }
    }
    const result = await postgres.query("SELECT COUNT(*)::int AS count FROM email_logs");
    assert.equal(result.rows[0].count, 0);
  } finally {
    await postgres.close();
  }
});
