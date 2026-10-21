CREATE TABLE IF NOT EXISTS "infobip_sms_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"recipient" text NOT NULL,
	"message" text NOT NULL,
	"message_id" text,
	"status" text NOT NULL,
	"sent_at" timestamp with time zone DEFAULT now() NOT NULL
);
