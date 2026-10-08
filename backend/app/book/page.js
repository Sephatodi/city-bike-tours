"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ROUTES,
  WEEKDAY_DATES,
  SATURDAY_DATES,
  HOLIDAY_DATES,
  TIME_SLOTS,
  SATURDAY_PRICING,
  LESSON_PRICE,
  MEETUP,
  WEEKLY_ADVENTURE,
} from "@/lib/data";

const CATEGORIES = [
  { id: "weekday", label: "Weekday ride" },
  { id: "saturday", label: "Saturday special" },
  { id: "holiday", label: "Holiday ride" },
  { id: "lesson", label: "Cycling lesson" },
];

export default function BookPage() {
  const router = useRouter();
  const [category, setCategory] = useState("weekday");
  const [date, setDate] = useState(null);
  const [time, setTime] = useState(null);
  const [route, setRoute] = useState(null);
  const [isKid, setIsKid] = useState(false);
  const [availability, setAvailability] = useState(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  const needsRoute = category === "weekday" || category === "saturday" || category === "holiday";
  const dates =
    category === "weekday" ? WEEKDAY_DATES : category === "saturday" ? SATURDAY_DATES : category === "holiday" ? HOLIDAY_DATES : WEEKDAY_DATES;

  const ready =
    (category === "lesson" ? Boolean(date && time) : Boolean(date && time && route)) &&
    !(availability && availability.full);

  const price = useMemo(() => {
    if (category === "lesson") return LESSON_PRICE;
    if (category === "saturday") {
      if (isKid) return SATURDAY_PRICING.kids;
      if (route) return SATURDAY_PRICING[route.tier];
      return null;
    }
    return null; // weekday / holiday rates confirmed on booking
  }, [category, isKid, route]);

  // Check live capacity whenever date + time are both chosen.
  useEffect(() => {
    if (!date || !time) {
      setAvailability(null);
      return;
    }
    let cancelled = false;
    setCheckingAvailability(true);
    fetch(`/api/availability?date=${date.iso}&timeSlot=${time.slot}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled) setAvailability(data);
      })
      .catch(() => {
        if (!cancelled) setAvailability(null);
      })
      .finally(() => {
        if (!cancelled) setCheckingAvailability(false);
      });
    return () => {
      cancelled = true;
    };
  }, [date, time]);

  function switchCategory(cat) {
    setCategory(cat);
    setDate(null);
    setTime(null);
    setRoute(null);
    setIsKid(false);
    setAvailability(null);
  }

  function handleBookNow() {
    if (!ready) return;
    const params = new URLSearchParams({
      category,
      date: date.full,
      dateIso: date.iso,
      time: time.label,
      slot: time.slot,
    });
    if (route) params.set("route", route.name);
    if (route) params.set("routeId", route.id);
    if (isKid) params.set("kid", "yes");
    if (price != null) params.set("price", String(price));
    router.push(`/register?${params.toString()}`);
  }

  return (
    <>
      <header className="page-header">
        <div className="wrap">
          <div className="section-eyebrow">Book in a few steps</div>
          <h1>Reserve your ride</h1>
          <p className="lede" style={{ marginTop: 16 }}>
            Meet at the <strong>{MEETUP.name}</strong>, {MEETUP.note}. {MEETUP.instruction} Every{" "}
            {WEEKLY_ADVENTURE.day} at {WEEKLY_ADVENTURE.times.join(" & ")} is our fixed Weekly
            Adventure — {WEEKLY_ADVENTURE.note}
          </p>
        </div>
      </header>

      <section className="block" style={{ borderTop: "none" }}>
        <div className="wrap">
          <div className="booker">
            <div className="cat-toggle" role="tablist" aria-label="Booking category">
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  role="tab"
                  aria-selected={category === c.id}
                  className={category === c.id ? "active" : ""}
                  onClick={() => switchCategory(c.id)}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <div className="step-label">Step 1 — date</div>
            {category === "lesson" ? (
              <p style={{ color: "#b9bec4", fontSize: 13, marginBottom: 20 }}>
                Lessons run any day, subject to availability — pick a weekday date as a starting
                point and we&rsquo;ll confirm.
              </p>
            ) : null}
            <div className="pill-grid">
              {dates.map((d) => (
                <button
                  key={d.d}
                  type="button"
                  className={`pill${date?.d === d.d ? " selected" : ""}`}
                  onClick={() => setDate(d)}
                >
                  <span className="d">{d.d}</span>
                  <span className="t">
                    {category === "weekday" && d.weekly
                      ? "Weekly Adventure"
                      : category === "saturday"
                      ? d.tag
                      : category === "weekday"
                      ? "On request"
                      : category === "lesson"
                      ? "Suggested date"
                      : "Public holiday"}
                  </span>
                </button>
              ))}
            </div>

            <div className="step-label">Step 2 — time window</div>
            <div className="pill-grid">
              {TIME_SLOTS.map((slot) => (
                <button
                  key={slot.slot}
                  type="button"
                  className={`pill${time?.slot === slot.slot ? " selected" : ""}`}
                  onClick={() => setTime(slot)}
                >
                  <span className="d">{slot.clock}</span>
                  <span className="t">{slot.meta}</span>
                </button>
              ))}
            </div>

            {date && time && (
              <p className="mono" style={{ fontSize: 12, color: availability?.full ? "var(--dusk)" : "#9aa0a6", marginTop: -18, marginBottom: 24 }}>
                {checkingAvailability
                  ? "Checking availability…"
                  : availability
                  ? availability.full
                    ? "Fully booked — pick another date or time."
                    : `${availability.remaining} of ${availability.capacity} spots left.`
                  : ""}
              </p>
            )}

            {needsRoute && (
              <>
                <div className="step-label">Step 3 — route</div>
                <div
                  className="pill-grid"
                  style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}
                >
                  {ROUTES.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      className={`route-pill${route?.id === r.id ? " selected" : ""}`}
                      onClick={() => setRoute(r)}
                    >
                      <strong>{r.name}</strong>
                      <span className="meta">
                        {r.distance} · {r.tierLabel}
                        {category === "saturday" ? ` · P${SATURDAY_PRICING[r.tier]}` : ""}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {category === "saturday" && (
              <label style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 13, color: "#b9bec4", marginBottom: 8 }}>
                <input type="checkbox" checked={isKid} onChange={(e) => setIsKid(e.target.checked)} />
                This booking is for a child, accompanied by a parent — P{SATURDAY_PRICING.kids}
              </label>
            )}

            <div className="summary">
              <div className="summary-text">
                {ready ? (
                  <>
                    <strong>{date.full}</strong> — {time.label}
                    {route ? <> — {route.name}</> : null}
                    {price != null ? <> — P{price}</> : null}
                  </>
                ) : (
                  <>
                    Still need:{" "}
                    {[!date && "date", !time && "time", needsRoute && !route && "route"]
                      .filter(Boolean)
                      .join(", ") || (availability?.full ? "a date with open spots" : "")}
                    .
                  </>
                )}
              </div>
              <button type="button" className="btn confirm-btn" disabled={!ready} onClick={handleBookNow}>
                Book now
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
