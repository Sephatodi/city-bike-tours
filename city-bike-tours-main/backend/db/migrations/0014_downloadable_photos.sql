ALTER TABLE "site_content" ADD COLUMN IF NOT EXISTS "downloadable" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "community_photos" ADD COLUMN IF NOT EXISTS "downloadable" boolean DEFAULT false NOT NULL;
