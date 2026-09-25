import { useState } from "react";
import { Link } from "react-router";
import Footer from "../components/Footer";
import HeaderBike from "../components/HeaderBike";
import { ROUTES_DATA } from "../data";

export default function BookingPage() {
  const [route, setRoute] = useState("complete");
  const [date, setDate] = useState("");
  const [riders, setRiders] = useState(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const selectedRoute = ROUTES_DATA.find((r) => r.id === route);
  const total = selectedRoute.price * riders;

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
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
              We'll confirm your <strong style={{ color: "#D4A017" }}>{selectedRoute.name}</strong> for{" "}
              {riders} rider{riders > 1 ? "s" : ""} via WhatsApp or phone within a few hours.
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
            Wednesday rides need no advance booking — just show up at Main Mall by 14:25.
            For private rides and Saturday lessons, book ahead so we can confirm.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-5 gap-12">

          {/* Left — info + summary */}
          <div className="lg:col-span-2">
            {/* Price summary */}
            <div className="p-6 rounded-sm mb-6 sticky top-28" style={{ backgroundColor: "rgba(26,58,42,0.25)", border: "1px solid rgba(26,58,42,0.5)" }}>
              <div className="font-bold text-sm uppercase tracking-widest mb-5" style={{ color: "#D4A017" }}>Price Summary</div>

              <div className="flex justify-between text-sm mb-2" style={{ color: "rgba(245,237,217,0.7)" }}>
                <span>{selectedRoute.name}</span>
                <span>P{selectedRoute.price}</span>
              </div>
              <div className="flex justify-between text-sm mb-4" style={{ color: "rgba(245,237,217,0.5)" }}>
                <span>Riders</span>
                <span>× {riders}</span>
              </div>
              <div className="h-px mb-4" style={{ backgroundColor: "rgba(245,237,217,0.1)" }} />
              <div className="flex justify-between font-bold text-2xl mb-1">
                <span style={{ color: "#F5EDD9" }}>Total</span>
                <span style={{ color: "#D4A017" }}>P{total}</span>
              </div>
              <div className="text-xs" style={{ color: "rgba(245,237,217,0.35)" }}>Payable on the day · No deposit</div>

              <div className="mt-6 pt-5" style={{ borderTop: "1px solid rgba(245,237,217,0.08)" }}>
                {[
                  ["📍", "Main Mall, Gaborone"],
                  ["🚲", "Bike provided"],
                  ["📱", "WhatsApp confirmation"],
                  ["💳", "Cash on the day"],
                ].map(([icon, text]) => (
                  <div key={text} className="flex items-center gap-3 text-xs mb-2" style={{ color: "rgba(245,237,217,0.55)" }}>
                    <span>{icon}</span><span>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right — form */}
          <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-6">

            {/* Route selection */}
            <div>
              <div className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#D4A017" }}>Choose Your Route</div>
              <div className="flex flex-col gap-3">
                {ROUTES_DATA.map((r) => (
                  <label
                    key={r.id}
                    className="flex items-start gap-4 p-5 rounded-sm cursor-pointer transition-all"
                    style={{
                      backgroundColor: route === r.id ? `${r.badgeColor}18` : "rgba(245,237,217,0.04)",
                      border: `1px solid ${route === r.id ? r.badgeColor : "rgba(245,237,217,0.08)"}`,
                    }}
                  >
                    <input
                      type="radio"
                      name="route"
                      value={r.id}
                      checked={route === r.id}
                      onChange={() => setRoute(r.id)}
                      className="mt-1"
                      style={{ accentColor: r.badgeColor }}
                    />
                    <div className="flex-1">
                      <div className="font-bold text-sm mb-0.5" style={{ color: "#F5EDD9" }}>{r.name}</div>
                      <div className="text-xs mb-1" style={{ color: "rgba(245,237,217,0.5)" }}>{r.when}</div>
                      <div className="text-xs" style={{ color: "rgba(245,237,217,0.4)" }}>{r.duration} · {r.distance}</div>
                    </div>
                    <div className="font-display font-bold text-xl flex-shrink-0" style={{ color: r.badgeColor }}>P{r.price}</div>
                  </label>
                ))}
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "rgba(245,237,217,0.5)" }}>Full Name</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" style={inputStyle} />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "rgba(245,237,217,0.5)" }}>Phone / WhatsApp</label>
              <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+267 7X XXX XXX" style={inputStyle} />
            </div>

            {/* Date + riders */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "rgba(245,237,217,0.5)" }}>Preferred Date</label>
                <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} style={{ ...inputStyle, colorScheme: "dark" }} />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "rgba(245,237,217,0.5)" }}>
                  Riders · <span style={{ color: "#D4A017" }}>{riders}</span>
                </label>
                <input
                  type="range"
                  min={1}
                  max={20}
                  value={riders}
                  onChange={(e) => setRiders(Number(e.target.value))}
                  className="w-full mt-3"
                />
                <div className="flex justify-between text-xs mt-1" style={{ color: "rgba(245,237,217,0.3)" }}>
                  <span>1</span><span>20</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "rgba(245,237,217,0.5)" }}>
                Notes <span style={{ opacity: 0.5 }}>(optional)</span>
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Your own route? Accessibility needs? School group?"
                style={{ ...inputStyle, resize: "none" }}
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 font-bold uppercase tracking-widest text-sm rounded-sm transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#C1440E", color: "#F5EDD9" }}
            >
              Confirm Booking — P{total}
            </button>
            <p className="text-center text-xs" style={{ color: "rgba(245,237,217,0.3)" }}>
              We will WhatsApp you a confirmation. No payment taken online.
            </p>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
}
