import { useEffect, useRef, useState } from "react";
import RiderIcon from "./RiderIcon";

const TRACK_LIFE = 2600; // ms before a tyre mark has faded away
const TRACK_GAP = 6;     // distance between the two tyres
const MIN_STEP = 3;      // px the bicycle must move before a new mark is laid

// The cursor is a cyclist that faces the way it is travelling and leaves two tyre tracks behind it.
export default function BikeCursor() {
  const cursorRef = useRef(null);
  const canvasRef = useRef(null);
  const [touches, setTouches] = useState([]);

  useEffect(() => {
    document.body.classList.add("bike-cursor-enabled");
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const target = { x: -200, y: -200 };
    const current = { x: -200, y: -200 };
    const motion = { vx: 0, vy: 0, facing: 1 };
    let marks = [];
    let frame = 0;
    let started = false;

    function resize() {
      const ratio = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * ratio;
      canvas.height = window.innerHeight * ratio;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    }

    function onMove(event) {
      moveTarget(event.clientX, event.clientY);
    }

    function moveTarget(x, y) {
      target.x = x;
      target.y = y;
      if (!started) { current.x = target.x; current.y = target.y; started = true; }
    }

    function readTouches(event) {
      const firstTouch = event.touches[0];
      if (firstTouch) moveTarget(firstTouch.clientX, firstTouch.clientY);
      setTouches(Array.from(event.touches).map((touch) => ({ id: touch.identifier, x: touch.clientX, y: touch.clientY })));
    }

    function drawTracks(now) {
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);
      marks = marks.filter((mark) => now - mark.t < TRACK_LIFE);
      for (let i = 1; i < marks.length; i += 1) {
        const a = marks[i - 1];
        const b = marks[i];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const length = Math.hypot(dx, dy) || 1;
        const nx = -dy / length;
        const ny = dx / length;
        const alpha = Math.max(0, 1 - (now - b.t) / TRACK_LIFE) * 0.8;
        context.strokeStyle = `rgba(245, 237, 217, ${alpha})`;
        context.lineWidth = 2.8;
        context.lineCap = "round";
        for (const side of [-1, 1]) {
          const offset = side * TRACK_GAP;
          context.beginPath();
          context.moveTo(a.x + nx * offset, a.y + ny * offset);
          context.lineTo(b.x + nx * offset, b.y + ny * offset);
          context.stroke();
          // tread: a short bar across the tyre at every other mark
          if (i % 2 === 0) {
            context.lineWidth = 1.2;
            context.beginPath();
            context.moveTo(b.x + nx * (offset - 2.6), b.y + ny * (offset - 2.6));
            context.lineTo(b.x + nx * (offset + 2.6), b.y + ny * (offset + 2.6));
            context.stroke();
            context.lineWidth = 2.8;
          }
        }
      }
    }

    function tick(now) {
      const previousX = current.x;
      const previousY = current.y;
      if (reducedMotion) {
        current.x = target.x;
        current.y = target.y;
      } else {
        current.x += (target.x - current.x) * 0.22;
        current.y += (target.y - current.y) * 0.22;
      }
      const dx = current.x - previousX;
      const dy = current.y - previousY;
      const speed = Math.hypot(dx, dy);

      // Smooth the heading so the bicycle turns gracefully instead of jittering.
      motion.vx += (dx - motion.vx) * 0.25;
      motion.vy += (dy - motion.vy) * 0.25;
      if (Math.abs(motion.vx) > 0.35) motion.facing = motion.vx >= 0 ? 1 : -1;
      const tilt = reducedMotion ? 0 : Math.max(-28, Math.min(28, (Math.atan2(motion.vy, Math.max(Math.abs(motion.vx), 0.001)) * 180) / Math.PI));

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${current.x}px, ${current.y}px, 0) translate(-50%, -55%) scaleX(${motion.facing}) rotate(${speed > 0.4 ? tilt : 0}deg)`;
      }

      if (!reducedMotion && speed > 0.4) {
        const last = marks[marks.length - 1];
        const baseY = current.y + 22; // where the tyres touch the ground
        if (!last || Math.hypot(current.x - last.x, baseY - last.y) >= MIN_STEP) marks.push({ x: current.x, y: baseY, t: now });
      }
      drawTracks(now);
      frame = requestAnimationFrame(tick);
    }

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("touchstart", readTouches, { passive: true });
    window.addEventListener("touchmove", readTouches, { passive: true });
    window.addEventListener("touchend", readTouches, { passive: true });
    window.addEventListener("touchcancel", readTouches, { passive: true });
    frame = requestAnimationFrame(tick);

    return () => {
      document.body.classList.remove("bike-cursor-enabled");
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchstart", readTouches);
      window.removeEventListener("touchmove", readTouches);
      window.removeEventListener("touchend", readTouches);
      window.removeEventListener("touchcancel", readTouches);
      cancelAnimationFrame(frame);
    };
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
