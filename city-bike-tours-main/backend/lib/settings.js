import { db } from "@/db/client";
import { siteSettings } from "@/db/schema";
import { RIDE_CAPACITY, MEETUP } from "@/lib/data";

// Every setting the dashboard can edit, with its default. `public` ones are exposed to the website at /api/settings.
export const SETTING_DEFS = {
  siteName: { default: "City Bike Tours", public: true, max: 80 },
  tagline: { default: "Guided heritage cycling in Gaborone", public: true, max: 160 },
  contactPhone: { default: "", public: true, max: 30 },
  contactEmail: { default: "", public: true, max: 120 },
  meetupName: { default: MEETUP.name, public: true, max: 120 },
  meetupNote: { default: MEETUP.note, public: true, max: 160 },
  arriveEarlyNote: { default: MEETUP.instruction, public: true, max: 200 },
  dailyCapacity: { default: String(RIDE_CAPACITY), public: false, max: 4 },
  bookingsOpen: { default: "true", public: true, max: 5 },
  announcement: { default: "", public: true, max: 300 },
  seoTitle: { default: "City Bike Tours — Gaborone Cycle Tours", public: true, max: 70 },
  seoDescription: {
    default: "Guided city cycling in Gaborone, Botswana. Book a heritage ride with a local guide.",
    public: true,
    max: 170,
  },
  logoUrl: { default: "", public: true, max: 2000 },
  accentColor: { default: "#a24bff", public: true, max: 7 },
  language: { default: "en", public: true, max: 10 },
  // search
  siteUrl: { default: "", public: true, max: 200 },
  seoKeywords: { default: "Gaborone cycling tours, bike tours Botswana, guided city ride", public: true, max: 250 },
  noindexSite: { default: "false", public: true, max: 5 },
  robotsExtra: { default: "", public: false, max: 500 },
  // integrations (IDs only, never free-form scripts)
  gaId: { default: "", public: true, max: 20 },
  gtmId: { default: "", public: true, max: 20 },
  metaPixelId: { default: "", public: true, max: 20 },
  webhookUrl: { default: "", public: false, max: 300 },
  webhookSecret: { default: "", public: false, max: 100 },
  // security
  sessionMinutes: { default: "480", public: false, max: 5 },
  maxFailedLogins: { default: "5", public: false, max: 2 },
  requireMfa: { default: "false", public: false, max: 5 },
};

export async function getSettings() {
  const merged = Object.fromEntries(Object.entries(SETTING_DEFS).map(([key, def]) => [key, def.default]));
  try {
    const rows = await db.select().from(siteSettings);
    for (const row of rows) if (row.key in merged) merged[row.key] = row.value;
  } catch (error) {
    console.error("Settings unavailable, using defaults:", error.message);
  }
  return merged;
}

export function publicSettings(all) {
  return Object.fromEntries(Object.entries(all).filter(([key]) => SETTING_DEFS[key]?.public));
}

export async function getDailyCapacity() {
  const { dailyCapacity } = await getSettings();
  const parsed = parseInt(dailyCapacity, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : RIDE_CAPACITY;
}
