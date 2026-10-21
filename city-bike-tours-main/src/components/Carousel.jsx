import { useState, useEffect, useRef, useCallback } from "react";
import Icon from "./Icon";

export default function Carousel({ imgs, accent, title = "Location", subtitle = "" }) {
  const [idx, setIdx] = useState(0);
  const intervalRef = useRef(null);
  const slides = Array.isArray(imgs) ? imgs.filter(Boolean) : [];

  const next = useCallback(() => {
    if (slides.length > 1) setIdx((i) => (i + 1) % slides.length);
  }, [slides.length]);
  const prev = () => setIdx((i) => (i - 1 + slides.length) % slides.length);

  useEffect(() => {
    if (slides.length < 2) return undefined;
    intervalRef.current = setInterval(next, 3500);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [next, slides.length]);

  if (slides.length === 0) {
    return (
      <div
        role="img"
        aria-label={`${title} location`}
        className="relative flex flex-col items-center justify-center gap-3 overflow-hidden rounded-lg text-center"
        style={{
          aspectRatio: "4/3",
          color: "#F5EDD9",
          background: `linear-gradient(145deg, ${accent}88, #0D0805 78%)`,
        }}
      >
        <Icon name="mapPin" size={38} style={{ color: accent }} />
        <strong className="font-display text-lg">{title}</strong>
        {subtitle && <span className="text-xs opacity-70">{subtitle}</span>}
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-lg" style={{ aspectRatio: "4/3" }}>
      <div
        className="carousel-track flex h-full"
        style={{ transform: `translateX(-${idx * 100}%)`, width: `${slides.length * 100}%` }}
      >
        {slides.map((src, i) => (
          <div key={i} className="h-full flex-shrink-0" style={{ width: `${100 / slides.length}%` }}>
            <img src={src} alt="" className="w-full h-full object-cover" style={{ backgroundColor: "#1A3A2A" }} />
          </div>
        ))}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      {slides.length > 1 && <>
        <button
          onClick={prev}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm hover:opacity-90 transition-opacity"
          style={{ backgroundColor: accent }}
          aria-label="Previous image"
        >‹</button>
        <button
          onClick={next}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm hover:opacity-90 transition-opacity"
          style={{ backgroundColor: accent }}
          aria-label="Next image"
        >›</button>
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className="w-1.5 h-1.5 rounded-full transition-all"
              style={{ backgroundColor: i === idx ? accent : "rgba(255,255,255,0.4)" }}
              aria-label={`Show image ${i + 1}`}
            />
          ))}
        </div>
      </>}
    </div>
  );
}
