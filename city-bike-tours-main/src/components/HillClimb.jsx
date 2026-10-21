"use client";

import { useEffect, useMemo, useRef, useState } from "react";

// ─── HILL CLIMB MATH ──────────────────────────────────────────────────────────
// Single source of truth for the curve — the drawn slope and the bike's
// position both come from these two functions, so the bike can't drift off
// the line the way it can if they're calculated separately.

const BIKE_SIZE = 260;              // visible size of the bike icon
const BIKE_ICON_HEIGHT = BIKE_SIZE * 0.6; // matches the bike SVG's own aspect ratio (viewBox 120x72)
const BIKE_OPACITY = 0.92;          // "should be visible" — solid, not faint

const HILL_HEIGHT = 360;                     // px, fixed so px math is exact (no viewBox stretch)
const HILL_MARGIN_X = 8;                     // % — keeps the bike fully on-screen at both ends
const HILL_TOP_PAD = BIKE_ICON_HEIGHT + 20;  // headroom = icon's own height + buffer, so it can't clip at the top
const HILL_BOTTOM_PAD = 30;                  // px of ground below the bike's lowest point

// yTop = distance from the TOP of the hill strip (SVG-style, grows downward).
// f=0 (left) -> near the bottom. f=1 (right) -> near the top. Monotonic climb.
function hillYTop(f) {
  const usable = HILL_HEIGHT - HILL_TOP_PAD - HILL_BOTTOM_PAD;
  return HILL_TOP_PAD + usable * (1 - Math.pow(f, 1.3));
}

function hillXPct(f) {
  return HILL_MARGIN_X + f * (100 - HILL_MARGIN_X * 2);
}

function BikeSVG({ size = 48, color = "#D4A017" }) {
  return (
    <svg width={size} height={size * 0.6} viewBox="0 0 120 72" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="22" cy="52" r="18" stroke={color} strokeWidth="3" fill="none" />
      <line x1="22" y1="34" x2="22" y2="52" stroke={color} strokeWidth="2" />
      <line x1="4" y1="52" x2="22" y2="52" stroke={color} strokeWidth="2" />
      <circle cx="98" cy="52" r="18" stroke={color} strokeWidth="3" fill="none" />
      <line x1="98" y1="34" x2="98" y2="52" stroke={color} strokeWidth="2" />
      <line x1="80" y1="52" x2="98" y2="52" stroke={color} strokeWidth="2" />
      <line x1="22" y1="52" x2="55" y2="20" stroke={color} strokeWidth="3" />
      <line x1="55" y1="20" x2="78" y2="52" stroke={color} strokeWidth="3" />
      <line x1="55" y1="20" x2="98" y2="34" stroke={color} strokeWidth="3" />
      <line x1="22" y1="52" x2="78" y2="52" stroke={color} strokeWidth="2.5" />
      <line x1="55" y1="20" x2="48" y2="10" stroke={color} strokeWidth="2.5" />
      <line x1="42" y1="8" x2="56" y2="8" stroke={color} strokeWidth="3" strokeLinecap="round" />
      <line x1="98" y1="34" x2="104" y2="24" stroke={color} strokeWidth="2.5" />
      <line x1="100" y1="22" x2="108" y2="22" stroke={color} strokeWidth="3" strokeLinecap="round" />
      <circle cx="60" cy="6" r="5" fill={color} />
      <path d="M60 11 Q58 20 55 20 Q65 20 70 28 Q75 20 70 16 Q65 10 60 11Z" fill={color} />
    </svg>
  );
}

export default function HillClimb() {
  const hillRef = useRef(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function onScroll() {
      const el = hillRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 the instant the hill's top edge enters the bottom of the viewport,
      // 1 the instant its bottom edge exits the top — the climb plays out
      // exactly while the slope is on screen.
      const total = vh + rect.height;
      const traveled = vh - rect.top;
      setProgress(Math.min(Math.max(traveled / total, 0), 1));
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const bikeLeftPct = hillXPct(progress);
  const bikeTopPx = hillYTop(progress);
  const bikeBottomPx = HILL_HEIGHT - bikeTopPx;
  const slopeSample = hillYTop(Math.min(progress + 0.02, 1)) - hillYTop(Math.max(progress - 0.02, 0));
  const tilt = Math.max(-32, Math.min(-8, slopeSample * 8));

  const hillPath = useMemo(() => {
    const steps = 32;
    const pts = [];
    for (let i = 0; i <= steps; i++) {
      const f = i / steps;
      pts.push([hillXPct(f), hillYTop(f)]);
    }
    const line = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x} ${y}`).join(" ");
    const [firstX] = pts[0];
    const [lastX] = pts[pts.length - 1];
    const fill = `${line} L ${lastX} ${HILL_HEIGHT} L ${firstX} ${HILL_HEIGHT} Z`;
    return { line, fill };
  }, []);

  return (
    <div ref={hillRef} className="relative w-full overflow-hidden" style={{ height: `${HILL_HEIGHT}px` }}>
      <svg
        className="absolute inset-0"
        width="100%"
        height={HILL_HEIGHT}
        viewBox={`0 0 100 ${HILL_HEIGHT}`}
        preserveAspectRatio="none"
      >
        {/* Solid dark-brown hill silhouette */}
        <path d={hillPath.fill} fill="#1A1008" />
        {/* Lighter dashed trail along the top edge the bike rides on */}
        <path
          d={hillPath.line}
          fill="none"
          stroke="rgba(212,160,23,0.55)"
          strokeWidth="1.4"
          strokeDasharray="3 3"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div
        className="absolute"
        style={{
          left: `${bikeLeftPct}%`,
          bottom: `${bikeBottomPx}px`,
          transform: `translateX(-50%) rotate(${tilt}deg)`,
          transition: "left 0.05s linear, bottom 0.05s linear, transform 0.1s linear",
          opacity: BIKE_OPACITY,
          zIndex: 2,
        }}
      >
        <BikeSVG size={BIKE_SIZE} color="#D4A017" />
      </div>
    </div>
  );
}