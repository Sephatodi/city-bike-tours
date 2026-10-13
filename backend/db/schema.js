import { pgTable, text, timestamp, boolean, numeric, integer, serial, pgEnum, jsonb } from "drizzle-orm/pg-core";

export const bookingCategoryEnum = pgEnum("booking_category", ["weekday", "saturday", "holiday", "lesson"]);
export const timeSlotEnum = pgEnum("time_slot", ["morning", "evening"]);
export const bookingStatusEnum = pgEnum("booking_status", ["confirmed", "cancelled"]);
export const adminRoleEnum = pgEnum("admin_role", ["super_admin", "editor", "viewer"]);
export const logLevelEnum = pgEnum("log_level", ["info", "warning", "error", "critical"]);
export const backupStatusEnum = pgEnum("backup_status", ["pending", "in_progress", "completed", "failed"]);

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  passwordHash: text("password_hash"),
  image: text("image"),
  provider: text("provider").notNull().default("credentials"),
  role: text("role").notNull().default("customer"),
  adminRole: adminRoleEnum("admin_role"),
  teamId: text("team_id").references(() => teams.id, { onDelete: "set null" }),
  isActive: boolean("is_active").notNull().default(true),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  mfaEnabled: boolean("mfa_enabled").notNull().default(false),
  mfaSecret: text("mfa_secret"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const teams = pgTable("teams", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  permissions: jsonb("permissions").notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const systemLogs = pgTable("system_logs", {
  id: serial("id").primaryKey(),
  level: logLevelEnum("level").notNull(),
  message: text("message").notNull(),
  context: jsonb("context"),
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: jsonb("value").notNull(),
  description: text("description"),
  category: text("category").notNull().default("general"),
  isPublic: boolean("is_public").notNull().default(false),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const seoSettings = pgTable("seo_settings", {
  id: serial("id").primaryKey(),
  pagePath: text("page_path").notNull().unique(),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  metaKeywords: text("meta_keywords"),
  ogTitle: text("og_title"),
  ogDescription: text("og_description"),
  ogImage: text("og_image"),
  twitterCard: text("twitter_card"),
  canonicalUrl: text("canonical_url"),
  robotsTxt: text("robots_txt"),
  structuredData: jsonb("structured_data"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const integrations = pgTable("integrations", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  config: jsonb("config").notNull().default({}),
  isEnabled: boolean("is_enabled").notNull().default(false),
  lastSyncAt: timestamp("last_sync_at", { withTimezone: true }),
  status: text("status").notNull().default("disconnected"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const backups = pgTable("backups", {
  id: text("id").primaryKey(),
  type: text("type").notNull(),
  status: backupStatusEnum("status").notNull().default("pending"),
  filePath: text("file_path"),
  fileSize: numeric("file_size", { precision: 12, scale: 2 }),
  errorMessage: text("error_message"),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdBy: text("created_by").references(() => users.id, { onDelete: "set null" }),
});

export const securitySettings = pgTable("security_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: jsonb("value").notNull(),
  description: text("description"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const softwareUpdates = pgTable("software_updates", {
  id: text("id").primaryKey(),
  component: text("component").notNull(),
  currentVersion: text("current_version").notNull(),
  latestVersion: text("latest_version"),
  status: text("status").notNull().default("unknown"),
  releaseNotes: text("release_notes"),
  downloadUrl: text("download_url"),
  checkedAt: timestamp("checked_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const bookings = pgTable("bookings", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  category: bookingCategoryEnum("category").notNull(),
  rideDate: text("ride_date").notNull(),
  timeSlot: timeSlotEnum("time_slot").notNull(),
  routeId: text("route_id"),
  isKid: boolean("is_kid").notNull().default(false),
  price: numeric("price", { precision: 8, scale: 2 }),
  status: bookingStatusEnum("status").notNull().default("confirmed"),
  checkedInAt: timestamp("checked_in_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const bookingRequests = pgTable("website_booking_requests", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  routeId: text("route_id").notNull(),
  rideDate: text("ride_date").notNull(),
  riders: integer("riders").notNull(),
  notes: text("notes"),
  status: text("status").notNull().default("pending"),
  checkedInAt: timestamp("checked_in_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const companyRoutesConfig = pgTable("company_routes_config", {
  routeId: text("route_id").primaryKey(),
  routeName: text("route_name").notNull(),
  priceBwp: numeric("price_bwp", { precision: 10, scale: 2 }).notNull(),
  scheduleSlots: text("schedule_slots").notNull(),
});

export const siteContent = pgTable("site_content", {
  id: serial("id").primaryKey(),
  contentType: text("content_type").notNull(),
  title: text("title").notNull(),
  mediaUrl: text("media_url"),
  bodyText: text("body_text"),
  isFeatured: boolean("is_featured").notNull().default(false),
  isPublished: boolean("is_published").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const infobipSmsLogs = pgTable("infobip_sms_logs", {
  id: serial("id").primaryKey(),
  bookingRequestId: text("booking_request_id").references(() => bookingRequests.id, { onDelete: "set null" }),
  bookingId: text("booking_id").references(() => bookings.id, { onDelete: "set null" }),
  provider: text("provider").notNull().default("infobip"),
  channel: text("channel").notNull().default("sms"),
  recipient: text("recipient").notNull(),
  message: text("message").notNull(),
  messageId: text("message_id"),
  status: text("status").notNull(),
  sentAt: timestamp("sent_at", { withTimezone: true }).notNull().defaultNow(),
  statusUpdatedAt: timestamp("status_updated_at", { withTimezone: true }).notNull().defaultNow(),
});










