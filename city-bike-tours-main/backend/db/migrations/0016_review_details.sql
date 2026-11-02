ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "tour" text;
--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "rider_origin" varchar(80);
--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "photo_url" text;
--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "stops" jsonb DEFAULT '[]'::jsonb NOT NULL;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "review_votes" (
  "review_id" text NOT NULL REFERENCES "reviews"("id") ON DELETE CASCADE,
  "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "review_votes_pk" PRIMARY KEY ("review_id","user_id")
);
