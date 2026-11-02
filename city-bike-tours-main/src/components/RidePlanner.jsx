import { useState } from "react";
import { Link } from "react-router";
import { useLiveData } from "../hooks/LiveDataContext";
import { useNow } from "../hooks/useNow";
import { nextRide } from "../lib/time";
import SiteClock from "./SiteClock";

// "When would you like to ride?" and "Pricing" in one place: pick a ride, see its live price, choose how many
// riders, and book, without scrolling.
const CARDS = [
  {
    id: "complete", featured: true, max: 10,
    eyebrow: "THE HERITAGE CITY RIDE", pill: "GUIDED · MAX 10", title: ["Heritage City", "Ride"],
    time: <strong>9:00 AM or 2:00 PM</strong>,
    blurb: "Ride with a local guide through Gaborone's heritage sites and hear the stories behind each landmark.",
    footer: "Wednesday–Friday · Groups up to 10", cta: "Book this ride",
  },
  {
    id: "loop", featured: false, max: 20,
    eyebrow: "COME AS YOU ARE", pill: "CASUAL · ALL WELCOME", title: ["Casual", "Saturday"],
    time: <><strong>Relaxed &amp; flexible</strong> <span>No rigid schedule</span></>,
    blurb: "A fun, easygoing ride for friends, families, and anyone who wants to join. Cycling lessons are included for kids and adults.",
    footer: "Lessons included · Main Mall", cta: "Join the ride",
  },
];

function RideCard({ card, route, riders, onRiders }) {
  const total = route ? route.price * riders : null;
  return (
    <article className={`schedule-option-card ride-card ${card.featured ? "schedule-option-featured" : ""}`}>
      <div className="schedule-option-topline"><span>{card.eyebrow}</span><span className={`schedule-status-pill ${card.featured ? "" : "schedule-status-request"}`}>{card.pill}</span></div>
      <h3>{card.title[0]}<br />{card.title[1]}</h3>
      <div className="schedule-option-time">◷ {card.time}</div>
      <p>{card.blurb}</p>

      {route && (
        <div className="ride-price-row">
          <div>
            <div className="ride-price">P{route.price}</div>
            <div className="ride-price-note">per rider · payable on the day</div>
          </div>
          <div className="ride-facts">{route.duration}<br />{route.distance} · {route.sites} sites</div>
        </div>
      )}

      <div className="ride-order">
        <div className="ride-stepper" role="group" aria-label={`Riders for ${card.title.join(" ")}`}>
          <button type="button" aria-label="One fewer rider" onClick={() => onRiders(Math.max(1, riders - 1))} disabled={riders <= 1}>−</button>
          <span aria-live="polite"><strong>{riders}</strong> rider{riders === 1 ? "" : "s"}</span>
          <button type="button" aria-label="One more rider" onClick={() => onRiders(Math.min(card.max, riders + 1))} disabled={riders >= card.max}>+</button>
        </div>
        {total !== null && <div className="ride-total">Total <strong>P{total}</strong></div>}
      </div>

      <Link to="/book#book-form" className="ride-book">{card.cta}{total !== null ? ` — P${total}` : ""} <span aria-hidden="true">↗</span></Link>
      <div className="schedule-option-bottom"><span>{card.footer}</span><span>No deposit · pay on the day</span></div>
    </article>
  );
}

export default function RidePlanner() {
  const { routes } = useLiveData();
  const [riders, setRiders] = useState({ complete: 1, loop: 1 });
  const next = nextRide(useNow(60000));

  return (
    <section id="pricing" className="schedule-options reveal">
      <div className="schedule-section-heading">
        <div><p className="schedule-section-kicker">CHOOSE YOUR PACE · TRANSPARENT PRICING</p><h2>When would you like to ride?</h2></div>
        <p>Pick a ride, see what it costs, and book. No hidden fees, payment on the day, no deposit.</p>
      </div>
      <div className="ride-live">
        {next && <span className="ride-next"><strong>Next ride:</strong> {next.when}, {next.text}</span>}
        <SiteClock />
      </div>
      <div id="price-calculator" className="schedule-card-grid price-calculator-anchor">
        {CARDS.map((card) => (
          <RideCard
            key={card.id}
            card={card}
            route={routes.find((route) => route.id === card.id)}
            riders={riders[card.id]}
            onRiders={(count) => setRiders((current) => ({ ...current, [card.id]: count }))}
          />
        ))}
      </div>
    </section>
  );
}
