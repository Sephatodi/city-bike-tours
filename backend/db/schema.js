import { pgTable, text, timestamp, boolean, numeric, integer, serial, pgEnum, jsonb } from "drizzle-orm/pg-core";

export const bookingCategoryEnum = pgEnum("booking_category", ["weekday", "saturday", "holiday", "lesson"]);
export const timeSlotEnum = pgEnum("time_slot", ["morning", "evening"]);
export const bookingStatusEnum = pgEnum("booking_status", ["confirmed", "cancelled"]);

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  // Null for OAuth-only accounts (Google/Apple/Facebook) that never set a password.
  passwordHash: text("password_hash"),
  image: text("image"),
  provider: text("provider").notNull().default("credentials"), // 'credentials' | 'google' | 'apple' | 'facebook'
  // 'customer' | 'viewer' | 'editor' | 'admin' (the last three can open the admin dashboard)
  role: text("role").notNull().default("customer"),
  // 'active' | 'suspended' (suspended accounts cannot sign in)
  status: text("status").notNull().default("active"),
  // optional group such as "Guides" or "Front desk"
  team: text("team"),
  // two-step sign-in (authenticator app)
  mfaSecret: text("mfa_secret"),
  mfaEnabled: boolean("mfa_enabled").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const bookings = pgTable("bookings", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  category: bookingCategoryEnum("category").notNull(),
  rideDate: text("ride_date").notNull(), // stored as 'YYYY-MM-DD' — no timezone ambiguity
  timeSlot: timeSlotEnum("time_slot").notNull(),
  routeId: text("route_id"), // null for lessons
  isKid: boolean("is_kid").notNull().default(false),
  // Null = price confirmed at booking time by a human (weekday/holiday rates).
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
  provider: text("provider").notNull().default("wa.me"),
  channel: text("channel").notNull().default("whatsapp"),
  recipient: text("recipient").notNull(),
  message: text("message").notNull(),
  messageId: text("message_id"),
  status: text("status").notNull(),
  sentAt: timestamp("sent_at", { withTimezone: true }).notNull().defaultNow(),
  statusUpdatedAt: timestamp("status_updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// Who did what in the admin dashboard (append-only).
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  actorId: text("actor_id"),
  actorName: text("actor_name").notNull(),
  actorRole: text("actor_role").notNull(),
  action: text("action").notNull(), // e.g. 'booking.confirm', 'user.suspend'
  targetType: text("target_type"),
  targetId: text("target_id"),
  summary: text("summary").notNull(),
  detail: jsonb("detail"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// Simple key/value store for site settings edited from the dashboard.
export const siteSettings = pgTable("site_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedBy: text("updated_by"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// Every sign-in attempt, for the Security page and automatic lock-outs.
export const loginAttempts = pgTable("login_attempts", {
  id: serial("id").primaryKey(),
  email: text("email"),
  ip: text("ip"),
  success: boolean("success").notNull(),
  reason: text("reason"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const blockedIps = pgTable("blocked_ips", {
  ip: text("ip").primaryKey(),
  reason: text("reason"),
  createdBy: text("created_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// Cookie-less page views: `visitor` is a daily-rotating hash, never an IP address.
export const pageViews = pgTable("page_views", {
  id: serial("id").primaryKey(),
  day: text("day").notNull(),
  path: text("path").notNull(),
  visitor: text("visitor").notNull(),
  referrer: text("referrer"),
  device: text("device"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// Questions sent from the website's contact form.
export const enquiries = pgTable("enquiries", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone"),
  email: text("email"),
  subject: text("subject"),
  message: text("message").notNull(),
  status: text("status").notNull().default("new"), // new | in_progress | resolved
  staffNote: text("staff_note"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// Rider reviews waiting for approval before they show on the website.
export const reviews = pgTable("reviews", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment").notNull(),
  rideDate: text("ride_date"),
  status: text("status").notNull().default("pending"), // pending | approved | rejected
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const subscribers = pgTable("subscribers", {
  id: text("id").primaryKey(),
  email: text("email"),
  phone: text("phone"),
  source: text("source"),
  status: text("status").notNull().default("subscribed"), // subscribed | unsubscribed
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// Per-page search settings that override the site-wide defaults.
export const seoPages = pgTable("seo_pages", {
  path: text("path").primaryKey(),
  title: text("title"),
  description: text("description"),
  keywords: text("keywords"),
  noindex: boolean("noindex").notNull().default(false),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
