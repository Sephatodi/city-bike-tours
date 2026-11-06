import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router";
import { useCustomer } from "../auth/CustomerAuth";

const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "Reserve", to: "/schedule" },
  { label: "Heritage Trail", to: "/heritage-trail" },
  { label: "Gallery", to: "/gallery" },
];

export default function Nav() {
  const [scrollY, setScrollY] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const { isSignedIn, user, signOut } = useCustomer();

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (location.pathname === "/") return null;
  const solid = scrollY > 80;

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        backgroundColor: solid || menuOpen ? "rgba(16,42,28,0.9)" : "transparent",
        backdropFilter: solid || menuOpen ? "blur(12px)" : "none",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div>
            <div className="font-display font-bold text-lg leading-tight" style={{ color: "#F5EDD9" }}>
              City Bike Tours
            </div>
            <div className="text-xs tracking-widest uppercase" style={{ color: "#D4A017" }}>
              Gaborone Heritage
            </div>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-6">
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

        <div className="hidden md:flex items-center gap-3">
          {isSignedIn ? (
            <>
              <Link to="/dashboard" className="text-xs uppercase tracking-wide font-medium" style={{ color: location.pathname === "/dashboard" ? "#D4A017" : "#F5EDD9" }}>My bookings</Link>
              <button type="button" onClick={signOut} className="text-xs uppercase tracking-wide font-medium" style={{ color: "#F5EDD9" }} title="Sign out">
                Sign out
              </button>
            </>
          ) : null}
        </div>

        <Link
          to="/heritage-trail#trail-book"
          className="hidden md:inline-flex items-center justify-center px-5 py-2 text-xs font-bold uppercase tracking-widest rounded-sm"
          style={{ backgroundColor: "#C1440E", color: "#F5EDD9" }}
        >
          Book a ride
        </Link>

        <button
          type="button"
          className="md:hidden text-xs uppercase tracking-widest font-semibold"
          style={{ color: "#F5EDD9" }}
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
        >
          Menu
        </button>
      </div>

      {menuOpen && (
        <div id="mobile-nav" className="md:hidden px-6 pb-5 pt-1 flex flex-col gap-3" style={{ backgroundColor: "rgba(16,42,28,0.96)" }}>
          {NAV_LINKS.map(({ label, to }) => (
            <Link key={to} to={to} onClick={() => setMenuOpen(false)} className="text-sm uppercase tracking-widest" style={{ color: location.pathname === to ? "#D4A017" : "#F5EDD9" }}>
              {label}
            </Link>
          ))}
          <Link to="/heritage-trail#trail-book" onClick={() => setMenuOpen(false)} className="mt-1 text-sm font-semibold uppercase tracking-widest" style={{ color: "#D4A017" }}>Book a ride</Link>
          {isSignedIn ? (
            <>
              <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="text-sm uppercase tracking-widest" style={{ color: "#F5EDD9" }}>My bookings</Link>
              <button type="button" onClick={() => { setMenuOpen(false); signOut(); }} className="text-left text-sm uppercase tracking-widest" style={{ color: "#F5EDD9" }}>Sign out</button>
            </>
          ) : null}
        </div>
      )}
    </nav>
  );
}
