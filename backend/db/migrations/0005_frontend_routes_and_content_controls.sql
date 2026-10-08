ALTER TABLE "site_content" ADD COLUMN "is_published" boolean DEFAULT true NOT NULL;
--> statement-breakpoint
-- The Vite site books these three route ids (src/data.js ROUTES_DATA). Prices/names/times mirror what
-- the site currently shows; edit them any time in Admin > Routes, prices & schedules.
-- (The legacy heritage/eco/urban rows are left in place for the old account-booking pages.)
INSERT INTO "company_routes_config" ("route_id", "route_name", "price_bwp", "schedule_slots") VALUES
	('complete', 'Complete Heritage Route', 250.00, '09:00, 14:00'),
	('loop', 'Casual Saturday', 150.00, '09:00'),
	('own', 'Your Own Route', 150.00, '09:00, 14:00')
ON CONFLICT ("route_id") DO NOTHING;
