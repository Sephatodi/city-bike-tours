import { pgTable, text, timestamp, boolean, numeric, integer, serial, pgEnum } from "drizzle-orm/pg-core";

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
  role: text("role").notNull().default("customer"),
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
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
