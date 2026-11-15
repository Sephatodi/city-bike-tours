CREATE TABLE IF NOT EXISTS "pending_registrations" (
  "id" text PRIMARY KEY,
  "name" text NOT NULL,
  "email" text NOT NULL,
  "phone" text NOT NULL,
  "password_hash" text NOT NULL,
  "channel" text NOT NULL,
  "code_hash" text NOT NULL,
  "attempts" integer NOT NULL DEFAULT 0,
  "expires_at" timestamptz NOT NULL,
  "consumed_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pending_registrations_email_idx" ON "pending_registrations" ("email");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pending_registrations_phone_idx" ON "pending_registrations" ("phone");