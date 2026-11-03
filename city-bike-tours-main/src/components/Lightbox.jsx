import { useEffect } from "react";
import { createPortal } from "react-dom";
import Icon from "./Icon";

export default function Lightbox({ items, index, onChange, onClose, onDownload }) {
  const item = items[index];

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") onChange((index + 1) % items.length);
      if (event.key === "ArrowLeft") onChange((index - 1 + items.length) % items.length);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [index, items.length, onChange, onClose]);

  if (!item) return null;
  return createPortal(
    <div role="dialog" aria-modal="true" aria-label={item.title} className={`lightbox ${item.mediaType === "video" ? "lightbox-video" : ""}`} onClick={onClose}>
      <figure onClick={(event) => event.stopPropagation()}>
        {item.mediaType === "video" ? (
          <video src={item.src} controls autoPlay playsInline aria-label={item.title} />
        ) : (
          <img src={item.src} alt={item.title} />
        )}
        <figcaption>
          <div>
            <strong>{item.title}</strong>
            {item.credit && <span> · {item.credit}</span>}
            {item.story && <p>{item.story}</p>}
          </div>
          {item.downloadable && (
            <button type="button" className="gallery-download-btn" onClick={() => onDownload(item)}>
              <Icon name="download" size={16} /> Download
            </button>
          )}
        </figcaption>
      </figure>
      {items.length > 1 && (
        <>
          <button type="button" className="lightbox-nav prev" aria-label="Previous photo" onClick={(e) => { e.stopPropagation(); onChange((index - 1 + items.length) % items.length); }}>‹</button>
          <button type="button" className="lightbox-nav next" aria-label="Next photo" onClick={(e) => { e.stopPropagation(); onChange((index + 1) % items.length); }}>›</button>
        </>
      )}
      <button type="button" aria-label="Close photo" className="lightbox-close" onClick={onClose}>×</button>
    </div>,
    document.body,
  );
}

// Downloads need an account, and only photos the team has switched downloads on for.
