ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "tour" text;
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "rider_origin" text;
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "photo_url" text;
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "stops" jsonb;
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "highlights" jsonb;
