import Link from "next/link";
import RouteCard from "@/components/RouteCard";
import PricingTable from "@/components/PricingTable";
import { ROUTES, MEETUP, WEEKLY_ADVENTURE } from "@/lib/data";

export default function HomePage() {
  return (
    <>
      <header className="hero">
        <div className="wrap">
          <div className="hero-eyebrow">Guided city cycling — Gaborone, Botswana</div>
          <h1>
            Ride the city while it&rsquo;s <em>still cool</em> — dawn or dusk.
          </h1>
          <p className="lede">
            Meet at the <strong>{MEETUP.name}</strong>, {MEETUP.note}. Every{" "}
            <strong>{WEEKLY_ADVENTURE.day}</strong> at {WEEKLY_ADVENTURE.times.join(" & ")} is our
            standing Weekly Adventure — or book any weekday, a monthly Saturday special, or a
            public holiday ride below.
          </p>
          <div className="time-badges">
            <div className="time-badge">
              <span className="clock mono">05:00</span>
              <span className="label">
                Morning window
                <br />
                60–90 min
              </span>
            </div>
            <div className="time-badge">
              <span className="clock mono">17:00</span>
              <span className="label">
                Evening window
                <br />
                60–90 min
              </span>
            </div>
          </div>
          <div className="hero-cta">
            <Link href="/book" className="btn btn-primary">
              Book a ride
            </Link>
            <Link href="/routes" className="btn btn-ghost">
              See the 3 routes
            </Link>
          </div>
        </div>
      </header>

      <section className="block">
        <div className="wrap">
          <div className="section-head">
            <div>
              <div className="section-eyebrow">Inner-city loop</div>
              <h2>Three routes, five landmarks.</h2>
            </div>
            <p>
              Every route stays on the main city arteries, taking in the Botswana National
              Archives and Records, the Post Office Gallery, the Government Enclave, the National
              Museum and the Three Chiefs Monument along the way.
            </p>
          </div>
          <div className="routes-grid">
            {ROUTES.map((route) => (
              <RouteCard key={route.id} route={route} />
            ))}
          </div>
        </div>
      </section>

      <section className="block">
        <div className="wrap">
          <div className="section-head">
            <div>
              <div className="section-eyebrow">Booking &amp; pricing</div>
              <h2>Four ways to ride.</h2>
            </div>
            <p>
              Weekday and public-holiday rides are our standard guided tours. The 1st and last
              Saturday of every month, tours are priced by distance, and a parent-accompanied
              kids&rsquo; rate applies. Cycling lessons are available any day.
            </p>
          </div>
          <PricingTable />
          <p style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 12 }}>
            Saturday-special and lesson prices shown above. Weekday and holiday tour rates are
            confirmed when you book.
          </p>
          <div className="hero-cta">
            <Link href="/book" className="btn btn-primary">
              Book a ride or lesson
            </Link>
            <Link href="/holiday-rides" className="btn btn-ghost">
              View holiday rides
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
