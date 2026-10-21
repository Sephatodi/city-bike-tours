import BikeSVG from "./BikeSVG";

const LANES = 5;
// One duration per lane (seconds). Two bicycles share a lane, half a trip apart, and lanes are spaced
// further apart than a bicycle is tall, so no two bicycles ever overlap.
const DURATIONS = [28, 34, 26, 38, 31];
const BIKES_PER_LANE = 2;

// Rows of complete bicycles drifting across the screen. Each row is spread over the height of
// its container and nothing is clipped vertically, so every bicycle is drawn in full.
export default function HeaderBike() {
  return (
    <div className="header-bike" aria-hidden="true">
      {Array.from({ length: LANES }, (_, layerIndex) => (
        <div
          key={layerIndex}
          className={`header-bike-layer ${layerIndex % 2 === 0 ? "header-bike-layer-forward" : "header-bike-layer-backward"}`}
          style={{ "--layer-index": layerIndex, "--lanes": LANES, "--dur": `${DURATIONS[layerIndex]}s` }}
        >
          {Array.from({ length: BIKES_PER_LANE }, (_, bikeIndex) => (
            <div
              key={bikeIndex}
              className="header-bike-rider"
              style={{ animationDelay: `${-(bikeIndex * (DURATIONS[layerIndex] / BIKES_PER_LANE) + layerIndex * 3.1)}s` }}
            >
              <BikeSVG responsive color="#D4A017" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
