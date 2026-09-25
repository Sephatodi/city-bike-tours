import Link from "next/link";
import RouteCard from "@/components/RouteCard";
import { ROUTES, MEETUP } from "@/lib/data";

export const metadata = { title: "Routes — Kgale Cycles" };

export default function RoutesPage() {
  return (
    <>
      <header className="page-header">
        <div className="wrap">
          <div className="section-eyebrow">Inner-city loop</div>
          <h1>Three routes, one safe corridor.</h1>
          <p className="lede" style={{ marginTop: 16 }}>
            Every route starts and ends at the <strong>{MEETUP.name}</strong>, {MEETUP.note}, and
            passes at least one of five landmarks: the Botswana National Archives and Records,
            the Post Office Gallery, the Government Enclave, the National Museum, and the Three
            Chiefs Monument.
          </p>
        </div>
      </header>

      <section className="block" style={{ borderTop: "none" }}>
        <div className="wrap">
          <div className="routes-grid">
            {ROUTES.map((route) => (
              <RouteCard key={route.id} route={route} />
            ))}
          </div>
          <p style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 20 }}>
            Prices shown are for the 1st &amp; last Saturday monthly special. Weekday and holiday
            tour rates are confirmed when you book.
          </p>
          <div className="hero-cta">
            <Link href="/book" className="btn btn-primary">
              Book one of these routes
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
