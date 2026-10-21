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