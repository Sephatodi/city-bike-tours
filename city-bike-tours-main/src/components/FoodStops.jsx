import { FOOD_STOPS } from "../data";

export default function FoodStops() {
  return (
    <section id="food-stops" className="food-stops reveal" aria-labelledby="food-heading">
      <div className="schedule-section-heading">
        <div><p className="schedule-section-kicker">REFUEL ALONG THE WAY</p><h2 id="food-heading">Food stops</h2></div>
        <p>Good places to eat and drink near the route. Ask your guide for the best stop on the day.</p>
      </div>
      <div className="food-grid">
        {FOOD_STOPS.map((stop) => (
          <article key={stop.id} className="food-card glass">
            <span className="food-tag">{stop.stop}</span>
            <h3 className="font-display">{stop.name}</h3>
            <p className="food-area">{stop.area}</p>
            <p>{stop.note}</p>
          </article>
        ))}
      </div>
      <p className="food-note">Opening hours change, so check before you ride. Food and drinks are paid for by each rider.</p>
    </section>
  );
}
