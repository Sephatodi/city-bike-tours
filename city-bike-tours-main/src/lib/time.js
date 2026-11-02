// One place for dates and times. Everything is shown in Gaborone time (Africa/Gaborone, UTC+2, no daylight saving),
// whatever the visitor's own time zone is, so a booking at "09:00" means 09:00 at Main Mall.
export const SITE_TZ = "Africa/Gaborone";

const format = (options, locale = "en-GB") => new Intl.DateTimeFormat(locale, { timeZone: SITE_TZ, ...options });
const DATE = format({ day: "numeric", month: "short", year: "numeric" });
const TIME = format({ hour: "2-digit", minute: "2-digit", hour12: false });
const DAY_KEY = format({ year: "numeric", month: "2-digit", day: "2-digit" }, "en-CA");
const WEEKDAY_SHORT = format({ weekday: "short" }, "en-US");
const LONG_DATE = format({ weekday: "long", day: "numeric", month: "long" });

const SHORT_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const LONG_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const toDate = (value) => (value instanceof Date ? value : new Date(value));
const valid = (value) => value !== null && value !== undefined && value !== "" && !Number.isNaN(toDate(value).getTime());

export const formatDate = (value) => (valid(value) ? DATE.format(toDate(value)) : "");
export const formatTime = (value) => (valid(value) ? TIME.format(toDate(value)) : "");
export const formatDateTime = (value) => (valid(value) ? `${formatDate(value)}, ${formatTime(value)}` : "");
export const formatLongDate = (value) => (valid(value) ? LONG_DATE.format(toDate(value)) : "");
export const dayKey = (value) => DAY_KEY.format(toDate(value));

// "just now", "5 min ago", "3 h ago", "yesterday", "4 days ago", then the date itself.
export function timeAgo(value, now = Date.now()) {
  if (!valid(value)) return "";
  const seconds = Math.round((now - toDate(value).getTime()) / 1000);
  if (seconds < 45) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return days === 1 ? "yesterday" : `${days} days ago`;
  return formatDate(value);
}

export function dayLabel(value, now = Date.now()) {
  if (!valid(value)) return "";
  const key = dayKey(value);
  if (key === dayKey(now)) return "Today";
  if (key === dayKey(now - 24 * 60 * 60 * 1000)) return "Yesterday";
  return formatDate(value);
}

// What the clock on the wall at Main Mall says right now.
export function siteClock(now = Date.now()) {
  const date = toDate(now);
  const [hour, minute] = TIME.format(date).split(":").map(Number);
  return { weekday: SHORT_DAYS.indexOf(WEEKDAY_SHORT.format(date)), hour: hour % 24, minute, time: TIME.format(date), date: LONG_DATE.format(date) };
}

const GUIDED_DAYS = [3, 4, 5]; // Wednesday to Friday
const GUIDED_SLOTS = [{ hour: 9, label: "9:00 AM" }, { hour: 14, label: "2:00 PM" }];

// The next ride people can turn up for, worked out from the current Gaborone time.
export function nextRide(now = Date.now()) {
  const clock = siteClock(now);
  for (let offset = 0; offset < 8; offset += 1) {
    const day = (clock.weekday + offset) % 7;
    const when = offset === 0 ? "Today" : offset === 1 ? "Tomorrow" : LONG_DAYS[day];
    if (GUIDED_DAYS.includes(day)) {
      const slot = GUIDED_SLOTS.find((item) => offset > 0 || clock.hour * 60 + clock.minute < item.hour * 60);
      if (slot) return { when, text: `${slot.label} · Heritage City Ride`, guided: true };
    }
    if (day === 6) return { when, text: "Casual Saturday · relaxed and flexible", guided: false };
  }
  return null;
}
