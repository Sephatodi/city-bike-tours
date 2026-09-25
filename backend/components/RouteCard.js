import { SATURDAY_PRICING } from "@/lib/data";

export default function RouteCard({ route }) {
  return (
    <div className="route-card">
      <div className="route-num">
        ROUTE {route.num} · {route.tierLabel}
      </div>
      <h3>{route.name}</h3>
      <div className="route-stats">
        <div>
          <span>Distance</span>
          {route.distance}
        </div>
        <div>
          <span>Difficulty</span>
          {route.difficulty}
        </div>
        <div>
          <span>Sat. special</span>P{SATURDAY_PRICING[route.tier]}
        </div>
      </div>
      <p className="focus">{route.focus}</p>
      <p className="best">
        <strong>Best for:</strong> {route.bestFor}
      </p>
    </div>
  );
}
