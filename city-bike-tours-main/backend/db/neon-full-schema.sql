-- City Bike Tours backend database bootstrap for Neon PostgreSQL.
-- RUN ONLY against a NEW, EMPTY database. This replays all journaled
-- migrations in order; it is not safe to run over an existing production DB.
-- For an existing DB, use `npm run db:migrate` from backend/ instead.
-- The Drizzle journal records below prevent the app from replaying these migrations.

BEGIN;

CREATE SCHEMA IF NOT EXISTS "drizzle";
CREATE TABLE IF NOT EXISTS "drizzle"."__drizzle_migrations" (
  "id" serial PRIMARY KEY,
  "hash" text NOT NULL,
  "created_at" bigint
);

-- Migration 0000: 0000_stale_felicia_hardy
DO $$ BEGIN
 CREATE TYPE "public"."booking_category" AS ENUM('weekday', 'saturday', 'holiday', 'lesson');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "public"."booking_status" AS ENUM('confirmed', 'cancelled');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "public"."time_slot" AS ENUM('morning', 'evening');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "bookings" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"category" "booking_category" NOT NULL,
	"ride_date" text NOT NULL,
	"time_slot" "time_slot" NOT NULL,
	"route_id" text,
	"is_kid" boolean DEFAULT false NOT NULL,
	"price" numeric(8, 2),
	"status" "booking_status" DEFAULT 'confirmed' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text,
	"image" text,
	"provider" text DEFAULT 'credentials' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);

DO $$ BEGIN
 ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Migration 0001: 0001_booking_requests
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "phone" text;

-- Migration 0002: 0002_website_booking_requests
CREATE TABLE IF NOT EXISTS "website_booking_requests" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"route_id" text NOT NULL,
	"ride_date" text NOT NULL,
	"riders" integer NOT NULL,
	"notes" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Migration 0003: 0003_admin_dashboard_controls
CREATE TABLE IF NOT EXISTS "company_routes_config" (
	"route_id" text PRIMARY KEY NOT NULL,
	"route_name" text NOT NULL,
	"price_bwp" numeric(10, 2) NOT NULL,
	"schedule_slots" text NOT NULL
);

CREATE TABLE IF NOT EXISTS "site_content" (
	"id" serial PRIMARY KEY NOT NULL,
	"content_type" text NOT NULL,
	"title" text NOT NULL,
	"media_url" text,
	"body_text" text,
	"is_featured" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

INSERT INTO "company_routes_config" ("route_id", "route_name", "price_bwp", "schedule_slots") VALUES
	('heritage', 'Culture & Heritage Dash', 100.00, '05:00, 17:00'),
	('eco', 'Eco-Retail Explorer', 150.00, '05:00, 17:00'),
	('urban', 'Complete Urban Loop', 250.00, '05:00, 17:00')
ON CONFLICT ("route_id") DO NOTHING;

-- Migration 0004: 0004_user_admin_role
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "role" text DEFAULT 'customer' NOT NULL;

-- Migration 0005: 0005_frontend_routes_and_content_controls
ALTER TABLE "site_content" ADD COLUMN "is_published" boolean DEFAULT true NOT NULL;

-- The Vite site books these three route ids (src/data.js ROUTES_DATA). Prices/names/times mirror what
-- the site currently shows; edit them any time in Admin > Routes, prices & schedules.
-- (The legacy heritage/eco/urban rows are left in place for the old account-booking pages.)
INSERT INTO "company_routes_config" ("route_id", "route_name", "price_bwp", "schedule_slots") VALUES
	('complete', 'Complete Heritage Route', 250.00, '09:00, 14:00'),
	('loop', 'Casual Saturday', 150.00, '09:00'),
	('own', 'Your Own Route', 150.00, '09:00, 14:00')
ON CONFLICT ("route_id") DO NOTHING;

-- Migration 0006: 0006_magical_ink
ALTER TABLE "website_booking_requests" ADD COLUMN "checked_in_at" timestamp with time zone;

-- Migration 0007: 0007_stormy_virginia_dare
ALTER TABLE "bookings" ADD COLUMN "checked_in_at" timestamp with time zone;

-- Migration 0008: 0008_booking_confirmation_rotation
CREATE SEQUENCE IF NOT EXISTS public.booking_confirmation_template_seq AS bigint START WITH 1;

-- Migration 0009: 0009_motionless_lord_hawal
CREATE TABLE IF NOT EXISTS "infobip_sms_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"recipient" text NOT NULL,
	"message" text NOT NULL,
	"message_id" text,
	"status" text NOT NULL,
	"sent_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Migration 0010: 0010_handy_johnny_storm
ALTER TABLE "infobip_sms_logs" ADD COLUMN "booking_request_id" text;
ALTER TABLE "infobip_sms_logs" ADD COLUMN "booking_id" text;
ALTER TABLE "infobip_sms_logs" ADD COLUMN "provider" text DEFAULT 'infobip' NOT NULL;
ALTER TABLE "infobip_sms_logs" ADD COLUMN "channel" text DEFAULT 'sms' NOT NULL;
ALTER TABLE "infobip_sms_logs" ADD COLUMN "status_updated_at" timestamp with time zone DEFAULT now() NOT NULL;
DO $$ BEGIN
 ALTER TABLE "infobip_sms_logs" ADD CONSTRAINT "infobip_sms_logs_booking_request_id_website_booking_requests_id_fk" FOREIGN KEY ("booking_request_id") REFERENCES "public"."website_booking_requests"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "infobip_sms_logs" ADD CONSTRAINT "infobip_sms_logs_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Migration 0011: 0011_omniscient_shockwave
CREATE TABLE IF NOT EXISTS "audit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"actor_id" text,
	"actor_name" text NOT NULL,
	"actor_role" text NOT NULL,
	"action" text NOT NULL,
	"target_type" text,
	"target_id" text,
	"summary" text NOT NULL,
	"detail" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "site_settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" text NOT NULL,
	"updated_by" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE "users" ADD COLUMN "status" text DEFAULT 'active' NOT NULL;

-- Migration 0012: 0012_fast_polaris
CREATE TABLE IF NOT EXISTS "blocked_ips" (
	"ip" text PRIMARY KEY NOT NULL,
	"reason" text,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "enquiries" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"phone" text,
	"email" text,
	"subject" text,
	"message" text NOT NULL,
	"status" text DEFAULT 'new' NOT NULL,
	"staff_note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "login_attempts" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text,
	"ip" text,
	"success" boolean NOT NULL,
	"reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "page_views" (
	"id" serial PRIMARY KEY NOT NULL,
	"day" text NOT NULL,
	"path" text NOT NULL,
	"visitor" text NOT NULL,
	"referrer" text,
	"device" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "reviews" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"rating" integer NOT NULL,
	"comment" text NOT NULL,
	"ride_date" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "seo_pages" (
	"path" text PRIMARY KEY NOT NULL,
	"title" text,
	"description" text,
	"keywords" text,
	"noindex" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "subscribers" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text,
	"phone" text,
	"source" text,
	"status" text DEFAULT 'subscribed' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE "users" ADD COLUMN "team" text;
ALTER TABLE "users" ADD COLUMN "mfa_secret" text;
ALTER TABLE "users" ADD COLUMN "mfa_enabled" boolean DEFAULT false NOT NULL;

-- Migration 0013: 0013_customer_community
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "user_id" text;
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "admin_reply" text;
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "admin_reply_by" text;
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "admin_reply_at" timestamp with time zone;
CREATE TABLE IF NOT EXISTS "customer_messages" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
	"sender" text DEFAULT 'customer' NOT NULL,
	"sender_name" text,
	"body" text NOT NULL,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "customer_messages_user_idx" ON "customer_messages" ("user_id", "created_at");
CREATE TABLE IF NOT EXISTS "otp_codes" (
	"id" text PRIMARY KEY NOT NULL,
	"phone" text NOT NULL,
	"channel" text NOT NULL,
	"code_hash" text NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"consumed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "otp_codes_phone_idx" ON "otp_codes" ("phone", "created_at");
CREATE TABLE IF NOT EXISTS "community_photos" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
	"author_name" text NOT NULL,
	"title" text NOT NULL,
	"story" text,
	"image_url" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Migration 0014: 0014_downloadable_photos
ALTER TABLE "site_content" ADD COLUMN IF NOT EXISTS "downloadable" boolean DEFAULT false NOT NULL;
ALTER TABLE "community_photos" ADD COLUMN IF NOT EXISTS "downloadable" boolean DEFAULT false NOT NULL;

-- Migration 0015: 0015_managed_auth_identity
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "managed_auth_id" text;

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

-- Migration 0016: 0016_review_details
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "tour" text;

ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "rider_origin" varchar(80);

ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "photo_url" text;

ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "stops" jsonb DEFAULT '[]'::jsonb NOT NULL;

CREATE TABLE IF NOT EXISTS "review_votes" (
  "review_id" text NOT NULL REFERENCES "reviews"("id") ON DELETE CASCADE,
  "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "review_votes_pk" PRIMARY KEY ("review_id","user_id")
);

-- Migration 0017: 0017_community_photo_site
ALTER TABLE "community_photos" ADD COLUMN IF NOT EXISTS "site_id" text;

-- Migration 0018: 0018_review_vote_indexes
CREATE INDEX IF NOT EXISTS "review_votes_user_id_idx" ON "review_votes" ("user_id");

-- Migration 0019: 0019_review_presentation
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS headline text;

ALTER TABLE reviews ADD COLUMN IF NOT EXISTS featured boolean NOT NULL DEFAULT false;

ALTER TABLE reviews ADD COLUMN IF NOT EXISTS show_avatar boolean NOT NULL DEFAULT false;

-- Migration 0020: 0020_complete_collection_approvals
ALTER TABLE "site_content" ADD COLUMN IF NOT EXISTS "include_in_collection" boolean DEFAULT false NOT NULL;
ALTER TABLE "community_photos" ADD COLUMN IF NOT EXISTS "include_in_collection" boolean DEFAULT false NOT NULL;

-- Migration 0021: 0021_rider_video_upload_preferences
ALTER TABLE "community_photos" ADD COLUMN IF NOT EXISTS "media_type" text DEFAULT 'image' NOT NULL;
CREATE TABLE IF NOT EXISTS "community_upload_usage" (
	"user_id" text PRIMARY KEY NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
	"upload_count" integer DEFAULT 0 NOT NULL
);
INSERT INTO "community_upload_usage" ("user_id", "upload_count")
SELECT "user_id", count(*)::integer FROM "community_photos"
GROUP BY "user_id"
ON CONFLICT ("user_id") DO UPDATE SET "upload_count" = EXCLUDED."upload_count";

-- Migration 0022: 0022_rider_photo_visibility
ALTER TABLE "community_photos" ADD COLUMN IF NOT EXISTS "visibility" text DEFAULT 'public' NOT NULL;

-- Migration 0023: 0023_booking_confirmation_codes
ALTER TABLE "website_booking_requests" ADD COLUMN IF NOT EXISTS "confirmation_code" text;
CREATE UNIQUE INDEX IF NOT EXISTS "website_booking_requests_confirmation_code_unique"
  ON "website_booking_requests" ("confirmation_code");

-- Migration 0024: 0024_booking_request_email
ALTER TABLE "website_booking_requests" ADD COLUMN IF NOT EXISTS "email" text;

-- Mark all journaled migrations as applied so the app migrator will not replay them.
INSERT INTO "drizzle"."__drizzle_migrations" ("hash", "created_at") VALUES
  ('704633beae086a3b62e3c6243702f8a99bf1daa382dab35a63609037915678f0', 1788337777599), -- 0000_stale_felicia_hardy
  ('8c1ec4d742f43eceda56be64741f0c0ae74609dd320792490f4395d7a1dff924', 1790580992083), -- 0001_booking_requests
  ('417091edb12ebaefdfd34a4be866dada5e4e53c44ba502bacbde3d75974e5d4a', 1790581743350), -- 0002_website_booking_requests
  ('0da70032d15e2ffcc2be6bc7ac2fe51d5e8f64a5452ded2f08ec1ef29d62b55d', 1790582711573), -- 0003_admin_dashboard_controls
  ('67b71de6e1ce20977dbba89a6b0299c826c0f3c6d827c02030d41f9fcd78ce21', 1790583573322), -- 0004_user_admin_role
  ('148e5e1c29c432cbe4d10fd3d97bc63ca5427011b0860553b8002c374c906810', 1790898577993), -- 0005_frontend_routes_and_content_controls
  ('27fc89ad1a57f4c8d3a2592c789b9ed0ec408824d8430c200f041da73541af7a', 1791192218321), -- 0006_magical_ink
  ('55ea316d50eaac8e056386a6e85a35af2a0491329e2c130c6bf495af07d7e847', 1791192526969), -- 0007_stormy_virginia_dare
  ('3041b57216881023c4f1473c4b3a005141198976c44929db9a3fc580f6557dba', 1791489600000), -- 0008_booking_confirmation_rotation
  ('7270ea3ec546d78ff88b069bc48d86e3bb7cafc7a7abd5c1e8afe7c343f9a292', 1791534649500), -- 0009_motionless_lord_hawal
  ('f88fcfdfa87d2f304e33911a3cf180131b1717db6e575c03c4aaf92fc3262b4d', 1791536603643), -- 0010_handy_johnny_storm
  ('22c6f461bc492b20f9510eb08d7ee29952723ae4417a673ad09db76cf8fbdf7a', 1791798184729), -- 0011_omniscient_shockwave
  ('8bd41627449aa5ec8f44f049784bcc3994d083d9bbbffb5b1fef09e409f0456d', 1791866264755), -- 0012_fast_polaris
  ('2b66f6b139f6d10d8f9a7c6922ed5903822fbefcfadb0c61441a0c53530e594c', 1792300000000), -- 0013_customer_community
  ('a728819ad967a44a6dfa4d203ea47eb18657946d77c7cb6e3302838f842c7c79', 1792400000000), -- 0014_downloadable_photos
  ('00adf93f4614a2a83f6a1c85a031b9bf83b4d7f455cb2bc4bb50f789e93a691a', 1792401000000), -- 0015_managed_auth_identity
  ('00072df3e3c45520e20dc00d9959e2180cef8dabb386d59a5e49cdde63ebccfe', 1793400000000), -- 0016_review_details
  ('308347471e55bfd4a451a773658ca8ebe6cfc5092e240e3a4928db5dbc3d2cec', 1793400001000), -- 0017_community_photo_site
  ('f9e0f2a0c1ef340f915d747aae83ab9676332ee1690c2c0c7b5d06d4c102853e', 1793400002000), -- 0018_review_vote_indexes
  ('ea2adc8bb33682cf1de8d3029a9e75853b802436086c7d48b6bd3fee635f3b47', 1793500000000), -- 0019_review_presentation
  ('fc19452d5619f167acf24f497ee18eb12a7c17fc6c60f670a311a8c59db803a2', 1793610114829), -- 0020_complete_collection_approvals
  ('4de3f10c00e4b6cc476ac069bf47043e342ecb01deadb4c48cc3d61883af64f3', 1793687700000), -- 0021_rider_video_upload_preferences
  ('c8ede44e8c1cc58ccdcfd2d8ab33d7fcaba7038788117d459d9ba665aa909156', 1793701873725), -- 0022_rider_photo_visibility
  ('e966c96ae0b84ed1c3b62e04560b2ddb57a959f71b6f7941feb97ec497f66fd0', 1793706075288), -- 0023_booking_confirmation_codes
  ('c63e6529b03debd8b5506ed6ed1887a5422089d6965babc9b8d5194e1f8d6c31', 1793706075289); -- 0024_booking_request_email

COMMIT;
