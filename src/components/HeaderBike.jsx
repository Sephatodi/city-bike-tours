import { useEffect, useState } from "react";
import BikeSVG from "./BikeSVG";

export default function HeaderBike() {
  const [direction, setDirection] = useState("right");

  useEffect(() => {
    let previousScrollY = window.scrollY;

    function updateDirection() {
      const nextScrollY = window.scrollY;
      if (nextScrollY === previousScrollY) return;

      setDirection(nextScrollY > previousScrollY ? "right" : "left");
      previousScrollY = nextScrollY;
    }

    window.addEventListener("scroll", updateDirection, { passive: true });
    return () => window.removeEventListener("scroll", updateDirection);
  }, []);

  return (
    <div className="header-bike" aria-hidden="true">
      <div className={`header-bike-track header-bike-track-${direction}`}>
        <BikeSVG size={180} color="#D4A017" />
      </div>
    </div>
  );
}
