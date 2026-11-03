ALTER TABLE "website_booking_requests"
  ADD COLUMN IF NOT EXISTS "confirmation_code" text;
--> statement-breakpoint

CREATE UNIQUE INDEX IF NOT EXISTS "website_booking_requests_confirmation_code_unique"
  ON "website_booking_requests" ("confirmation_code");
