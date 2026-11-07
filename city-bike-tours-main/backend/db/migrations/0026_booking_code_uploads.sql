ALTER TABLE "community_photos" ALTER COLUMN "user_id" DROP NOT NULL;
--> statement-breakpoint
ALTER TABLE "community_photos" ADD COLUMN IF NOT EXISTS "booking_id" text;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "community_photos" ADD CONSTRAINT "community_photos_booking_id_fk"
    FOREIGN KEY ("booking_id") REFERENCES "website_booking_requests"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "community_photos_booking_id_idx" ON "community_photos" ("booking_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "community_booking_upload_usage" (
  "booking_id" text PRIMARY KEY REFERENCES "website_booking_requests"("id") ON DELETE CASCADE,
  "upload_count" integer NOT NULL DEFAULT 0
);
