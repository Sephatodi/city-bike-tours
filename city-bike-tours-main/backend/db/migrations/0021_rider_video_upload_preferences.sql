ALTER TABLE "community_photos" ADD COLUMN IF NOT EXISTS "media_type" text DEFAULT 'image' NOT NULL;--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "community_upload_usage" (
	"user_id" text PRIMARY KEY NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
	"upload_count" integer DEFAULT 0 NOT NULL
);--> statement-breakpoint
INSERT INTO "community_upload_usage" ("user_id", "upload_count")
SELECT "user_id", count(*)::integer
FROM "community_photos"
GROUP BY "user_id"
ON CONFLICT ("user_id") DO UPDATE SET "upload_count" = EXCLUDED."upload_count";
