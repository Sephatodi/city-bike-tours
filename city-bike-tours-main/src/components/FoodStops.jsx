import { FOOD_STOPS } from "../data";

const mapsLink = (stop) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${stop.name}, ${stop.area}, Gaborone, Botswana`)}`;

// Food and drink spots around the heritage trail. Used at the bottom of the trail pages and on Reserve.
export default function FoodStops({ stops = FOOD_STOPS, kicker = "REFUEL ALONG THE WAY", title = "Food stops & spit-stop spots", intro = "Good places to eat and drink near the route. Ask your guide for the best stop on the day." }) {
  return (
    <section id="food-stops" className="food-stops reveal visible" aria-labelledby="food-heading">
      <div className="schedule-section-heading">
        <div><p className="schedule-section-kicker">{kicker}</p><h2 id="food-heading">{title}</h2></div>
        <p>{intro}</p>
      </div>
      <div className="food-grid">
        {stops.map((stop) => (
          <article key={stop.id} className="food-card glass">
            <span className="food-tag">{stop.stop}</span>
            <h3 className="font-display">{stop.name}</h3>
            <p className="food-area">{stop.area}</p>
            {stop.near && <p className="food-near">Near: {stop.near}</p>}
            <p>{stop.note}</p>
            <a className="food-directions" href={mapsLink(stop)} target="_blank" rel="noreferrer">Open in maps ↗</a>
          </article>
        ))}
      </div>
      <p className="food-note">Opening hours change, so check before you ride. Food and drinks are paid for by each rider.</p>
    </section>
  );
}
