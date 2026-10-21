CREATE TABLE IF NOT EXISTS "company_routes_config" (
	"route_id" text PRIMARY KEY NOT NULL,
	"route_name" text NOT NULL,
	"price_bwp" numeric(10, 2) NOT NULL,
	"schedule_slots" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "site_content" (
	"id" serial PRIMARY KEY NOT NULL,
	"content_type" text NOT NULL,
	"title" text NOT NULL,
	"media_url" text,
	"body_text" text,
	"is_featured" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
INSERT INTO "company_routes_config" ("route_id", "route_name", "price_bwp", "schedule_slots") VALUES
	('heritage', 'Culture & Heritage Dash', 100.00, '05:00, 17:00'),
	('eco', 'Eco-Retail Explorer', 150.00, '05:00, 17:00'),
	('urban', 'Complete Urban Loop', 250.00, '05:00, 17:00')
ON CONFLICT ("route_id") DO NOTHING;
