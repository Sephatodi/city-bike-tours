import BikeSVG from "./BikeSVG";

export default function HeaderBike() {
  return (
    <div className="header-bike" aria-hidden="true">
      {Array.from({ length: 5 }, (_, layerIndex) => (
        <div
          key={layerIndex}
          className={`header-bike-layer ${layerIndex % 2 === 0 ? "header-bike-layer-forward" : "header-bike-layer-backward"}`}
          style={{ "--layer-index": layerIndex }}
        >
          {Array.from({ length: 3 }, (_, bikeIndex) => (
            <div
              key={bikeIndex}
              className="header-bike-rider"
              style={{ animationDelay: `${-(bikeIndex * 7 + layerIndex * 2)}s` }}
            >
              <BikeSVG size={220} color="#D4A017" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
