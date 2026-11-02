CREATE TABLE IF NOT EXISTS "review_votes" (
  "review_id" text NOT NULL REFERENCES "reviews"("id") ON DELETE CASCADE,
  "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  PRIMARY KEY ("review_id", "user_id")
);
