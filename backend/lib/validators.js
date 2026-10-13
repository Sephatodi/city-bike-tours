import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(160),
  email: z.string().trim().toLowerCase().email("Enter a valid email."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  phone: z.string().trim().min(7, "Enter a valid phone number.").max(30).optional().or(z.literal("")),
});

export const bookingSchema = z.object({
  category: z.enum(["weekday", "saturday", "holiday", "lesson"]),
  dateIso: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date."),
  timeSlot: z.enum(["morning", "evening"]),
  routeId: z.string().optional().nullable(),
  isKid: z.boolean().optional(),
});

export const bookingRequestSchema = z.object({
  name: z.string().trim().min(1, "Enter your name.").max(160),
  phone: z.string().trim().min(7, "Enter a valid phone number.").max(30),
  routeId: z.enum(["complete", "loop"]),
  dateIso: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date.")
    .refine((value) => {
      const date = new Date(`${value}T00:00:00.000Z`);
      return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
    }, "Enter a valid date.")
    .refine((value) => value >= new Date().toISOString().slice(0, 10), "Choose today or a future date."),
  riders: z.number().int().min(1).max(20),
  notes: z.string().trim().max(2000, "Notes must be 2,000 characters or fewer.").optional().default(""),
}).superRefine((booking, context) => {
  const date = new Date(`${booking.dateIso}T00:00:00.000Z`);
  const day = date.getUTCDay();
  if (booking.routeId === "complete") {
    if (![3, 4, 5].includes(day)) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ["dateIso"], message: "The Heritage City Ride runs Wednesday to Friday." });
    }
    if (booking.riders > 10) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ["riders"], message: "Guided Heritage City Ride groups are limited to 10 riders." });
    }
  }
  if (booking.routeId === "loop" && day !== 6) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["dateIso"], message: "Casual Saturday rides run on Saturdays." });
  }
});

export const routeConfigSchema = z.object({
  routeName: z.string().trim().min(1).max(100),
  priceBwp: z.coerce.number().finite().min(0).max(100000),
  scheduleSlots: z.string().trim().min(1).max(200).regex(
    /^([01]\d|2[0-3]):[0-5]\d(\s*,\s*([01]\d|2[0-3]):[0-5]\d)*$/,
    "Enter comma-separated 24-hour times, such as 08:00, 14:00."
  ),
});

export const bookingStatusSchema = z.object({
  status: z.enum(["confirmed", "cancelled"]),
});

export const bookingRequestStatusSchema = z.object({
  status: z.enum(["pending", "confirmed", "declined", "cancelled"]),
});

export const bookingRequestUpdateSchema = z.object({
  status: z.enum(["pending", "confirmed", "declined", "cancelled"]).optional(),
  resendConfirmation: z.boolean().optional(),
  name: z.string().trim().min(1, "Enter the rider's name.").max(160).optional(),
  phone: z.string().trim().min(7, "Enter a valid phone number.").max(30).optional(),
  routeId: z.enum(["complete", "loop", "own"]).optional(),
  dateIso: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date.")
    .refine((value) => {
      const date = new Date(`${value}T00:00:00.000Z`);
      return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
    }, "Enter a valid date.")
    .refine((value) => value >= new Date().toISOString().slice(0, 10), "Choose today or a future date.")
    .optional(),
  riders: z.number().int().min(1).max(20).optional(),
  notes: z.string().trim().max(2000, "Notes must be 2,000 characters or fewer.").optional(),
}).refine((values) => Object.keys(values).length > 0, "Nothing to update.");

export const siteContentSchema = z.object({
  contentType: z.enum(["picture", "video", "article"]),
  title: z.string().trim().min(1).max(255),
  mediaUrl: z.string().trim().url().max(2000).optional().or(z.literal("")),
  bodyText: z.string().trim().max(10000).optional().or(z.literal("")),
  isFeatured: z.boolean().default(false),
}).superRefine((content, context) => {
  if (content.contentType !== "article" && !content.mediaUrl) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["mediaUrl"], message: "Add a valid media URL." });
  }
  if (content.contentType === "article" && !content.bodyText) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["bodyText"], message: "Article text is required." });
  }
});

export const siteContentUpdateSchema = z.object({
  title: z.string().trim().min(1).max(255).optional(),
  mediaUrl: z.string().trim().url().max(2000).optional().or(z.literal("")),
  bodyText: z.string().trim().max(10000).optional().or(z.literal("")),
  isFeatured: z.boolean().optional(),
  isPublished: z.boolean().optional(),
}).refine((v) => Object.keys(v).length > 0, "Nothing to update.");

export const aiDraftSchema = z.object({
  prompt: z.string().trim().min(3, "Give the AI a topic or brief.").max(1000),
});

export const adminUserSchema = z.object({
  name: z.string().trim().min(1).max(160),
  email: z.string().trim().toLowerCase().email("Enter a valid email."),
  adminRole: z.enum(["super_admin", "editor", "viewer"]),
  teamId: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  password: z.string().min(8).optional(),
});

export const adminUserUpdateSchema = z.object({
  name: z.string().trim().min(1).max(160).optional(),
  adminRole: z.enum(["super_admin", "editor", "viewer"]).optional(),
  teamId: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  password: z.string().min(8).optional(),
}).refine((v) => Object.keys(v).length > 0, "Nothing to update.");

export const teamSchema = z.object({
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().max(500).optional(),
  permissions: z.record(z.unknown()).default({}),
});

export const siteSettingsSchema = z.object({
  key: z.string().trim().min(1).max(100),
  value: z.unknown(),
  description: z.string().trim().max(500).optional(),
  category: z.string().trim().min(1).max(50).default("general"),
  isPublic: z.boolean().default(false),
});

export const seoSettingsSchema = z.object({
  pagePath: z.string().trim().min(1).max(255),
  metaTitle: z.string().trim().max(60).optional(),
  metaDescription: z.string().trim().max(160).optional(),
  metaKeywords: z.string().trim().max(255).optional(),
  ogTitle: z.string().trim().max(60).optional(),
  ogDescription: z.string().trim().max(160).optional(),
  ogImage: z.string().trim().url().optional().or(z.literal("")),
  twitterCard: z.string().trim().max(50).optional(),
  canonicalUrl: z.string().trim().url().optional().or(z.literal("")),
  robotsTxt: z.string().trim().max(5000).optional(),
  structuredData: z.record(z.unknown()).optional(),
});

export const integrationSchema = z.object({
  id: z.string().trim().min(1).max(100),
  name: z.string().trim().min(1).max(100),
  type: z.string().trim().min(1).max(50),
  config: z.record(z.unknown()).default({}),
  isEnabled: z.boolean().default(false),
});

export const backupSchema = z.object({
  type: z.enum(["database", "files", "full"]),
});

export const securitySettingsSchema = z.object({
  key: z.string().trim().min(1).max(100),
  value: z.unknown(),
  description: z.string().trim().max(500).optional(),
});

export const softwareUpdateSchema = z.object({
  component: z.string().trim().min(1).max(100),
  currentVersion: z.string().trim().min(1).max(50),
  latestVersion: z.string().trim().max(50).optional(),
  status: z.enum(["unknown", "available", "updating", "updated", "error"]).default("unknown"),
  releaseNotes: z.string().trim().max(5000).optional(),
  downloadUrl: z.string().trim().url().optional().or(z.literal("")),
});