import { NavLink, useLocation } from "react-router";
import RrIcon from "./RrIcon";

const ITEMS = [
  { to: "/heritage-trail", label: "Trail", icon: "route" },
  { to: "/gallery", label: "Gallery", icon: "photos" },
  { to: "/connect", label: "Reviews", icon: "chat" },
  { to: "/schedule", label: "Book", icon: "book" },
];

// Docked navigation for phones. The desktop menu stays in the header.
export default function MobileBottomNav() {
  const { pathname } = useLocation();
  if (pathname.startsWith("/admin")) return null;
  return (
    <nav className="rr-bottom-nav" aria-label="Quick navigation">
      {ITEMS.map((item) => (
        <NavLink key={item.to} to={item.to} className={({ isActive }) => `rr-bottom-link ${isActive ? "is-active" : ""}`} aria-label={item.label}>
          <RrIcon name={item.icon} size={22} />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
