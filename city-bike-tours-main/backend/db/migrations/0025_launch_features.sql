ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "password_changed_at" timestamptz;
--> statement-breakpoint

ALTER TABLE "website_booking_requests"
  ADD COLUMN IF NOT EXISTS "user_id" text REFERENCES "users"("id") ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS "price_total" numeric(10, 2),
  ADD COLUMN IF NOT EXISTS "payment_status" text NOT NULL DEFAULT 'unpaid',
  ADD COLUMN IF NOT EXISTS "payment_method" text,
  ADD COLUMN IF NOT EXISTS "payment_amount" numeric(10, 2),
  ADD COLUMN IF NOT EXISTS "payment_reference" text,
  ADD COLUMN IF NOT EXISTS "paid_at" timestamptz,
  ADD COLUMN IF NOT EXISTS "reminder_sent_at" timestamptz,
  ADD COLUMN IF NOT EXISTS "cancelled_at" timestamptz,
  ADD COLUMN IF NOT EXISTS "cancelled_by" text,
  ADD COLUMN IF NOT EXISTS "cancel_reason" text;
--> statement-breakpoint
ALTER TABLE "website_booking_requests" ALTER COLUMN "phone" DROP NOT NULL;
--> statement-breakpoint

ALTER TABLE "bookings" DROP CONSTRAINT IF EXISTS "bookings_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "bookings"
  ADD CONSTRAINT "bookings_user_id_users_id_fk"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL;
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "email_logs" (
  "id" serial PRIMARY KEY,
  "to_address" text NOT NULL,
  "subject" text NOT NULL,
  "template" text,
  "status" text NOT NULL,
  "error" text,
  "related_type" text,
  "related_id" text,
  "created_at" timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "website_booking_requests_user_id_idx"
  ON "website_booking_requests" ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "website_booking_requests_reminder_due_idx"
  ON "website_booking_requests" ("ride_date", "status", "reminder_sent_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "email_logs_created_at_idx"
  ON "email_logs" ("created_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "email_logs_related_type_created_at_idx"
  ON "email_logs" ("related_type", "created_at");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "password_reset_tokens" (
  "id" text PRIMARY KEY,
  "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "token_hash" text NOT NULL,
  "expires_at" timestamptz NOT NULL,
  "used_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "request_ip" text
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "password_reset_tokens_user_id_idx"
  ON "password_reset_tokens" ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "password_reset_tokens_expiry_idx"
  ON "password_reset_tokens" ("expires_at");
