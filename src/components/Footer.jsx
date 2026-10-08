import { Link } from "react-router";
import BikeSVG from "./BikeSVG";
import Icon from "./Icon";
import { BACKEND_BASE_URL } from "../api/backend";

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
                { label: "Gallery", to: "/gallery" },
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
              <div>Wed–Fri, 9am or 2pm — Guided Heritage City Ride (max 10)</div>
              <div>Saturday — Casual ride with lessons for kids and adults</div>
            </div>
          </div>

          <div>
            <div className="font-bold text-sm uppercase tracking-widest mb-4" style={{ color: "#D4A017" }}>Find Us</div>
            <div className="space-y-2 text-sm" style={{ color: "rgba(245,237,217,0.6)" }}>
              <div className="flex items-center gap-2"><Icon name="mapPin" size={15} /> Main Mall, Gaborone</div>
              <div className="flex items-center gap-2"><Icon name="phone" size={15} /> WhatsApp bookings welcome</div>
              <div className="flex items-center gap-2"><Icon name="bicycle" size={15} /> Bikes provided · All levels</div>
              <div className="flex items-center gap-2"><Icon name="flag" size={15} /> Botswana, since independence</div>
            </div>
          </div>
        </div>

        <div
          className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs"
          style={{ borderTop: "1px solid rgba(245,237,217,0.08)", color: "rgba(245,237,217,0.3)" }}
        >
          <span>© 2026 City Bike Tours · Gaborone, Botswana</span>
          <span>Built with pride in Botswana 🇧🇼</span>
          {BACKEND_BASE_URL ? (
            <a
              href={`${BACKEND_BASE_URL}/admin/login`}
              className="inline-flex items-center justify-center border px-4 py-2 font-semibold transition-colors hover:bg-white/5"
              style={{ borderColor: "rgba(212,160,23,0.55)", color: "#D4A017" }}
            >
              Admin Login
            </a>
          ) : (
            <Link
              to="/admin/login"
              className="inline-flex items-center justify-center border px-4 py-2 font-semibold transition-colors hover:bg-white/5"
              style={{ borderColor: "rgba(212,160,23,0.55)", color: "#D4A017" }}
            >
              Admin Login
            </Link>
          )}
        </div>
      </div>
    </footer>
  );
}
