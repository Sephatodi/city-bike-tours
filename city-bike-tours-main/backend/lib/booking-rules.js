import { ROUTES, HOLIDAY_ISO_DATES } from "./data";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function parseIsoUTC(dateIso) {
  // Date-only ISO strings are parsed as UTC midnight per spec, so
  // getUTCDay() gives a timezone-independent day of week — important since
  // this runs on a server that might not be in Africa/Gaborone.
  const d = new Date(dateIso);
  return Number.isNaN(d.getTime()) ? null : d;
}

function isFirstOrLastSaturday(dateIso) {
  const d = parseIsoUTC(dateIso);
  if (!d || d.getUTCDay() !== 6) return false;

  const year = d.getUTCFullYear();
  const month = d.getUTCMonth();
  const saturdays = [];
  const probe = new Date(Date.UTC(year, month, 1));
  while (probe.getUTCMonth() === month) {
    if (probe.getUTCDay() === 6) saturdays.push(probe.getUTCDate());
    probe.setUTCDate(probe.getUTCDate() + 1);
  }
  const day = d.getUTCDate();
  return day === saturdays[0] || day === saturdays[saturdays.length - 1];
}

/**
 * Re-validates a booking request against the actual calendar rules,
 * independent of whatever the client's UI happened to display. A tampered
 * request body (wrong category for a date, a non-existent routeId, etc.)
 * gets rejected here even if it passed the zod shape check.
 */
export function validateBooking({ category, dateIso, timeSlot, routeId, isKid }) {
  if (!DATE_RE.test(dateIso)) {
    return { ok: false, message: "Invalid date format." };
  }
  const d = parseIsoUTC(dateIso);
  if (!d) return { ok: false, message: "Invalid date." };

  // Don't allow booking dates in the past.
  const today = new Date();
  const todayIso = today.toISOString().slice(0, 10);
  if (dateIso < todayIso) {
    return { ok: false, message: "That date has already passed." };
  }

  const dow = d.getUTCDay(); // 0 = Sunday ... 6 = Saturday

  if (category === "weekday") {
    if (dow === 0 || dow === 6) {
      return { ok: false, message: "Weekday rides run Monday to Friday only." };
    }
  } else if (category === "saturday") {
    if (!isFirstOrLastSaturday(dateIso)) {
      return { ok: false, message: "Saturday specials only run on the 1st and last Saturday of the month." };
    }
  } else if (category === "holiday") {
    if (!HOLIDAY_ISO_DATES.has(dateIso)) {
      return { ok: false, message: "That date isn't a gazetted public holiday we run rides on." };
    }
  } else if (category === "lesson") {
    if (dow === 0) {
      return { ok: false, message: "Lessons run Monday to Saturday." };
    }
  } else {
    return { ok: false, message: "Unknown booking category." };
  }

  if (!["morning", "evening"].includes(timeSlot)) {
    return { ok: false, message: "Invalid time slot." };
  }

  const needsRoute = category === "weekday" || category === "saturday" || category === "holiday";
  if (needsRoute) {
    if (!routeId || !ROUTES.some((r) => r.id === routeId)) {
      return { ok: false, message: "Pick a valid route." };
    }
  }

  if (category !== "saturday" && isKid) {
    return { ok: false, message: "The kids' rate only applies to Saturday specials." };
  }

  return { ok: true };
}
