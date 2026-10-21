ALTER TABLE "infobip_sms_logs" ADD COLUMN "booking_request_id" text;--> statement-breakpoint
ALTER TABLE "infobip_sms_logs" ADD COLUMN "booking_id" text;--> statement-breakpoint
ALTER TABLE "infobip_sms_logs" ADD COLUMN "provider" text DEFAULT 'infobip' NOT NULL;--> statement-breakpoint
ALTER TABLE "infobip_sms_logs" ADD COLUMN "channel" text DEFAULT 'sms' NOT NULL;--> statement-breakpoint
ALTER TABLE "infobip_sms_logs" ADD COLUMN "status_updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "infobip_sms_logs" ADD CONSTRAINT "infobip_sms_logs_booking_request_id_website_booking_requests_id_fk" FOREIGN KEY ("booking_request_id") REFERENCES "public"."website_booking_requests"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "infobip_sms_logs" ADD CONSTRAINT "infobip_sms_logs_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
