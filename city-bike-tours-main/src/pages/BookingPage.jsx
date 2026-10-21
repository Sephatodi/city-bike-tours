import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import Footer from "../components/Footer";
import HeritageMap from "../components/HeritageMap";
import Icon from "../components/Icon";
import { SITES } from "../data";
import { ROUTES_DATA } from "../data";
import { backendUrl } from "../api/backend";
import { useLiveData } from "../hooks/LiveDataContext";
import { useCustomer } from "../auth/CustomerAuth";

const ROUTE_VISUALS = {
  complete: { image: "/three%20chiefs.jfif", tone: "route-card-rust" },
  loop: { image: "/museum.jfif", tone: "route-card-sage" },
};

export default function BookingPage() {
  const { routes } = useLiveData();
  const { isSignedIn, ready, user, token, signOut } = useCustomer();
  const { hash } = useLocation();
  const primaryRoutes = routes.filter((item) => item.id === "complete" || item.id === "loop");
  const [route, setRoute] = useState("complete");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [riders, setRiders] = useState(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [requestId, setRequestId] = useState("");
  const [availability, setAvailability] = useState(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availabilityError, setAvailabilityError] = useState("");

  // Links like /book#book-form (from the pricing cards) should land on the form.
  useEffect(() => {
    if (!hash) return undefined;
    const timer = setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth", block: "start" }), 300);
    return () => clearTimeout(timer);
  }, [hash]);

  // Riders book with their account, so their details are filled in for them.
  useEffect(() => {
    if (!user) return;
    setName((current) => current || user.name || "");
    setPhone((current) => current || user.phone || "");
  }, [user]);

  const selectedRoute = routes.find((r) => r.id === route) || ROUTES_DATA.find((r) => r.id === route);
  const total = selectedRoute.price * riders;
  const maxRiders = route === "complete" ? 10 : 20;
  const insufficientCapacity = availability && riders > availability.remaining;

  useEffect(() => {
    if (!date) {
      setAvailability(null);
      setAvailabilityError("");
      setCheckingAvailability(false);
      return;
    }

    const controller = new AbortController();
    setAvailability(null);
    setAvailabilityError("");
    setCheckingAvailability(true);

    fetch(backendUrl(`/api/availability?date=${encodeURIComponent(date)}`), { signal: controller.signal, cache: "no-store" })
      .then(async (response) => {
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.error || "Could not check date availability.");
        setAvailability(result);
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          setAvailabilityError(error.message || "Could not check date availability.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setCheckingAvailability(false);
      });

    return () => controller.abort();
  }, [date]);

  const chooseRoute = (routeId) => {
    handleRouteChange(routeId);
    document.getElementById("book-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleRouteChange = (routeId) => {
    setRoute(routeId);
    setRiders((current) => Math.min(current, routeId === "complete" ? 10 : 20));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isSignedIn) return;
    if (!availability || availability.full || insufficientCapacity || availabilityError) {
      setSubmitError(availabilityError || "Please choose a date with enough available spaces.");
      return;
    }
    const day = new Date(`${date}T00:00:00.000Z`).getUTCDay();
    if (route === "complete" && ![3, 4, 5].includes(day)) {
      setSubmitError("The Heritage City Ride runs Wednesday to Friday. Please choose one of those days.");
      return;
    }
    if (route === "loop" && day !== 6) {
      setSubmitError("Casual Saturday rides run on Saturdays. Please choose a Saturday.");
      return;
    }
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch(backendUrl("/api/booking-requests"), {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name,
          phone,
          routeId: route,
          dateIso: date,
          riders,
          notes: route === "complete"
            ? [`Preferred start time: ${startTime}`, notes].filter(Boolean).join("\n")
            : notes,
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (response.status === 409 && Number.isInteger(result.remaining)) {
        setAvailability((current) => current && {
          ...current,
          booked: current.capacity - result.remaining,
          remaining: result.remaining,
          full: result.remaining === 0,
        });
      }
      if (response.status === 401) { signOut(); throw new Error("Please sign in again to book."); }
      if (!response.ok) throw new Error(result.error ?? "We couldn't submit your request. Please try again.");

      setRequestId(result.request.id);
      setSubmitted(true);
    } catch (error) {
      setSubmitError(error.message || "The booking service is unavailable. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = {
    backgroundColor: "rgba(245,237,217,0.07)",
    border: "1px solid rgba(245,237,217,0.15)",
    color: "#F5EDD9",
    borderRadius: "2px",
    padding: "0.625rem 0.875rem",
    width: "100%",
    fontSize: "0.875rem",
    outline: "none",
    fontFamily: "Outfit, sans-serif",
  };

  if (submitted) {
    return (
      <div style={{ minHeight: "100vh" }}>
        <div className="pt-32 pb-24 flex items-center justify-center px-6">
          <div className="max-w-lg w-full text-center">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8 font-display font-bold text-4xl"
              style={{ backgroundColor: "#D4A017", color: "#0D0805" }}
            >
              ✓
            </div>
            <h2 className="font-display font-bold text-4xl mb-4" style={{ color: "#F5EDD9" }}>Booking Request Received!</h2>
            <p className="text-base mb-2" style={{ color: "rgba(245,237,217,0.7)" }}>
              Your request for <strong style={{ color: "#D4A017" }}>{selectedRoute.name}</strong> has been saved.
              We'll confirm it for {riders} rider{riders > 1 ? "s" : ""} via WhatsApp or phone within a few hours.
            </p>
            <p className="text-xs mb-2" style={{ color: "rgba(245,237,217,0.45)" }}>
              Request reference: {requestId}
            </p>
            <p className="text-base mb-10" style={{ color: "rgba(245,237,217,0.7)" }}>
              Total of <strong style={{ color: "#C1440E" }}>P{total}</strong> is payable on the day at Main Mall.
            </p>

            <div className="flex gap-4 justify-center mt-10">
              <button
                onClick={() => setSubmitted(false)}
                className="px-6 py-3 font-bold uppercase tracking-widest text-sm rounded-sm hover:opacity-90 transition-opacity"
                style={{ backgroundColor: "#C1440E", color: "#F5EDD9" }}
              >
                Book Another
              </button>
              <Link
                to="/"
                className="px-6 py-3 font-semibold uppercase tracking-widest text-sm rounded-sm border hover:bg-white/5 transition-colors"
                style={{ borderColor: "rgba(245,237,217,0.3)", color: "#F5EDD9" }}
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Page hero */}
      <header className="page-hero">
        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#D4A017" }}>— The Heritage Trail</p>
        <h1 className="font-display font-bold" style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", color: "#F5EDD9", lineHeight: 1.05 }}>
          Choose an authentic<br />heritage experience
        </h1>
        <p className="mt-4 text-base max-w-xl" style={{ color: "rgba(245,237,217,0.8)" }}>
          Explore the two ways through Gaborone, see what each costs, then reserve your place below. Heritage City Ride runs Wednesday to Friday at 9am or 2pm (maximum 10 riders per group); Casual Saturday includes cycling lessons for kids and adults.
        </p>
      </header>

      <div className="max-w-7xl mx-auto px-6 pt-4">
        <section className="routes-intro mb-16">
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
        <div className="grid md:grid-cols-2 gap-6 mb-16">
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
                onClick={() => chooseRoute(route.id)}
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
        <div className="mb-16">
          <h2 className="font-display font-bold text-2xl mb-2" style={{ color: "#F5EDD9" }}>Sites Along the Heritage City Ride</h2>
          <p className="text-sm mb-8" style={{ color: "rgba(245,237,217,0.55)" }}>The guided Heritage City Ride visits all six in a single loop from Main Mall.</p>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
            {SITES.map((site, i) => (
              <div key={site.id} className="p-4 rounded-sm text-center" style={{ backgroundColor: "rgba(13,8,5,0.4)", border: `1px solid ${site.color === "#1A3A2A" ? "rgba(212,160,23,0.4)" : site.color + "80"}`, backdropFilter: "blur(6px)" }}>
                <Icon name={site.icon} size={24} style={{ color: "#D4A017", marginBottom: "0.5rem" }} />
                <div className="font-bold text-xs leading-tight" style={{ color: "#F5EDD9" }}>{site.name}</div>
                <div className="text-xs mt-1" style={{ color: "rgba(245,237,217,0.45)" }}>Stop {i + 1}</div>
              </div>
            ))}
          </div>
        </div>

      </div>

      <div className="booking-dashboard-wrap" id="book-form">
        <div className="booking-dashboard-meta">
          <div><span className="booking-dashboard-kicker">RIDE RESERVATION</span><h2>Plan your Gaborone ride</h2></div>
          <span className="booking-live-indicator"><i /> Booking requests open</span>
        </div>

        {!isSignedIn ? (
          <div className="booking-gate glass">
            <h3 className="font-display">Create an account to book</h3>
            <p>{ready ? "Booking is for riders with an account, so we can reach you about your ride. It only takes a minute, and you can use Google, Facebook, your phone number or WhatsApp." : "Checking your account…"}</p>
            {ready && (
              <div className="booking-gate-actions">
                <Link to="/login?next=/book%23book-form" className="auth-primary">Create an account</Link>
                <Link to="/login?mode=signin&next=/book%23book-form" className="auth-link">I already have an account</Link>
              </div>
            )}
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="booking-dashboard-form">
          <div className="booking-showcase-grid">
            <section className="booking-bike-feature">
              <div className="booking-bike-copy">
                <span className="booking-dashboard-kicker">CITY BIKE TOURS · GABORONE</span>
                <h3>{selectedRoute.name}</h3>
                <p>{selectedRoute.desc}</p>
                <div className="booking-bike-facts"><span>{selectedRoute.distance}</span><span>{selectedRoute.duration}</span><span>{selectedRoute.sites} stops</span></div>
              </div>
              <img src="/bike1.jfif" alt="Tour bicycle ready for your ride" />
              <div className="booking-bike-caption"><span>{route === "complete" ? "Bike and local guide included" : "Bike and cycling lessons included"}</span><strong>P{selectedRoute.price} <small>/ rider</small></strong></div>
            </section>
          </div>

          <section className="booking-route-panel">
            <div className="booking-panel-heading"><div><span className="booking-dashboard-kicker">01 / SELECT A RIDE</span><h3>Available routes</h3></div><span className="booking-route-count">{routes.length} ride options</span></div>
            <div className="booking-route-table-wrap">
              <table className="booking-route-table">
                <thead><tr><th>Route</th><th>Duration</th><th>Distance</th><th>Availability</th><th>Price / rider</th><th>Choose</th></tr></thead>
                <tbody>{routes.map((ride) => (
                  <tr key={ride.id} className={route === ride.id ? "selected" : ""} onClick={() => handleRouteChange(ride.id)}>
                    <td><strong>{ride.name}</strong><span>{ride.badge}</span></td>
                    <td>{ride.duration}</td><td>{ride.distance}</td><td>{ride.when.split(" · ")[0]}</td><td className="booking-route-price">P{ride.price}</td>
                    <td><label className="booking-route-choice" aria-label={`Select ${ride.name}`}><input type="radio" name="route" value={ride.id} checked={route === ride.id} onChange={() => handleRouteChange(ride.id)} /><span /></label></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </section>

          <div className="booking-details-grid">
            <section className="booking-details-panel">
              <div className="booking-panel-heading"><div><span className="booking-dashboard-kicker">02 / YOUR DETAILS</span><h3>When are you riding?</h3></div><span className="booking-step-mark">02</span></div>
              <div className="booking-input-grid">
                <label className="booking-field">Preferred date<input type="date" required min={new Date().toISOString().slice(0, 10)} value={date} onChange={(event) => setDate(event.target.value)} style={inputStyle} />
                  {checkingAvailability && <small role="status">Checking available spaces…</small>}
                  {!checkingAvailability && availabilityError && <small role="alert">{availabilityError}</small>}
                  {!checkingAvailability && availability?.full && <small role="status">This date is fully booked. Please choose another date.</small>}
                  {!checkingAvailability && availability && !availability.full && <small role="status">{availability.remaining} rider{availability.remaining === 1 ? "" : "s"} available on this date.</small>}
                </label>
                <label className="booking-field booking-rider-field">Riders <span className="booking-rider-value">{riders}</span><input type="range" min={1} max={maxRiders} value={riders} onChange={(event) => setRiders(Number(event.target.value))} /><span className="booking-range-labels"><small>1 rider</small><small>{maxRiders} riders{route === "complete" ? " · group limit" : ""}</small></span></label>
                {route === "complete" && <label className="booking-field">Preferred start time<select value={startTime} onChange={(event) => setStartTime(event.target.value)} style={inputStyle}><option value="09:00">9:00 AM</option><option value="14:00">2:00 PM</option></select></label>}
                <label className="booking-field">Full name<input type="text" required autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" style={inputStyle} /></label>
                <label className="booking-field">Phone / WhatsApp<input type="tel" required autoComplete="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+267 7X XXX XXX" style={inputStyle} /></label>
                <label className="booking-field booking-notes-field">Notes <span className="booking-optional">Optional</span><textarea rows={3} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Accessibility needs, school group, or other requests" style={{ ...inputStyle, resize: "vertical" }} /></label>
              </div>
            </section>

            <aside className="booking-order-panel">
              <div className="booking-panel-heading"><div><span className="booking-dashboard-kicker">03 / YOUR SUMMARY</span><h3>Booking estimate</h3></div><span className="booking-step-mark">03</span></div>
              <div className="booking-order-line"><span>{selectedRoute.name}</span><strong>P{selectedRoute.price}</strong></div>
              <div className="booking-order-line"><span>{riders} rider{riders === 1 ? "" : "s"}</span><strong>× {riders}</strong></div>
              <div className="booking-order-total"><span>Estimated total</span><strong>P{total}</strong></div>
              <p className="booking-payment-note">Pay on the day at Main Mall. No online payment or deposit required.</p>
              {submitError && <p role="alert" className="booking-submit-error">{submitError}</p>}
              {insufficientCapacity && <p role="alert" className="booking-submit-error">Only {availability.remaining} rider{availability.remaining === 1 ? "" : "s"} remain available on this date.</p>}
              <button type="submit" disabled={isSubmitting || checkingAvailability || Boolean(date && (!availability || availability.full || insufficientCapacity || availabilityError))} className="booking-submit-button">{isSubmitting ? "Sending request..." : "Request this ride"}</button>
              <p className="booking-confirmation-note">We will contact you on WhatsApp to confirm availability.</p>
            </aside>
          </div>
        </form>
        )}
      </div>

      <Footer />
    </div>
  );
}