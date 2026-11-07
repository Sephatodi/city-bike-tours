import { NavLink, useLocation } from "react-router";
import RrIcon from "./RrIcon";

const ITEMS = [
  { to: "/heritage-trail", label: "Trail", icon: "route" },
  { to: "/gallery", label: "Gallery", icon: "photos" },
  { to: "/heritage-trail#trail-book", label: "Book", icon: "book" },
];

// Docked navigation for phones. The desktop menu stays in the header.
export default function MobileBottomNav() {
  const { pathname } = useLocation();
  if (pathname.startsWith("/admin") || pathname === "/") return null;
  return (
    <nav className="rr-bottom-nav" aria-label="Quick navigation">
      {ITEMS.map((item) => (
        <NavLink key={item.to} to={item.to} className={({ isActive }) => `rr-bottom-link ${isActive && !item.to.includes("#") ? "is-active" : ""}`} aria-label={item.label}>
          <RrIcon name={item.icon} size={22} />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
