import { useEffect } from "react";
import BikeSVG from "./BikeSVG";

export default function StationaryBicycle() {
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      .stationary-bike-wheel { animation: wheel-spin 0.5s linear infinite; transform-origin: center; }
      @keyframes wheel-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <div className="stationary-bicycle" style={{
      position: "fixed",
      top: "20px",
      right: "20px",
      zIndex: 60,
      width: "60px",
      height: "auto",
      pointerEvents: "none",
      opacity: 0.9,
      filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
    }}>
      <BikeSVG size={60} color="#D4A017" />
    </div>
  );
}
