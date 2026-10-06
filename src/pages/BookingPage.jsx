import { useState } from "react";
import { Link } from "react-router";
import Footer from "../components/Footer";
import HeaderBike from "../components/HeaderBike";
import HeritageMap from "../components/HeritageMap";
import { ROUTES_DATA } from "../data";

export default function BookingPage() {
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

  const selectedRoute = ROUTES_DATA.find((r) => r.id === route);
  const total = selectedRoute.price * riders;
  const maxRiders = route === "complete" ? 10 : 20;

  const handleRouteChange = (routeId) => {
    setRoute(routeId);
    setRiders((current) => Math.min(current, routeId === "complete" ? 10 : 20));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ?? "";
      const response = await fetch(`${apiBaseUrl}/api/booking-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      <div style={{ backgroundColor: "#0D0805", minHeight: "100vh" }}>
        <div className="pt-32 pb-24 flex items-center justify-center px-6">
          <div className="max-w-lg w-full text-center">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8 font-display font-bold text-4xl"
              style={{ backgroundColor: "#D4A017", color: "#0D0805" }}
            >
              ✓
            </div>
            <h2 className="font-display font-bold text-4xl mb-4" style={{ color: "#F5EDD9" }}>Booking Received!</h2>
            <p className="text-base mb-2" style={{ color: "rgba(245,237,217,0.7)" }}>
              Your request for <strong style={{ color: "#D4A017" }}>{selectedRoute.name}</strong> has been saved. We'll confirm it for{" "}
              {riders} rider{riders > 1 ? "s" : ""} via WhatsApp or phone within a few hours.
            </p>
            <p className="text-xs mb-2" style={{ color: "rgba(245,237,217,0.45)" }}>
              Request reference: {requestId}
            </p>
            <p className="text-base mb-10" style={{ color: "rgba(245,237,217,0.7)" }}>
              Total of <strong style={{ color: "#C1440E" }}>P{total}</strong> is payable on the day at Main Mall.
            </p>
            <div className="flex gap-4 justify-center">
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
    <div style={{ backgroundColor: "#0D0805", minHeight: "100vh" }}>
      {/* Page hero */}
      <div className="relative overflow-hidden pt-32 pb-16 tribal-pattern" style={{ backgroundColor: "#0F0B06" }}>
        <HeaderBike />
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#C1440E" }}>— Reserve Your Spot</p>
          <h1 className="font-display font-bold" style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", color: "#F5EDD9", lineHeight: 1.05 }}>
            Book a Ride
          </h1>
          <p className="mt-4 text-base max-w-lg" style={{ color: "rgba(245,237,217,0.65)" }}>
            Reserve a guided Heritage City Ride Wednesday to Friday at 9am or 2pm (maximum 10 riders per group), or request a place on the relaxed Casual Saturday ride. Saturday rides include cycling lessons for kids and adults.
          </p>
        </div>
      </div>

      <div className="booking-dashboard-wrap">
        <div className="booking-dashboard-meta">
          <div><span className="booking-dashboard-kicker">RIDE RESERVATION</span><h2>Plan your Gaborone ride</h2></div>
          <span className="booking-live-indicator"><i /> Booking requests open</span>
        </div>

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

            <section className="booking-map-panel">
              <div className="booking-panel-heading"><div><span className="booking-dashboard-kicker">RIDE AREA</span><h3>Gaborone heritage route</h3></div><span className="booking-map-pin" style={{ color: selectedRoute.badgeColor, borderColor: selectedRoute.badgeColor }}>{selectedRoute.name}</span></div>
              <HeritageMap height="330px" routeId={route} />
            </section>
          </div>

          <section className="booking-route-panel">
            <div className="booking-panel-heading"><div><span className="booking-dashboard-kicker">01 / SELECT A RIDE</span><h3>Available routes</h3></div><span className="booking-route-count">{ROUTES_DATA.length} ride options</span></div>
            <div className="booking-route-table-wrap">
              <table className="booking-route-table">
                <thead><tr><th>Route</th><th>Duration</th><th>Distance</th><th>Availability</th><th>Price / rider</th><th>Choose</th></tr></thead>
                <tbody>{ROUTES_DATA.map((ride) => (
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
                <label className="booking-field">Preferred date<input type="date" required min={new Date().toISOString().slice(0, 10)} value={date} onChange={(event) => setDate(event.target.value)} style={inputStyle} /></label>
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
              <button type="submit" disabled={isSubmitting} className="booking-submit-button">{isSubmitting ? "Sending request..." : "Request this ride"}</button>
              <p className="booking-confirmation-note">We will contact you on WhatsApp to confirm availability.</p>
            </aside>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
}
