import { useEffect, useRef, useState } from "react";
import RiderIcon from "./RiderIcon";

const TRACK_LIFE = 3200; // ms before a tyre mark has faded away
const TRACK_GAP = 7;     // distance between the two tyres
const MIN_STEP = 2;      // px the bicycle must move before a new mark is laid

// The cursor is a cyclist that faces the way it is travelling and leaves two tyre tracks behind it.
export default function BikeCursor() {
  const cursorRef = useRef(null);
  const canvasRef = useRef(null);
  const [touches, setTouches] = useState([]);

  useEffect(() => {
    document.body.classList.add("bike-cursor-enabled");
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const context = canvas.getContext("2d");
    if (!context) return undefined;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const current = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    let lastX = target.x;
    let lastY = target.y;
    let lastMarkX = target.x;
    let lastMarkY = target.y;
    let angle = 0;
    let raf = 0;
    const trail = [];

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const lerpAngle = (a, b, t) => {
      let d = (b - a + Math.PI) % (Math.PI * 2) - Math.PI;
      if (d < -Math.PI) d += Math.PI * 2;
      return a + d * t;
    };

    const onMove = (e) => {
      target.x = e.clientX;
      target.y = e.clientY;
    };

    const tick = () => {
      current.x += (target.x - current.x) * (reducedMotion ? 1 : 0.22);
      current.y += (target.y - current.y) * (reducedMotion ? 1 : 0.2);
      const dx = current.x - lastX;
      const dy = current.y - lastY;
      if (Math.hypot(dx, dy) > 0.3) angle = lerpAngle(angle, Math.atan2(dy, dx), 0.28);
      const deg = (angle * 180) / Math.PI;
      const flip = deg > 90 || deg < -90 ? " scaleX(-1)" : "";
      const tilt = Math.max(-14, Math.min(14, deg > 90 ? 180 - deg : deg < -90 ? -180 - deg : deg)) * 0.22;
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${current.x}px, ${current.y}px, 0) translate(-50%, -55%) rotate(${tilt}deg)${flip}`;
      }
      lastX = current.x; lastY = current.y;

      const stepX = current.x - lastMarkX;
      const stepY = current.y - lastMarkY;
      if (Math.hypot(stepX, stepY) >= MIN_STEP) {
        const stepAngle = Math.atan2(stepY, stepX);
        trail.push({ x: current.x, y: current.y, nx: -Math.sin(stepAngle), ny: Math.cos(stepAngle), t: performance.now() });
        lastMarkX = current.x; lastMarkY = current.y;
      }

      const now = performance.now();
      while (trail.length && now - trail[0].t > TRACK_LIFE) trail.shift();
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.lineCap = "round";
      context.lineJoin = "round";
      for (let tyre = -1; tyre <= 1; tyre += 2) {
        context.strokeStyle = "rgba(245, 237, 217, 0.45)";
        context.lineWidth = 2;
        context.beginPath();
        let started = false;
        for (let i = 1; i < trail.length; i++) {
          const a = trail[i - 1]; const b = trail[i];
          const ax = a.x + a.nx * TRACK_GAP * tyre; const ay = a.y + a.ny * TRACK_GAP * tyre;
          const bx = b.x + b.nx * TRACK_GAP * tyre; const by = b.y + b.ny * TRACK_GAP * tyre;
          if (!started) { context.moveTo(ax, ay); started = true; }
          context.lineTo(bx, by);
        }
        context.stroke();
      }
      // tread marks
      context.strokeStyle = "rgba(245, 237, 217, 0.25)";
      context.lineWidth = 1.1;
      for (let i = 2; i < trail.length; i += 3) {
        const b = trail[i];
        const age = (now - b.t) / TRACK_LIFE;
        if (age > 1) continue;
        context.globalAlpha = Math.max(0, (1 - age) * 0.55);
        for (let tyre = -1; tyre <= 1; tyre += 2) {
          const bx = b.x + b.nx * TRACK_GAP * tyre; const by = b.y + b.ny * TRACK_GAP * tyre;
          context.beginPath();
          context.moveTo(bx - b.ny * 3, by + b.nx * 3);
          context.lineTo(bx + b.ny * 3, by - b.nx * 3);
          context.stroke();
        }
      }
      context.globalAlpha = 1;

      raf = window.requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("resize", resize);
    raf = window.requestAnimationFrame(tick);

    return () => {
      document.body.classList.remove("bike-cursor-enabled");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", resize);
      window.cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    const addTouch = (x, y) => {
      const id = Date.now() + Math.random();
      setTouches((items) => [...items, { id, x, y }]);
      window.setTimeout(() => setTouches((items) => items.filter((item) => item.id !== id)), 1100);
    };
    const onTouch = (event) => {
      const point = event.touches?.[0];
      if (!point) return;
      addTouch(point.clientX, point.clientY);
    };
    window.addEventListener("touchstart", onTouch, { passive: true });
    return () => window.removeEventListener("touchstart", onTouch);
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className="tyre-tracks" aria-hidden="true" />
      <div ref={cursorRef} className="custom-cursor-follower" aria-hidden="true">
        <RiderIcon size={64} />
      </div>
      {touches.map((touch) => (
        <div key={touch.id} className="touch-bicycle-pointer" style={{ left: touch.x, top: touch.y }} aria-hidden="true">
          <RiderIcon size={64} />
        </div>
      ))}
    </>
  );
}
