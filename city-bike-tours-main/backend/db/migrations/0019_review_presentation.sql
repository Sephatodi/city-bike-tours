ALTER TABLE reviews ADD COLUMN IF NOT EXISTS headline text;
--> statement-breakpoint
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS featured boolean NOT NULL DEFAULT false;
--> statement-breakpoint
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS show_avatar boolean NOT NULL DEFAULT false;
