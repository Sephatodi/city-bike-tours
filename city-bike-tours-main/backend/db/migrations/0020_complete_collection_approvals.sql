ALTER TABLE "site_content" ADD COLUMN IF NOT EXISTS "include_in_collection" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "community_photos" ADD COLUMN IF NOT EXISTS "include_in_collection" boolean DEFAULT false NOT NULL;
