CREATE TABLE IF NOT EXISTS "admin_activation_codes" (
  "id" text PRIMARY KEY,
  "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "code_hash" text NOT NULL,
  "expires_at" timestamptz NOT NULL,
  "used_at" timestamptz,
  "created_by" text REFERENCES "users"("id") ON DELETE SET NULL,
  "created_at" timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "admin_activation_codes_user_idx" ON "admin_activation_codes" ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "admin_activation_codes_expires_at_idx" ON "admin_activation_codes" ("expires_at");
