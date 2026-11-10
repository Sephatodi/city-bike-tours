import { useEffect } from "react";
import RiderIcon from "./RiderIcon";

export default function StationaryBicycle() {
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      .stationary-bike-wheel { animation: wheel-spin 0.5s linear infinite; transform-origin: center; }
      @keyframes wheel-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      .stationary-bike-glow { animation: glow-pulse 3s ease-in-out infinite; }
      @keyframes glow-pulse { 0%, 100% { filter: drop-shadow(0 0 4px rgba(212,160,23,0.1)); } 50% { filter: drop-shadow(0 0 10px rgba(212,160,23,0.2)); } }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <div className="stationary-bicycle" style={{
      position: "fixed",
      top: "8px",
      left: "10px",
      zIndex: 60,
      width: "60px",
      height: "auto",
      pointerEvents: "none",
      opacity: 0.9,
      filter: "drop-shadow(0 0 6px rgba(212,160,23,0.1))",
    }}>
      <RiderIcon size={64} className="stationary-bike-wheel stationary-bike-glow" />
    </div>
  );
}
