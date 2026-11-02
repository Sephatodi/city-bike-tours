ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "managed_auth_id" text;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'users_managed_auth_id_unique'
      AND conrelid = 'public.users'::regclass
  ) AND to_regclass('public.users_managed_auth_id_unique') IS NULL THEN
    ALTER TABLE "users"
      ADD CONSTRAINT "users_managed_auth_id_unique" UNIQUE ("managed_auth_id");
  END IF;
END $$;
