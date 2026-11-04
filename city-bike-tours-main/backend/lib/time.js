const TIME_ZONE = "Africa/Gaborone";

export function gaboroneDate(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const value = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${value.year}-${value.month}-${value.day}`;
}

export function addRideDays(rideDate, days) {
  const date = new Date(`${rideDate}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function gaboroneDateTime(rideDate, time = "09:00") {
  const [year, month, day] = rideDate.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  const target = Date.UTC(year, month - 1, day, hour, minute);
  let guess = target;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: TIME_ZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(new Date(guess));
    const values = Object.fromEntries(parts.map(({ type, value }) => [type, Number(value)]));
    const represented = Date.UTC(values.year, values.month - 1, values.day, values.hour, values.minute);
    guess += target - represented;
  }
  return new Date(guess);
}

export function formatGaboroneDate(rideDate) {
  const date = new Date(`${rideDate}T12:00:00.000Z`);
  return new Intl.DateTimeFormat("en-GB", { timeZone: TIME_ZONE, dateStyle: "long" }).format(date);
}
