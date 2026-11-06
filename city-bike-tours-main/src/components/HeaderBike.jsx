import RiderIcon from "./RiderIcon";

const LANES = 4;
// One duration per lane (seconds). Two bicycles share a lane, half a trip apart, and lanes are spaced
// further apart than a bicycle is tall, so no two bicycles ever overlap.
const DURATIONS = [52, 64, 48, 58];
const BIKES_PER_LANE = 2;

// Rows of cyclists drifting across the screen. Each row is spread over the height of
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
              style={{ animationDelay: `${-(bikeIndex * (DURATIONS[layerIndex] / BIKES_PER_LANE) + layerIndex * 5.5)}s` }}
            >
              <RiderIcon responsive color="#38BDF8" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
