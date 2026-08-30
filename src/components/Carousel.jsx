import { useState, useEffect, useRef, useCallback } from "react";

export default function Carousel({ imgs, accent }) {
  const [idx, setIdx] = useState(0);
  const intervalRef = useRef(null);

  const next = useCallback(() => setIdx((i) => (i + 1) % imgs.length), [imgs.length]);
  const prev = () => setIdx((i) => (i - 1 + imgs.length) % imgs.length);

  useEffect(() => {
    intervalRef.current = setInterval(next, 3500);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [next]);

  return (
    <div className="relative overflow-hidden rounded-lg" style={{ aspectRatio: "4/3" }}>
      <div
        className="carousel-track flex h-full"
        style={{ transform: `translateX(-${idx * 100}%)`, width: `${imgs.length * 100}%` }}
      >
        {imgs.map((src, i) => (
          <div key={i} className="h-full flex-shrink-0" style={{ width: `${100 / imgs.length}%` }}>
            <img src={src} alt="" className="w-full h-full object-cover" style={{ backgroundColor: "#1A3A2A" }} />
          </div>
        ))}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      <button
        onClick={prev}
        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm hover:opacity-90 transition-opacity"
        style={{ backgroundColor: accent }}
      >‹</button>
      <button
        onClick={next}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm hover:opacity-90 transition-opacity"
        style={{ backgroundColor: accent }}
      >›</button>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
        {imgs.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            className="w-1.5 h-1.5 rounded-full transition-all"
            style={{ backgroundColor: i === idx ? accent : "rgba(255,255,255,0.4)" }}
          />
        ))}
      </div>
    </div>
  );
}
