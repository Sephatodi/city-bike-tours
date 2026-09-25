import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import Footer from "../components/Footer";
import HeritageMap from "../components/HeritageMap";
import HeaderBike from "../components/HeaderBike";
import UphillCyclist from "../components/UphillCyclist";
import { ROUTES_DATA, SITES } from "../data";

const PRIMARY_ROUTES = ROUTES_DATA.filter((route) => route.id === "complete" || route.id === "loop");

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

export default function RoutesPage() {
  useScrollReveal();
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState("complete");
  const [scrollProgress, setScrollProgress] = useState(0);
  const storyRef = useRef(null);

  useEffect(() => {
    function updateProgress() {
      const story = storyRef.current;
      if (!story) return;

      const range = story.offsetHeight - window.innerHeight;
      const progress = range > 0
        ? (window.scrollY - story.offsetTop) / range
        : 0;
      setScrollProgress(Math.min(Math.max(progress, 0), 1));
    }

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, []);

  function openBooking(route = "complete") {
    setSelectedRoute(route);
    setIsBookingOpen(true);
  }

  function handleBookingSubmit(event) {
    event.preventDefault();
    setIsBookingOpen(false);
  }

  return (
    <div style={{ backgroundColor: "#0D0805", minHeight: "100vh" }}>
      {/* Page hero */}
      <div className="relative overflow-hidden pt-32 pb-16 tribal-pattern" style={{ backgroundColor: "#0F0B06" }}>
        <HeaderBike />
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#D4A017" }}>— How You Ride</p>
          <h1 className="font-display font-bold" style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", color: "#F5EDD9", lineHeight: 1.05 }}>
            Choose<br />Your Route
          </h1>
          <p className="mt-4 text-base max-w-lg" style={{ color: "rgba(245,237,217,0.65)" }}>
            All routes start and end at Main Mall. The heritage radius covers all 6 sites within Gaborone's city centre.
          </p>
          <button type="button" onClick={() => openBooking()} className="mt-6 px-6 py-3 font-bold uppercase tracking-widest text-xs rounded-sm transition-opacity hover:opacity-80" style={{ backgroundColor: "#C1440E", color: "#F5EDD9" }}>
            Reserve a ride
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">

        <section ref={storyRef} className="route-story mb-20 reveal">
          <div className="route-story-bike" style={{ transform: `translate(${scrollProgress * 62}vw, ${-scrollProgress * 18}vh) rotate(${-8 - scrollProgress * 8}deg)` }}>
            <UphillCyclist className="route-story-bike-image" />
          </div>
          <div className="route-story-intro">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#D4A017" }}>— Find your pace</p>
            <h2 className="font-display font-bold text-3xl md:text-5xl" style={{ color: "#F5EDD9" }}>Two ways through the city</h2>
          </div>
          <div className="route-story-panels">
            <article className="route-story-panel">
              <span className="route-story-number">01</span>
              <h3 className="font-display font-bold text-2xl" style={{ color: "#F5EDD9" }}>Heritage City Ride</h3>
              <p>Wednesday to Friday options, guided commentary, and time to take in all six landmarks. Choose the structured ride when the stories matter as much as the miles.</p>
              <button type="button" onClick={() => openBooking("complete")} className="route-story-action">Book guided ride <span aria-hidden="true">→</span></button>
            </article>
            <article className="route-story-panel">
              <span className="route-story-number">02</span>
              <h3 className="font-display font-bold text-2xl" style={{ color: "#F5EDD9" }}>Casual Saturday</h3>
              <p>A relaxed family loop for friends, first-timers, and anyone who wants to explore without a rigid schedule or a stopwatch.</p>
              <button type="button" onClick={() => openBooking("loop")} className="route-story-action">Choose the loop <span aria-hidden="true">→</span></button>
            </article>
          </div>
        </section>

        {/* Route cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-16 reveal">
          {PRIMARY_ROUTES.map((route) => (
            <div
              key={route.id}
              className="p-8 rounded-sm relative flex flex-col"
              style={{ backgroundColor: "#0F0B06", border: `1px solid rgba(245,237,217,0.12)` }}
            >
              <div
                className="absolute top-4 right-4 px-2 py-0.5 rounded-sm text-xs font-bold uppercase tracking-wider"
                style={{ backgroundColor: route.badgeColor, color: "#F5EDD9" }}
              >
                {route.badge}
              </div>
              <div className="font-display font-bold text-2xl mb-2 pr-16 leading-tight" style={{ color: "#F5EDD9" }}>{route.name}</div>
              <p className="text-sm leading-relaxed mb-6" style={{ color: "rgba(245,237,217,0.7)" }}>{route.desc}</p>

              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  ["⏱", route.duration, "Duration"],
                  ["📍", route.distance, "Distance"],
                  ["🏛", `${route.sites} sites`, "Coverage"],
                  ["💰", `P${route.price}`, "Per rider"],
                ].map(([icon, val, lbl]) => (
                  <div key={lbl} className="p-3 rounded-sm" style={{ backgroundColor: "rgba(245,237,217,0.05)" }}>
                    <div className="text-base">{icon}</div>
                    <div className="font-bold text-sm mt-1" style={{ color: "#F5EDD9" }}>{val}</div>
                    <div className="text-xs mt-0.5" style={{ color: "rgba(245,237,217,0.45)" }}>{lbl}</div>
                  </div>
                ))}
              </div>

              {/* Includes */}
              <div className="mb-4">
                <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "rgba(245,237,217,0.4)" }}>Includes</div>
                {route.includes.map((item) => (
                  <div key={item} className="flex items-center gap-2 text-xs mb-1" style={{ color: "rgba(245,237,217,0.65)" }}>
                    <span style={{ color: route.badgeColor }}>✓</span> {item}
                  </div>
                ))}
              </div>

              <div
                className="text-xs px-3 py-2 rounded-sm mb-6"
                style={{ backgroundColor: `${route.badgeColor}18`, color: route.badgeColor, border: `1px solid ${route.badgeColor}40` }}
              >
                🗓 {route.when}
              </div>

              <button
                type="button"
                onClick={() => openBooking(route.id)}
                className="mt-auto block w-full text-center py-3 font-bold uppercase tracking-widest text-sm rounded-sm transition-opacity hover:opacity-80"
                style={{ backgroundColor: route.badgeColor, color: "#F5EDD9" }}
              >
                Book This Route
              </button>
            </div>
          ))}
        </div>

        {/* Sites along the route */}
        <div className="mb-16 reveal">
          <h2 className="font-display font-bold text-2xl mb-2" style={{ color: "#F5EDD9" }}>Sites Along the Complete Route</h2>
          <p className="text-sm mb-8" style={{ color: "rgba(245,237,217,0.55)" }}>The Complete Heritage Route visits all six in a single loop from Main Mall.</p>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
            {SITES.map((site, i) => (
              <div key={site.id} className="p-4 rounded-sm text-center" style={{ backgroundColor: `${site.color}18`, border: `1px solid ${site.color}40` }}>
                <div className="text-2xl mb-2">{site.emoji}</div>
                <div className="font-bold text-xs leading-tight" style={{ color: "#F5EDD9" }}>{site.name}</div>
                <div className="text-xs mt-1" style={{ color: "rgba(245,237,217,0.45)" }}>Stop {i + 1}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Live map */}
        <div className="mb-16 reveal">
          <h2 className="font-display font-bold text-2xl mb-2" style={{ color: "#F5EDD9" }}>Heritage Route Map</h2>
          <p className="text-sm mb-6" style={{ color: "rgba(245,237,217,0.55)" }}>All 6 sites lie within a compact radius of Main Mall — click any marker for details.</p>
          <HeritageMap height="500px" />
        </div>

        {/* CTA */}
        <div className="text-center reveal">
          <Link to="/pricing" className="inline-block mr-4 px-8 py-3 font-bold uppercase tracking-widest text-sm rounded-sm hover:opacity-90 transition-opacity" style={{ backgroundColor: "#D4A017", color: "#0D0805" }}>
            See Pricing
          </Link>
          <button type="button" onClick={() => openBooking()} className="inline-block px-8 py-3 font-semibold uppercase tracking-widest text-sm rounded-sm border hover:bg-white/5 transition-colors" style={{ borderColor: "rgba(245,237,217,0.3)", color: "#F5EDD9" }}>
            Book Now
          </button>
        </div>
      </div>

      <div className={`booking-drawer-overlay ${isBookingOpen ? "active" : ""}`} aria-hidden={!isBookingOpen}>
        <button type="button" className="booking-drawer-backdrop" aria-label="Close booking form" onClick={() => setIsBookingOpen(false)} />
        <aside className="booking-drawer-card" aria-label="Reserve your heritage ride">
          <div className="drawer-header">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#D4A017" }}>Reserve your ride</p>
              <h2 className="font-display font-bold text-3xl" style={{ color: "#F5EDD9" }}>Make it a day out</h2>
            </div>
            <button type="button" className="close-drawer-btn" aria-label="Close booking form" onClick={() => setIsBookingOpen(false)}>×</button>
          </div>
          <form onSubmit={handleBookingSubmit} className="booking-form-elements">
            <label htmlFor="route-choice">Excursion path</label>
            <select id="route-choice" value={selectedRoute} onChange={(event) => setSelectedRoute(event.target.value)} required>
              {PRIMARY_ROUTES.map((route) => <option key={route.id} value={route.id}>{route.name}</option>)}
            </select>
            <label htmlFor="excursion-date">Excursion date</label>
            <input id="excursion-date" type="date" required />
            <label htmlFor="rider-count">Number of riders</label>
            <input id="rider-count" type="number" min="1" max="10" defaultValue="1" required />
            <button type="submit" className="submit-booking-action">Confirm reservation</button>
          </form>
        </aside>
      </div>

      <Footer />
    </div>
  );
}
