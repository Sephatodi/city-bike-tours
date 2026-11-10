import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router";
import RiderIcon from "./RiderIcon";

// The cursor is a cyclist with a single faint track line behind it.
export default function BikeCursor() {
  const cursorRef = useRef(null);
  const canvasRef = useRef(null);
  const [touches, setTouches] = useState([]);
  const [visible, setVisible] = useState(false);
  const location = useLocation();

  useEffect(() => { setVisible(false); }, [location.pathname, location.search, location.hash]);

  useEffect(() => {
    function showOnClick(event) {
      const el = event.target.closest("button,a,[role='button'],input[type='submit']");
      if (el) setVisible(true);
    }
    document.addEventListener("click", showOnClick, true);
    return () => document.removeEventListener("click", showOnClick, true);
  }, []);

  useEffect(() => {
    if (!visible) return;
    document.body.classList.add("bike-cursor-enabled");
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const target = { x: -200, y: -200 };
    const current = { x: -200, y: -200 };
    const motion = { vx: 0, vy: 0, facing: 1 };
    let previous = { x: -200, y: -200 };
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
      if (!started) { current.x = target.x; current.y = target.y; previous.x = target.x; previous.y = target.y; started = true; }
    }

    function readTouches(event) {
      const firstTouch = event.touches[0];
      if (firstTouch) moveTarget(firstTouch.clientX, firstTouch.clientY);
      setTouches(Array.from(event.touches).map((touch) => ({ id: touch.identifier, x: touch.clientX, y: touch.clientY })));
    }

    function drawSingleTrack(now) {
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);
      // Draw one faint line from previous position to current position
      const dx = current.x - previous.x;
      const dy = current.y - previous.y;
      const length = Math.hypot(dx, dy);
      if (length > 2) {
        const alpha = Math.min(0.35, length / 60);
        context.strokeStyle = `rgba(26, 58, 42, ${alpha})`;
        context.lineWidth = 2;
        context.lineCap = "round";
        context.beginPath();
        context.moveTo(previous.x, previous.y);
        context.lineTo(current.x, current.y);
        context.stroke();
      }
      previous.x = current.x;
      previous.y = current.y;
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

      motion.vx += (dx - motion.vx) * 0.25;
      motion.vy += (dy - motion.vy) * 0.25;
      if (Math.abs(motion.vx) > 0.35) motion.facing = motion.vx >= 0 ? 1 : -1;
      const tilt = reducedMotion ? 0 : Math.max(-28, Math.min(28, (Math.atan2(motion.vy, Math.max(Math.abs(motion.vx), 0.001)) * 180) / Math.PI));

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${current.x}px, ${current.y}px, 0) translate(-50%, -55%) scaleX(${motion.facing}) rotate(${speed > 0.4 ? tilt : 0}deg)`;
      }

      drawSingleTrack(now);
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
      setTouches([]);
    };
  }, [visible]);

  if (!visible) return null;

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
