ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "managed_auth_id" text;
--> statement-breakpoint
DO $$
BEGIN
  ALTER TABLE "users"
    ADD CONSTRAINT "users_managed_auth_id_unique" UNIQUE ("managed_auth_id");
EXCEPTION
  WHEN duplicate_object OR duplicate_table THEN NULL;
END $$;
