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
