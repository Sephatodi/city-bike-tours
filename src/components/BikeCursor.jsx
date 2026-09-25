import { useEffect, useRef, useState } from "react";
import BikeSVG from "./BikeSVG";

export default function BikeCursor() {
  const cursorRef = useRef(null);
  const animationFrame = useRef(null);
  const target = useRef({ x: -100, y: -100 });
  const current = useRef({ x: -100, y: -100 });
  const lastMouseX = useRef(null);
  const lastTouchX = useRef({});
  const [touches, setTouches] = useState([]);

  useEffect(() => {
    document.body.classList.add("bike-cursor-enabled");

    function updateCursor(event) {
      const direction = event.clientX >= (lastMouseX.current ?? event.clientX) ? 1 : -1;
      lastMouseX.current = event.clientX;
      document.documentElement.style.setProperty("--cursor-direction", direction);
      target.current = { x: event.clientX, y: event.clientY };
    }

    function readTouches(event) {
      const nextTouches = Array.from(event.touches).map((touch) => {
        const previousX = lastTouchX.current[touch.identifier];
        const direction = previousX === undefined || touch.clientX >= previousX ? 1 : -1;
        lastTouchX.current[touch.identifier] = touch.clientX;
        return { id: touch.identifier, x: touch.clientX, y: touch.clientY, direction };
      });
      setTouches(nextTouches);
    }

    function clearTouches(event) {
      const activeIds = new Set(Array.from(event.touches).map((touch) => touch.identifier));
      Object.keys(lastTouchX.current).forEach((id) => {
        if (!activeIds.has(Number(id))) delete lastTouchX.current[id];
      });
      readTouches(event);
    }

    function animateCursor() {
      current.current.x += (target.current.x - current.current.x) * 0.2;
      current.current.y += (target.current.y - current.current.y) * 0.2;
      if (cursorRef.current) {
        const direction = getComputedStyle(document.documentElement).getPropertyValue("--cursor-direction") || 1;
        cursorRef.current.style.transform = `translate3d(${current.current.x}px, ${current.current.y}px, 0) translate(-50%, -50%) scaleX(${direction})`;
      }
      animationFrame.current = requestAnimationFrame(animateCursor);
    }

    window.addEventListener("mousemove", updateCursor, { passive: true });
    window.addEventListener("touchstart", readTouches, { passive: true });
    window.addEventListener("touchmove", readTouches, { passive: true });
    window.addEventListener("touchend", clearTouches, { passive: true });
    window.addEventListener("touchcancel", clearTouches, { passive: true });
    animationFrame.current = requestAnimationFrame(animateCursor);

    return () => {
      document.body.classList.remove("bike-cursor-enabled");
      window.removeEventListener("mousemove", updateCursor);
      window.removeEventListener("touchstart", readTouches);
      window.removeEventListener("touchmove", readTouches);
      window.removeEventListener("touchend", clearTouches);
      window.removeEventListener("touchcancel", clearTouches);
      cancelAnimationFrame(animationFrame.current);
    };
  }, []);

  return (
    <>
      <div ref={cursorRef} className="custom-cursor-follower" aria-hidden="true">
          <BikeSVG size={48} color="#F97316" />
      </div>
      {touches.map((touch) => (
        <div
          key={touch.id}
          className="touch-bicycle-pointer"
          style={{ left: touch.x, top: touch.y, "--touch-direction": touch.direction }}
          aria-hidden="true"
        >
          <BikeSVG size={56} color="#F97316" />
        </div>
      ))}
    </>
  );
}
