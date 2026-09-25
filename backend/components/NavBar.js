"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/routes", label: "Routes" },
  { href: "/book", label: "Book a ride" },
  { href: "/holiday-rides", label: "Holiday rides" },
  { href: "/safety", label: "Safety" },
];

export default function NavBar() {
  const pathname = usePathname();
  return (
    <>
      <div className="wrap">
        <nav className="topnav">
          <Link href="/" className="brand">
            Kgale<span className="dot">•</span>Cycles
          </Link>
          <div className="navlinks">
            {LINKS.map((link) => (
              <Link key={link.href} href={link.href} className={pathname === link.href ? "active" : ""}>
                {link.label}
              </Link>
            ))}
          </div>
          <Link href="/book" className="btn btn-primary btn-sm">
            Book now
          </Link>
        </nav>
      </div>
      <div className="sunbar" role="presentation" />
    </>
  );
}
