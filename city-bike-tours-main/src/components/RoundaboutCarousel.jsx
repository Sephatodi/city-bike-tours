import { useCallback, useEffect, useRef, useState } from "react";
import Icon from "./Icon";

// A looping "roundabout" carousel: the photo in front is large and its neighbours sweep round behind it.
// Arrows, dots, swipe, keyboard and slow auto-rotation (paused on hover) all work; it loops forever.
export default function RoundaboutCarousel({ items, label, onOpen, onDownload, renderCaption, paused = false }) {
  const [active, setActive] = useState(0);
  const [hover, setHover] = useState(false);
  const swipe = useRef(null);
  const count = items.length;
  const current = count ? ((active % count) + count) % count : 0;

  const go = useCallback((step) => setActive((value) => value + step), []);

  useEffect(() => { if (active >= count && count) setActive(0); }, [count, active]);

  useEffect(() => {
    if (count < 2 || hover || paused) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    const timer = setInterval(() => go(1), 5200);
    return () => clearInterval(timer);
  }, [count, hover, paused, go]);

  if (!count) return null;
  const half = Math.floor(count / 2);

  // Signed distance round the circle from the front photo: ..., -2, -1, 0, 1, 2, ...
  const offsetOf = (index) => {
    let offset = (index - current) % count;
    if (offset > half) offset -= count;
    if (offset < -half) offset += count;
    return offset;
  };

  const onKeyDown = (event) => {
    if (event.key === "ArrowRight") { event.preventDefault(); go(1); }
    if (event.key === "ArrowLeft") { event.preventDefault(); go(-1); }
  };

  return (
    <div
      className="roundabout"
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
    >
      <div
        className="roundabout-stage"
        onPointerDown={(event) => { swipe.current = event.clientX; }}
        onPointerUp={(event) => {
          if (swipe.current === null) return;
          const distance = event.clientX - swipe.current;
          swipe.current = null;
          if (Math.abs(distance) > 50) go(distance < 0 ? 1 : -1);
        }}
      >
        {items.map((item, index) => {
          const offset = offsetOf(index);
          const distance = Math.abs(offset);
          const visible = distance <= 2;
          return (
            <figure
              key={item.key}
              className={`roundabout-slide ${offset === 0 ? "is-front" : ""}`}
              aria-hidden={offset !== 0}
              style={{
                opacity: visible ? 1 - distance * 0.28 : 0,
                zIndex: 10 - distance,
                pointerEvents: visible ? "auto" : "none",
                transform: `translateX(${offset * 52}%) translateZ(${-distance * 140}px) rotateY(${offset * -26}deg) scale(${1 - distance * 0.1})`,
              }}
            >
              <button
                type="button"
                className="roundabout-photo"
                tabIndex={offset === 0 ? 0 : -1}
                aria-label={offset === 0 ? `Open ${item.title}` : `Show ${item.title}`}
                onClick={() => (offset === 0 ? onOpen?.(index) : setActive((value) => value + offset))}
              >
                <img src={item.src} alt={item.title} loading="lazy" draggable="false" />
              </button>
              {offset === 0 && item.downloadable && (
                <button type="button" className="photo-download" onClick={() => onDownload?.(item)} aria-label={`Download ${item.title}`} title="Download">
                  <Icon name="download" size={16} />
                </button>
              )}
            </figure>
          );
        })}
      </div>

      {count > 1 && (
        <>
          <button type="button" className="roundabout-arrow prev" aria-label="Previous photo" onClick={() => go(-1)}>‹</button>
          <button type="button" className="roundabout-arrow next" aria-label="Next photo" onClick={() => go(1)}>›</button>
          <div className="roundabout-dots">
            {count <= 14 ? items.map((item, index) => (
              <button key={item.key} type="button" aria-label={`Photo ${index + 1}`} aria-current={index === current} className={index === current ? "on" : ""} onClick={() => setActive((value) => value + offsetOf(index))} />
            )) : <span>{current + 1} / {count}</span>}
          </div>
        </>
      )}
      {renderCaption && <div className="roundabout-caption" aria-live="polite">{renderCaption(items[current])}</div>}
    </div>
  );
}
