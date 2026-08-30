import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router";
import BikeSVG from "./BikeSVG";

const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "Schedule", to: "/schedule" },
  { label: "Routes", to: "/routes" },
  { label: "Pricing", to: "/pricing" },
  { label: "Book", to: "/book" },
];

export default function Nav() {
  const [scrollY, setScrollY] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const solid = scrollY > 80;

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        backgroundColor: solid || menuOpen ? "rgba(13,8,5,0.97)" : "transparent",
        backdropFilter: solid ? "blur(12px)" : "none",
      }}
    >
      <div className="h-1 tribal-border" />
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <BikeSVG size={36} color="#D4A017" />
          <div>
            <div className="font-display font-bold text-lg leading-tight" style={{ color: "#F5EDD9" }}>
              City Bike Tours
            </div>
            <div className="text-xs tracking-widest uppercase" style={{ color: "#D4A017" }}>
              Gaborone Heritage
            </div>
          </div>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(({ label, to }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className="nav-link tracking-wide uppercase font-medium text-xs"
                style={{ color: active ? "#D4A017" : "#F5EDD9" }}
              >
                {label}
              </Link>
            );
          })}
        </div>

        <Link
          to="/book"
          className="hidden md:inline-block px-5 py-2 text-sm font-semibold tracking-wide uppercase rounded-sm transition-all hover:opacity-90"
          style={{ backgroundColor: "#C1440E", color: "#F5EDD9" }}
        >
          Book Now
        </Link>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="block w-6 h-0.5 transition-all"
              style={{ backgroundColor: "#F5EDD9" }}
            />
          ))}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden px-6 pb-6 flex flex-col gap-4" style={{ backgroundColor: "rgba(13,8,5,0.97)" }}>
          {NAV_LINKS.map(({ label, to }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMenuOpen(false)}
              className="text-sm font-semibold uppercase tracking-widest"
              style={{ color: location.pathname === to ? "#D4A017" : "#F5EDD9" }}
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
