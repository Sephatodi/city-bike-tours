import { useEffect, useState } from "react";
import { Link } from "react-router";
import Footer from "../components/Footer";
import HeritageMap from "../components/HeritageMap";
import HeaderBike from "../components/HeaderBike";
import Icon from "../components/Icon";
import { SITES } from "../data";
import { useLiveData } from "../hooks/LiveDataContext";

const ROUTE_VISUALS = {
  complete: { image: "/three%20chiefs.jfif", tone: "route-card-rust" },
  loop: { image: "/museum.jfif", tone: "route-card-sage" },
};

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
  const { routes } = useLiveData();
  const primaryRoutes = routes.filter((route) => route.id === "complete" || route.id === "loop");
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState("complete");

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

        <section className="routes-intro mb-16 reveal">
          <div className="routes-intro-copy">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#D4A017" }}>— Find your pace</p>
            <h2 className="font-display font-bold text-3xl md:text-5xl" style={{ color: "#F5EDD9" }}>Two ways through the city</h2>
            <p className="mt-4" style={{ color: "rgba(245,237,217,0.72)" }}>
              Choose a guided heritage ride Wednesday to Friday, or a relaxed Saturday ride with lessons for kids and adults included. Both rides start at Main Mall.
            </p>
            <div className="routes-intro-points">
              <span><strong>6</strong> heritage stops</span>
              <span><strong>12 km</strong> city-centre loop</span>
              <span><strong>All levels</strong> welcome</span>
            </div>
          </div>
          <div className="routes-intro-map" aria-label="Interactive map of the heritage routes">
            <div className="routes-intro-map-heading"><span className="schedule-live-dot" /> EXPLORE THE ROUTE <span>GABORONE, BW</span></div>
            <HeritageMap height="390px" />
          </div>
        </section>

        {/* Route cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-16 reveal">
          {primaryRoutes.map((route) => (
            <div
              key={route.id}
              className={`route-card ${ROUTE_VISUALS[route.id].tone}`}
            >
              <img className="route-card-image" src={ROUTE_VISUALS[route.id].image} alt="" />
              <div className="route-card-body">
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
                  ["clock", route.duration, "Duration"],
                  ["route", route.distance, "Distance"],
                  ["landmark", `${route.sites} sites`, "Coverage"],
                  ["wallet", `P${route.price}`, "Per rider"],
                ].map(([icon, val, lbl]) => (
                  <div key={lbl} className="p-3 rounded-sm" style={{ backgroundColor: "rgba(245,237,217,0.05)" }}>
                    <Icon name={icon} size={18} style={{ color: route.badgeColor }} />
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
                <Icon name="calendar" size={14} /> {route.when}
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
            </div>
          ))}
        </div>

        {/* Sites along the route */}
        <div className="mb-16 reveal">
          <h2 className="font-display font-bold text-2xl mb-2" style={{ color: "#F5EDD9" }}>Sites Along the Heritage City Ride</h2>
          <p className="text-sm mb-8" style={{ color: "rgba(245,237,217,0.55)" }}>The guided Heritage City Ride visits all six in a single loop from Main Mall.</p>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
            {SITES.map((site, i) => (
              <div key={site.id} className="p-4 rounded-sm text-center" style={{ backgroundColor: `${site.color}18`, border: `1px solid ${site.color}40` }}>
                <Icon name={site.icon} size={24} style={{ color: site.color, marginBottom: "0.5rem" }} />
                <div className="font-bold text-xs leading-tight" style={{ color: "#F5EDD9" }}>{site.name}</div>
                <div className="text-xs mt-1" style={{ color: "rgba(245,237,217,0.45)" }}>Stop {i + 1}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="routes-cta reveal">
          <Link to="/pricing" className="inline-block px-8 py-3 font-bold uppercase tracking-widest text-sm rounded-sm hover:opacity-90 transition-opacity" style={{ backgroundColor: "#D4A017", color: "#0D0805" }}>
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
              {primaryRoutes.map((route) => <option key={route.id} value={route.id}>{route.name}</option>)}
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
