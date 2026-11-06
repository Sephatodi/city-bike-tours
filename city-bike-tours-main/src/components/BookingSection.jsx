import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import { ROUTES_DATA } from "../data";
import { backendUrl } from "../api/backend";
import { useLiveData } from "../hooks/LiveDataContext";
import { useCustomer } from "../auth/CustomerAuth";
import { generateBookingCode, saveBookingCode } from "../lib/bookingCode";

export default function BookingSection() {
  const { routes } = useLiveData();
  const { isSignedIn, ready, user, signOut } = useCustomer();
  const { hash } = useLocation();
  const [route, setRoute] = useState("complete");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [riders, setRiders] = useState(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [requestId, setRequestId] = useState("");
  const [bookingCode, setBookingCode] = useState("");
  const [availability, setAvailability] = useState(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availabilityError, setAvailabilityError] = useState("");

  useEffect(() => {
    if (!hash) return undefined;
    const timer = setTimeout(() => {
      document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 300);
    return () => clearTimeout(timer);
  }, [hash]);

  useEffect(() => {
    if (!isSignedIn || !user) return;
    setName((current) => current || user.name || "");
    setEmail((current) => current || user.email || "");
    setPhone((current) => current || user.phone || "");
  }, [isSignedIn, user]);

  useEffect(() => {
    if (route !== "complete" || !date) {
      setAvailability(null);
      setAvailabilityError("");
      setCheckingAvailability(false);
      return undefined;
    }
    const controller = new AbortController();
    setCheckingAvailability(true);
    setAvailabilityError("");
    fetch(backendUrl(`/api/availability?date=${encodeURIComponent(date)}`), { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("We couldn't check available spaces for this date.");
        return response.json();
      })
      .then((data) => setAvailability(data.availability ?? null))
      .catch((error) => { if (error.name !== "AbortError") setAvailabilityError(error.message); })
      .finally(() => { if (!controller.signal.aborted) setCheckingAvailability(false); });
    return () => controller.abort();
  }, [date, route]);

  const selectedRoute = (routes || ROUTES_DATA).find((r) => r.id === route) || (routes || ROUTES_DATA)[0];
  const price = selectedRoute?.price ?? 0;
  const total = price * riders;
  const hasCapacity = route !== "complete" || !availability || availability.remaining >= riders;
  const canSubmit = Boolean(date) && riders > 0 && !isSubmitting && !checkingAvailability && hasCapacity;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!isSignedIn) return;
    setSubmitError("");
    setIsSubmitting(true);
    try {
      const response = await fetch(backendUrl("/api/booking-requests"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(localStorage.getItem("cb_customer_token") ? { Authorization: `Bearer ${localStorage.getItem("cb_customer_token")}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify({
          name, phone, email, routeId: route, dateIso: date, riders,
          notes: route === "complete" ? [`Preferred start time: ${startTime}`, notes].filter(Boolean).join("\n") : notes,
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (response.status === 409 && Number.isInteger(result.remaining)) {
        setAvailability((current) => current && ({ ...current, booked: current.capacity - result.remaining, remaining: result.remaining, full: result.remaining === 0 }));
      }
      if (response.status === 401) { signOut(); throw new Error("Please sign in again to book."); }
      if (!response.ok) throw new Error(result.error ?? "We couldn't submit your request. Please try again.");
      setRequestId(result.request?.id || "");
      const code = generateBookingCode();
      saveBookingCode(code);
      setBookingCode(code);
      setSubmitted(true);
    } catch (error) {
      setSubmitError(error.message || "The booking service is unavailable. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputStyle = {
    backgroundColor: "rgba(245,237,217,0.07)", border: "1px solid rgba(245,237,217,0.15)",
    color: "#F5EDD9", borderRadius: "2px", padding: "0.625rem 0.875rem", width: "100%",
    fontSize: "0.875rem", outline: "none", fontFamily: "Outfit, sans-serif",
  };

  if (submitted) {
    return (
      <div className="max-w-lg w-full text-center mx-auto">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8 font-display font-bold text-4xl" style={{ backgroundColor: "#D4A017", color: "#0D0805" }}>✓</div>
        <h2 className="font-display font-bold text-4xl mb-4" style={{ color: "#F5EDD9" }}>Booking Request Received!</h2>
        <p className="text-base mb-2" style={{ color: "rgba(245,237,217,0.7)" }}>
          Your request for <strong style={{ color: "#D4A017" }}>{selectedRoute.name}</strong> has been saved.
          We'll confirm it for {riders} rider{riders > 1 ? "s" : ""} via WhatsApp or phone within a few hours.
        </p>
        <p className="text-xs mb-2" style={{ color: "rgba(245,237,217,0.45)" }}>Request reference: {requestId}</p>
        {bookingCode && (
          <div className="booking-code-box glass-soft" style={{ padding: "1rem 1.25rem", borderRadius: 6, marginTop: "1rem", marginBottom: "1rem", textAlign: "left" }}>
            <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#D4A017" }}>Your booking code</p>
            <p className="font-display font-bold" style={{ fontSize: "2rem", letterSpacing: "0.15em", color: "#F5EDD9" }}>{bookingCode}</p>
            <p className="text-xs mt-2" style={{ color: "rgba(245,237,217,0.6)" }}>
              Save this code — you'll need it to upload rider photos. It is only stored on this device, so keep it safe.
            </p>
          </div>
        )}
        <p className="text-base mb-10" style={{ color: "rgba(245,237,217,0.7)" }}>
          Total of <strong style={{ color: "#C1440E" }}>P{total}</strong> is payable on the day at Main Mall.
        </p>
        <button onClick={() => setSubmitted(false)} className="px-6 py-3 font-bold uppercase tracking-widest text-sm rounded-sm hover:opacity-90 transition-opacity" style={{ backgroundColor: "#C1440E", color: "#F5EDD9" }}>Book Another</button>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="booking-gate glass" style={{ padding: "2rem", borderRadius: 8 }}>
        <h3 className="font-display font-bold text-2xl mb-2" style={{ color: "#F5EDD9" }}>Create an account to book</h3>
        <p style={{ color: "rgba(245,237,217,0.7)" }}>{ready ? "Booking is for riders with an account, so we can reach you about your ride. It only takes a minute, and you can use Google, Facebook, your phone number or WhatsApp." : "Checking your account…"}</p>
        {ready && (
          <div className="booking-gate-actions" style={{ marginTop: "1rem", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <Link to="/login?mode=signup&next=/heritage-trail%23trail-book" className="auth-primary">Create an account</Link>
            <Link to="/login?mode=signin&next=/heritage-trail%23trail-book" className="auth-link">I already have an account</Link>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-[1fr,1.4fr] gap-12 items-start">
      <div>
        <h3 className="font-display font-bold text-2xl mb-6" style={{ color: "#F5EDD9" }}>Select your route</h3>
        <div className="space-y-3">
          {routes.map((r) => (
            <button key={r.id} type="button" onClick={() => setRoute(r.id)}
              className="w-full text-left p-4 rounded-sm transition-all"
              style={{ backgroundColor: route === r.id ? `${r.badgeColor}22` : "rgba(245,237,217,0.04)", border: `2px solid ${route === r.id ? r.badgeColor : "rgba(245,237,217,0.08)"}` }}>
              <div className="font-bold text-sm mb-1" style={{ color: route === r.id ? r.badgeColor : "#F5EDD9" }}>{r.name}</div>
              <div className="flex justify-between items-center">
                <span className="text-xs" style={{ color: "rgba(245,237,217,0.6)" }}>{r.duration}</span>
                <span className="font-display font-bold text-lg" style={{ color: r.badgeColor }}>P{r.price}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 rounded-sm glass" style={{ border: "1px solid rgba(245,237,217,0.08)" }}>
        <h3 className="font-display font-bold text-2xl mb-6" style={{ color: "#F5EDD9" }}>Your details</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="block text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "rgba(245,237,217,0.5)" }}>Full Name *</label><input required style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" /></div>
            <div><label className="block text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "rgba(245,237,217,0.5)" }}>Phone / WhatsApp *</label><input required style={inputStyle} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+267 7X XXX XXX" /></div>
          </div>
          <div><label className="block text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "rgba(245,237,217,0.5)" }}>Email</label><input type="email" style={inputStyle} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" /></div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="block text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "rgba(245,237,217,0.5)" }}>Preferred Date *</label><input type="date" required style={inputStyle} value={date} onChange={(e) => setDate(e.target.value)} min={new Date().toISOString().split("T")[0]} /></div>
            <div><label className="block text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "rgba(245,237,217,0.5)" }}>Number of Riders *</label><input type="number" required min={1} max={20} style={inputStyle} value={riders} onChange={(e) => setRiders(Math.max(1, parseInt(e.target.value, 10) || 1))} /></div>
          </div>
          {route === "complete" && (
            <div><label className="block text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "rgba(245,237,217,0.5)" }}>Preferred start time</label><select style={inputStyle} value={startTime} onChange={(e) => setStartTime(e.target.value)}><option value="09:00">9:00 AM</option><option value="14:00">2:00 PM</option></select></div>
          )}
          {route === "complete" && date && (
            <div className="rounded-sm px-4 py-3 text-sm" style={{ backgroundColor: availability?.full ? "rgba(139,48,8,0.16)" : "rgba(212,160,23,0.08)", border: `1px solid ${availability?.full ? "rgba(139,48,8,0.35)" : "rgba(212,160,23,0.2)"}`, color: "rgba(245,237,217,0.8)" }}>
              {checkingAvailability ? "Checking available spaces…" : availabilityError ? availabilityError : availability ? (availability.full ? "This guided ride is full for the selected date." : `${availability.remaining} of ${availability.capacity} spaces left for ${availability.date}.`) : "Choose a date to check availability."}
            </div>
          )}
          <div><label className="block text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "rgba(245,237,217,0.5)" }}>Notes <span style={{ opacity: 0.5 }}>(optional)</span></label><textarea style={{ ...inputStyle, resize: "vertical", minHeight: "90px" }} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any special requirements, fitness levels, or questions…" /></div>
          {submitError && <p className="text-sm" style={{ color: "#F5A58D" }}>{submitError}</p>}
          <button type="submit" disabled={!canSubmit} className="w-full py-4 font-bold uppercase tracking-widest text-sm rounded-sm transition-all hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: canSubmit ? "#C1440E" : "rgba(245,237,217,0.15)", color: "#F5EDD9", cursor: canSubmit ? "pointer" : "not-allowed" }}>
            {isSubmitting ? "Submitting..." : `Send Request · P${total} total`}
          </button>
          <p className="text-xs text-center" style={{ color: "rgba(245,237,217,0.4)" }}>No payment online. We'll confirm and take payment on the day.</p>
        </form>
      </div>
    </div>
  );
}
