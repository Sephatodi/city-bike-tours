import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import Footer from "../components/Footer";
import PricingSection from "../components/PricingSection";
import RidePlanner from "../components/RidePlanner";
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

function PageHeading() {
  return <h1 className="wavy-heading">Ride Outs</h1>;
}

export default function SchedulePage() {
  useScrollReveal();
  const { hash } = useLocation();
  const today = siteClock(useNow(60000)).weekday;
  const DAY_INDEX = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 0 };

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
          <PageHeading />
          <p>Choose your ride, find a time that works, see what it costs, and meet us at Main Mall.</p>
        </div>
      </header>

      <main className="schedule-content">
        <RidePlanner />

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
                style={{
                  "--day-accent": active ? color : "#A7A99F",
                }}
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

        <PricingSection />

        <section className="reveal" style={{ padding: "3rem 0", textAlign: "center" }}>
          <Link
            to="/book"
            className="px-10 py-4 font-bold uppercase tracking-widest text-sm rounded-sm hover:opacity-90 transition-opacity"
            style={{ backgroundColor: "#D4A017", color: "#0D0805", display: "inline-block", position: "relative", overflow: "hidden" }}
          >
            <span style={{ position: "relative", zIndex: 1 }}>Check Availability</span>
            <div className="ring-light" style={{ position: "absolute", inset: 0, borderRadius: "inherit", pointerEvents: "none", opacity: 0, transition: "opacity 0.3s" }} />
            <style>{`
              .ring-light {
                position: absolute;
                inset: -4px;
                border: 2px solid transparent;
                border-top: 2px solid #D4A017;
                border-right: 2px solid #D4A017;
                border-radius: 4px;
                animation: ring-spin 1.5s linear infinite;
              }
              @keyframes ring-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
              .schedule-page .reveal:last-child:hover .ring-light { opacity: 1; }
            `}</style>
          </Link>
        </section>

      </main>

      <Footer />
    </div>
  );
}
