ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "activation_code_hash" text,
  ADD COLUMN IF NOT EXISTS "activation_code_expires_at" timestamptz,
  ADD COLUMN IF NOT EXISTS "activation_required" boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "activation_attempts" integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "linked_google_email" text;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_activation_required_idx" ON "users" ("activation_required");
