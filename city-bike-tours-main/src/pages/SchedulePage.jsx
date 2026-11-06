import { useEffect } from "react";
import { Link, useLocation } from "react-router";
import Footer from "../components/Footer";
import FoodStops from "../components/FoodStops";
import { useNow } from "../hooks/useNow";
import { siteClock } from "../lib/time";

function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.1 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

export default function SchedulePage() {
  useScrollReveal();
  const { hash } = useLocation();
  const today = siteClock(useNow(60000)).weekday; // 0 = Sunday, in Gaborone time
  const DAY_INDEX = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 0 };

  // Router navigation and direct visits do not reliably scroll to anchors.
  useEffect(() => {
    if (!hash) return undefined;
    const timer = setTimeout(() => {
      document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 300);
    return () => clearTimeout(timer);
  }, [hash]);

  return (
    <div className="schedule-page">
      <header className="schedule-hero">
        <div className="schedule-hero-inner">
          <p className="schedule-eyebrow">GABORONE · BOTSWANA</p>
          <h1>Ride Outs</h1>
          <p>Choose your ride, find a time that works, and meet us at Main Mall.</p>
        </div>
      </header>

      <main className="schedule-content">
        <section className="schedule-week reveal">
          <div className="schedule-section-heading"><div><p className="schedule-section-kicker">PLAN AHEAD</p><h2>Our week, at a glance.</h2></div></div>
          <div className="schedule-week-grid">
            {[
              { day: "Mon", label: "Closed", active: false },
              { day: "Tue", label: "Closed", active: false },
              { day: "Wed", label: "9am & 2pm\nGuided ride", active: true, color: "#C1440E" },
              { day: "Thu", label: "9am & 2pm\nGuided ride", active: true, color: "#C1440E" },
              { day: "Fri", label: "9am & 2pm\nGuided ride", active: true, color: "#C1440E" },
              { day: "Sat", label: "Casual ride\nLessons included", active: true, color: "#1A3A2A" },
              { day: "Sun", label: "Closed", active: false },
            ].map(({ day, label, active, color }) => (
              <div
                key={day}
                className={`schedule-day ${active ? "schedule-day-active" : ""} ${DAY_INDEX[day] === today ? "schedule-day-today" : ""}`}
                aria-current={DAY_INDEX[day] === today ? "date" : undefined}
                style={{ "--day-accent": active ? color : "#A7A99F" }}
              >
                <div>{day}{DAY_INDEX[day] === today && <em className="schedule-today-tag">Today</em>}</div><span>{label}</span>
              </div>
            ))}
          </div>
        </section>

        <div className="schedule-meeting-point reveal">
          <span className="schedule-meeting-icon">↗</span>
          <div>
            <div className="schedule-section-kicker">MEETING POINT · EVERY RIDE</div>
            <strong>Main Mall, Gaborone City Centre</strong>
            <p>Look for the orange City Bike Tours flag at the main entrance.</p>
          </div>
        </div>

        <section className="reveal" style={{ marginTop: "2.5rem" }}>
          <FoodStops />
        </section>

        <div className="trail-booking-cta reveal" style={{ marginTop: "2.5rem" }}>
          <div>
            <p className="trail-eyebrow">READY TO RIDE</p>
            <h2>Book your ride</h2>
            <p>See routes, pricing, and book on the Heritage Trail page.</p>
          </div>
          <Link to="/heritage-trail#trail-book" className="trail-booking-button">
            Book now <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
