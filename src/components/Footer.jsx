import { Link } from "react-router";
import BikeSVG from "./BikeSVG";

export default function Footer() {
  return (
    <footer style={{ backgroundColor: "#080503" }}>
      <div className="h-1 tribal-border" />
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-10">
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <BikeSVG size={32} color="#D4A017" />
              <div>
                <div className="font-display font-bold text-lg" style={{ color: "#F5EDD9" }}>City Bike Tours</div>
                <div className="text-xs tracking-widest uppercase" style={{ color: "#D4A017" }}>Gaborone Heritage</div>
              </div>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "rgba(245,237,217,0.5)" }}>
              Gaborone's heritage bicycle tour — six landmark sites, one proud nation's story.
            </p>
          </div>

          <div>
            <div className="font-bold text-sm uppercase tracking-widest mb-4" style={{ color: "#D4A017" }}>Navigate</div>
            <div className="flex flex-col gap-2">
              {[
                { label: "Home", to: "/" },
                { label: "Schedule", to: "/schedule" },
                { label: "Routes", to: "/routes" },
                { label: "Pricing", to: "/pricing" },
                { label: "Book a Ride", to: "/book" },
              ].map(({ label, to }) => (
                <Link key={to} to={to} className="text-sm hover:opacity-80 transition-opacity" style={{ color: "rgba(245,237,217,0.6)" }}>
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <div className="font-bold text-sm uppercase tracking-widest mb-4" style={{ color: "#D4A017" }}>Schedule</div>
            <div className="space-y-2 text-sm" style={{ color: "rgba(245,237,217,0.6)" }}>
              <div>Wednesday 14:30 — Weekly Ride</div>
              <div>Thu & Fri — On Request (9am–5pm)</div>
              <div>Saturday (1st & last) — Lessons</div>
            </div>
          </div>

          <div>
            <div className="font-bold text-sm uppercase tracking-widest mb-4" style={{ color: "#D4A017" }}>Find Us</div>
            <div className="space-y-2 text-sm" style={{ color: "rgba(245,237,217,0.6)" }}>
              <div>📍 Main Mall, Gaborone</div>
              <div>📱 WhatsApp bookings welcome</div>
              <div>🚲 Bikes provided · All levels</div>
              <div>🇧🇼 Botswana, since independence</div>
            </div>
          </div>
        </div>

        <div
          className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs"
          style={{ borderTop: "1px solid rgba(245,237,217,0.08)", color: "rgba(245,237,217,0.3)" }}
        >
          <span>© 2026 City Bike Tours · Gaborone, Botswana</span>
          <span>Built with pride in Botswana 🇧🇼</span>
        </div>
      </div>
    </footer>
  );
}
