// lib/data.js — shared reference data used by both the frontend pages and
// the API routes (RIDE_CAPACITY, pricing tiers). This file has no DB or
// server-only imports, so it's safe to import from client components too.

export const MEETUP = {
  name: "Hilton Garden Inn",
  note: "CBD, Gaborone",
  instruction: "Arrive 15 minutes early for bikes and helmets.",
};

export const WEEKLY_ADVENTURE = {
  day: "Wednesday",
  times: ["05:00", "17:00"],
  note: "our fixed weekly group ride, open to all levels.",
};

// Server-side capacity per (date, timeSlot) — enforced in app/api/bookings
// and app/api/availability, not just decoration here.
export const RIDE_CAPACITY = 12;

export const ROUTES = [
  {
    id: "heritage",
    num: "01",
    name: "Culture & Heritage Dash",
    distance: "6 km",
    difficulty: "Easy",
    duration: "~60 min",
    focus:
      "A compact loop past the Botswana National Archives and the Post Office Gallery — quiet side roads, easy grade.",
    bestFor: "Casual riders, families, history buffs.",
    tier: "short",
    tierLabel: "Short distance",
  },
  {
    id: "eco",
    num: "02",
    name: "Eco-Retail Explorer",
    distance: "10 km",
    difficulty: "Moderate",
    duration: "~75 min",
    focus:
      "Riverside stretches and the Government Enclave, with a stop past the National Museum — a balanced middle-distance ride.",
    bestFor: "Riders wanting a bit more distance without going all-in.",
    tier: "middle",
    tierLabel: "Middle distance",
  },
  {
    id: "urban",
    num: "03",
    name: "Complete Urban Loop",
    distance: "16 km",
    difficulty: "Challenging",
    duration: "~110 min",
    focus:
      "The full corridor loop, taking in all five landmarks including the Three Chiefs Monument — our longest guided route.",
    bestFor: "Confident riders wanting the complete city tour.",
    tier: "long",
    tierLabel: "Long distance",
  },
];

export const SATURDAY_PRICING = {
  short: 100,
  middle: 150,
  long: 250,
  kids: 60,
};

export const LESSON_PRICE = 120;

// Suggested weekday dates shown in the booking UI. These are *suggestions*
// only — app/api/bookings re-validates the actual date server-side against
// real calendar rules in lib/booking-rules.js, not against this list.
export const WEEKDAY_DATES = [
  { d: "Wed 02 Sep", full: "Wednesday 2 September 2026", iso: "2026-09-02", weekly: true },
  { d: "Thu 03 Sep", full: "Thursday 3 September 2026", iso: "2026-09-03", weekly: false },
  { d: "Fri 04 Sep", full: "Friday 4 September 2026", iso: "2026-09-04", weekly: false },
  { d: "Mon 07 Sep", full: "Monday 7 September 2026", iso: "2026-09-07", weekly: false },
  { d: "Tue 08 Sep", full: "Tuesday 8 September 2026", iso: "2026-09-08", weekly: false },
];

export const SATURDAY_DATES = [
  { d: "Sat 05 Sep", full: "Saturday 5 September 2026", iso: "2026-09-05", tag: "1st Saturday" },
  { d: "Sat 26 Sep", full: "Saturday 26 September 2026", iso: "2026-09-26", tag: "Last Saturday" },
  { d: "Sat 03 Oct", full: "Saturday 3 October 2026", iso: "2026-10-03", tag: "1st Saturday" },
  { d: "Sat 31 Oct", full: "Saturday 31 October 2026", iso: "2026-10-31", tag: "Last Saturday" },
];

export const HOLIDAY_DATES = [
  { d: "Wed 30 Sep", full: "Wednesday 30 September 2026 — Botswana Day", iso: "2026-09-30" },
  { d: "Thu 01 Oct", full: "Thursday 1 October 2026 — Botswana Day", iso: "2026-10-01" },
  { d: "Fri 25 Dec", full: "Friday 25 December 2026 — Christmas Day", iso: "2026-12-25" },
  { d: "Sat 26 Dec", full: "Saturday 26 December 2026 — Boxing Day", iso: "2026-12-26" },
];

export const HOLIDAY_TABLE = [
  ["30 Sep 2026", "Wed", "Botswana Day", "05:00 & 17:00"],
  ["01 Oct 2026", "Thu", "Botswana Day (Independence)", "05:00 & 17:00"],
  ["25 Dec 2026", "Fri", "Christmas Day", "05:00 & 17:00"],
  ["26 Dec 2026", "Sat", "Boxing Day", "05:00 & 17:00"],
  ["01 Jan 2027", "Fri", "New Year's Day", "05:00 & 17:00"],
  ["26 Mar 2027", "Fri", "Good Friday", "05:00 & 17:00"],
  ["29 Mar 2027", "Mon", "Easter Monday", "05:00 & 17:00"],
];

export const TIME_SLOTS = [
  { slot: "morning", clock: "05:00", label: "05:00 · Morning window", meta: "60–90 min" },
  { slot: "evening", clock: "17:00", label: "17:00 · Evening window", meta: "60–90 min" },
];

// The set of gazetted holiday ISO dates, used by lib/booking-rules.js for
// real server-side validation (not just the display table above).
export const HOLIDAY_ISO_DATES = new Set([
  "2026-09-30",
  "2026-10-01",
  "2026-12-25",
  "2026-12-26",
  "2027-01-01",
  "2027-03-26",
  "2027-03-29",
]);
