import { Link } from "react-router";
import Icon from "./Icon";
import { BACKEND_BASE_URL, ADMIN_BASE_URL } from "../api/backend";

export default function Footer() {
  return (
    <footer style={{ backgroundColor: "rgba(13,8,5,0.5)", backdropFilter: "blur(8px)" }}>
      <div className="max-w-7xl mx-auto" style={{ padding: "43px 1.5rem" }}>
        <div className="grid md:grid-cols-4" style={{ gap: "29px", marginBottom: "36px" }}>
          <div className="md:col-span-1">
            <div className="flex items-center" style={{ gap: "11px", marginBottom: "14px" }}>
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
            <div className="font-bold text-sm uppercase tracking-widest" style={{ color: "#D4A017", marginBottom: "14px" }}>Navigate</div>
            <div className="flex flex-col" style={{ gap: "7px" }}>
              {[
                { label: "Home", to: "/" },
                { label: "Reserve", to: "/schedule" },
                { label: "Heritage Trail", to: "/heritage-trail" },
                { label: "Gallery", to: "/gallery" },
                { label: "Sign in", to: "/login" },
              ].map(({ label, to }) => (
                <Link key={to} to={to} className="text-sm hover:opacity-80 transition-opacity" style={{ color: "rgba(245,237,217,0.6)" }}>
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <div className="font-bold text-sm uppercase tracking-widest" style={{ color: "#D4A017", marginBottom: "14px" }}>Schedule</div>
            <div className="text-sm" style={{ color: "rgba(245,237,217,0.6)", gap: "7px", display: "flex", flexDirection: "column" }}>
              <div>Wed–Fri, 9am or 2pm — Guided Heritage City Ride (max 10)</div>
              <div>Saturday — Casual ride with lessons for kids and adults</div>
            </div>
          </div>

          <div>
            <div className="font-bold text-sm uppercase tracking-widest" style={{ color: "#D4A017", marginBottom: "14px" }}>Find Us</div>
            <div className="text-sm" style={{ color: "rgba(245,237,217,0.6)", gap: "7px", display: "flex", flexDirection: "column" }}>
              <div className="flex items-center" style={{ gap: "7px" }}><Icon name="mapPin" size={15} /> Main Mall, Gaborone</div>
              <div className="flex items-center" style={{ gap: "7px" }}><Icon name="phone" size={15} /> WhatsApp bookings welcome</div>
              <div className="flex items-center" style={{ gap: "7px" }}><Icon name="bicycle" size={15} /> Bikes provided · All levels</div>
              <div className="flex items-center" style={{ gap: "7px" }}><Icon name="flag" size={15} /> Botswana, since independence</div>
            </div>
          </div>
        </div>

        <div
          className="flex flex-col md:flex-row items-center justify-between text-xs"
          style={{ paddingTop: "22px", gap: "14px", borderTop: "1px solid rgba(245,237,217,0.08)", color: "rgba(245,237,217,0.3)" }}
        >
          <span>© 2026 City Bike Tours · Gaborone, Botswana</span>
          <span className="flex" style={{ gap: "14px" }}>
            <Link to="/privacy" className="hover:opacity-80">Privacy</Link>
            <Link to="/terms" className="hover:opacity-80">Terms</Link>
            <Link to="/data-deletion" className="hover:opacity-80">Delete my data</Link>
          </span>
          <span>Built with pride in Botswana 🇧🇼</span>
          {ADMIN_BASE_URL ? (
            <a href={`${ADMIN_BASE_URL}/admin/login`} className="inline-flex items-center justify-center border font-semibold transition-colors hover:bg-white/5" style={{ padding: "7px 14px", borderColor: "rgba(212,160,23,0.55)", color: "#D4A017" }}>Admin Login</a>
          ) : BACKEND_BASE_URL ? (
            <a href={`${BACKEND_BASE_URL}/admin/login`} className="inline-flex items-center justify-center border font-semibold transition-colors hover:bg-white/5" style={{ padding: "7px 14px", borderColor: "rgba(212,160,23,0.55)", color: "#D4A017" }}>Admin Login</a>
          ) : (
            <Link to="/admin/login" className="inline-flex items-center justify-center border font-semibold transition-colors hover:bg-white/5" style={{ padding: "7px 14px", borderColor: "rgba(212,160,23,0.55)", color: "#D4A017" }}>Admin Login</Link>
          )}
        </div>
      </div>
    </footer>
  );
}
