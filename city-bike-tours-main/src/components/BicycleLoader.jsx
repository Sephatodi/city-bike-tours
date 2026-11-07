import { useCallback, useRef, useState } from "react";
import BikeSVG from "./BikeSVG";

export default function BicycleLoader({ isActive, onComplete }) {
  const [show, setShow] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const timerRef = useRef(null);

  const trigger = useCallback(() => {
    setShow(true);
    setLoaded(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setLoaded(true);
      timerRef.current = setTimeout(() => {
        setShow(false);
        setLoaded(false);
        onComplete?.();
      }, 800);
    }, 1200);
  }, [onComplete]);

  if (!show) return null;

  return (
    <div
      className="bicycle-loader-overlay"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(13, 8, 5, 0.85)",
        backdropFilter: "blur(4px)",
        opacity: loaded ? 1 : 0,
        transition: "opacity 0.3s ease",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "120px",
          height: "120px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${loaded ? 1 : 0.3})`,
          transition: "transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        }}
      >
        <BikeSVG size={100} color="#D4A017" />
        {loaded && (
          <div style={{
            position: "absolute",
            bottom: "-30px",
            color: "#F5EDD9",
            fontFamily: "Fraunces, serif",
            fontWeight: 700,
            fontSize: "1.1rem",
            animation: "bounce 1s infinite",
          }}>
            Loading…
          </div>
        )}
      </div>
      <style>{`
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
      `}</style>
    </div>
  );
}
