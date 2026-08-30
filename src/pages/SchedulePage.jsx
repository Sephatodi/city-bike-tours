import { useEffect } from "react";
import { Link } from "react-router";
import Footer from "../components/Footer";

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

  return (
    <div style={{ backgroundColor: "#0D0805", minHeight: "100vh" }}>
      {/* Page hero */}
      <div
        className="relative pt-32 pb-16 tribal-pattern"
        style={{ backgroundColor: "#1A3A2A" }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#D4A017" }}>— When We Ride</p>
          <h1 className="font-display font-bold" style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", color: "#F5EDD9", lineHeight: 1.05 }}>
            Schedule &<br />Availability
          </h1>
          <p className="mt-4 text-base max-w-lg" style={{ color: "rgba(245,237,217,0.65)" }}>
            Every Wednesday at 14:30 we're at Main Mall without fail. For other days, book ahead.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">

        {/* Three schedule cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-16 reveal">

          {/* Wednesday */}
          <div className="p-8 rounded-sm relative overflow-hidden" style={{ backgroundColor: "#C1440E", border: "1px solid rgba(245,237,217,0.1)" }}>
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10" style={{ backgroundColor: "#F5EDD9", transform: "translate(30%, -30%)" }} />
            <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "rgba(245,237,217,0.75)" }}>The Signature Adventure</div>
            <div className="font-display font-bold text-4xl mb-1 leading-tight" style={{ color: "#F5EDD9" }}>
              Wednesday<br />Weekly Guided<br />Adventure
            </div>
            <div className="flex items-center gap-2 mt-3 mb-4">
              <span>🕑</span>
              <span className="font-bold text-lg" style={{ color: "#F5EDD9" }}>2:30 PM Every Wednesday</span>
            </div>
            <div className="h-px mb-4" style={{ backgroundColor: "rgba(245,237,217,0.3)" }} />
            <p className="text-sm leading-relaxed mb-4" style={{ color: "rgba(245,237,217,0.88)" }}>
              Join a community of explorers on our flagship tour. This comprehensive ride covers the most significant historical landmarks in Gaborone, led by expert local guides who bring the past to life.
            </p>
            <div className="text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-sm inline-block" style={{ backgroundColor: "rgba(245,237,217,0.2)", color: "#F5EDD9" }}>
              Our Premier Guided Experience
            </div>
          </div>

          {/* Thu–Fri */}
          <div className="p-8 rounded-sm relative overflow-hidden" style={{ backgroundColor: "#0D0805", border: "1px solid rgba(212,160,23,0.3)" }}>
            <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#D4A017" }}>Flexible Touring Options</div>
            <div className="font-display font-bold text-3xl mb-1 leading-tight" style={{ color: "#F5EDD9" }}>
              Private Tours<br />(Thu / Fri)
            </div>
            <div className="inline-block text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm mb-4 mt-2" style={{ backgroundColor: "rgba(212,160,23,0.2)", color: "#D4A017" }}>
              Request Only
            </div>
            <div className="h-px mb-4" style={{ backgroundColor: "rgba(212,160,23,0.2)" }} />
            <div className="flex items-center gap-2 mb-3">
              <span>📅</span>
              <span className="font-semibold text-sm" style={{ color: "#F5EDD9" }}>Available 9:00 AM – 5:00 PM</span>
            </div>
            <p className="text-sm leading-relaxed mb-6" style={{ color: "rgba(245,237,217,0.75)" }}>
              Perfect for private groups or specific itinerary requests. Choose your route within the heritage radius — we'll confirm and guide.
            </p>
            <Link to="/book" className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-sm transition-opacity hover:opacity-80" style={{ backgroundColor: "#D4A017", color: "#0D0805" }}>
              ✉ Inquire Now
            </Link>
          </div>

          {/* Saturday */}
          <div className="p-8 rounded-sm relative overflow-hidden" style={{ backgroundColor: "#0D0805", border: "1px solid rgba(245,237,217,0.15)" }}>
            <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "rgba(245,237,217,0.5)" }}>Flexible Touring Options</div>
            <div className="font-display font-bold text-3xl mb-1 leading-tight" style={{ color: "#F5EDD9" }}>
              Saturday<br />Cycling Lessons
            </div>
            <div className="inline-block text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm mb-4 mt-2" style={{ backgroundColor: "rgba(193,68,14,0.25)", color: "#C1440E" }}>
              P250
            </div>
            <div className="h-px mb-4" style={{ backgroundColor: "rgba(245,237,217,0.1)" }} />
            <div className="flex items-center gap-2 mb-3">
              <span>🗓</span>
              <span className="font-semibold text-sm" style={{ color: "#F5EDD9" }}>1st & last Saturday of every month</span>
            </div>
            <p className="text-sm leading-relaxed mb-4" style={{ color: "rgba(245,237,217,0.75)" }}>
              Build confidence and learn essential cycling skills in a supportive environment before tackling the main routes.
            </p>
            <div className="text-xs" style={{ color: "rgba(245,237,217,0.4)" }}>Kids · Adults · All welcome · Main Mall</div>
          </div>
        </div>

        {/* Meeting point callout */}
        <div className="p-6 rounded-sm flex items-center gap-4 mb-16 reveal" style={{ backgroundColor: "rgba(212,160,23,0.08)", border: "1px solid rgba(212,160,23,0.25)" }}>
          <span className="text-4xl">📍</span>
          <div>
            <div className="font-bold text-sm uppercase tracking-widest" style={{ color: "#D4A017" }}>Meeting Point — Every Ride</div>
            <div className="font-display font-bold text-2xl" style={{ color: "#F5EDD9" }}>Main Mall, Gaborone City Centre</div>
            <div className="text-sm mt-0.5" style={{ color: "rgba(245,237,217,0.6)" }}>Look for the orange City Bike Tours flag at the main entrance</div>
          </div>
        </div>

        {/* Weekly calendar strip */}
        <div className="mb-16 reveal">
          <h2 className="font-display font-bold text-2xl mb-6" style={{ color: "#F5EDD9" }}>Weekly at a Glance</h2>
          <div className="grid grid-cols-7 gap-1">
            {[
              { day: "Mon", label: "Closed", active: false },
              { day: "Tue", label: "Closed", active: false },
              { day: "Wed", label: "14:30\nFlagship", active: true, color: "#C1440E" },
              { day: "Thu", label: "9–17\nOn request", active: true, color: "#D4A017" },
              { day: "Fri", label: "9–17\nOn request", active: true, color: "#D4A017" },
              { day: "Sat", label: "1st & last\nLessons", active: true, color: "#1A3A2A" },
              { day: "Sun", label: "Closed", active: false },
            ].map(({ day, label, active, color }) => (
              <div
                key={day}
                className="p-3 rounded-sm text-center"
                style={{
                  backgroundColor: active ? `${color}22` : "rgba(245,237,217,0.03)",
                  border: `1px solid ${active ? color + "55" : "rgba(245,237,217,0.06)"}`,
                }}
              >
                <div className="font-bold text-xs uppercase tracking-widest mb-2" style={{ color: active ? color : "rgba(245,237,217,0.3)" }}>{day}</div>
                <div className="text-xs leading-tight whitespace-pre-line" style={{ color: active ? "rgba(245,237,217,0.8)" : "rgba(245,237,217,0.2)" }}>
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center reveal">
          <Link to="/book" className="inline-block px-10 py-4 font-bold uppercase tracking-widest text-sm rounded-sm hover:opacity-90 transition-opacity" style={{ backgroundColor: "#C1440E", color: "#F5EDD9" }}>
            Book Your Ride Now
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
