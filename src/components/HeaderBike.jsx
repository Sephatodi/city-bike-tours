import BikeSVG from "./BikeSVG";

export default function HeaderBike() {
  return (
    <div className="header-bike" aria-hidden="true">
      <div className="header-bike-track header-bike-track-forward">
        <BikeSVG size={220} color="#D4A017" />
      </div>
      <div className="header-bike-track header-bike-track-backward">
        <BikeSVG size={220} color="#D4A017" />
      </div>
    </div>
  );
}
