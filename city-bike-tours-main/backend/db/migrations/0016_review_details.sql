ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "tour" text;
--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "rider_origin" text;
--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "photo_url" text;
--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "stops" jsonb;
--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "highlights" jsonb;
