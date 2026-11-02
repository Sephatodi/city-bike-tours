import { useEffect, useMemo, useRef, useState } from "react";
import RoundaboutCarousel from "./RoundaboutCarousel";
import Lightbox from "./Lightbox";
import Icon from "./Icon";
import SiteVideo from "./SiteVideo";
import { Link } from "react-router";
import { SITES } from "../data";

function FolderContent({ site, index, total, onPrev, onNext, onClose }) {
  const [openPhoto, setOpenPhoto] = useState(null);
  const items = useMemo(() => site.imgs.filter(Boolean).map((src, i) => ({
    key: `${site.id}-${i}`, src, title: `${site.name} — photo ${i + 1}`, story: site.short,
  })), [site]);
  const videos = site.videos || [];

  return (
    <div className="folder-content">
      <div className="folder-toolbar">
        <span className="folder-stop">Stop {index + 1} of {total}</span>
        <div className="folder-toolbar-buttons">
          <button type="button" onClick={onPrev} aria-label="Previous site">‹ Previous</button>
          <button type="button" onClick={onNext} aria-label="Next site">Next ›</button>
          <Link to={`/gallery/${site.id}`} className="folder-all">View all photos →</Link>
          <button type="button" onClick={onClose} aria-label="Close folder">Close ×</button>
        </div>
      </div>
      <RoundaboutCarousel items={items} label={`${site.name} photos`} onOpen={setOpenPhoto} />
      <div className="folder-info">
        <div>
          <p className="folder-short">{site.short}</p>
          <p className="folder-history">{site.history}</p>
        </div>
        <ul className="folder-facts">
          <li><Icon name="mapPin" size={16} /> {site.street}, Gaborone</li>
          <li>📷 {items.length} photo{items.length === 1 ? "" : "s"}</li>
          {videos.length > 0 && <li>🎬 {videos.length} video{videos.length === 1 ? "" : "s"}</li>}
        </ul>
      </div>
      {videos.length > 0 && (
        <div className="folder-videos" aria-label={`${site.name} videos`}>
          {videos.map((video) => <figure key={video.src}><SiteVideo video={video} /><figcaption>{video.title}</figcaption></figure>)}
        </div>
      )}
      {openPhoto !== null && <Lightbox items={items} index={openPhoto} onChange={setOpenPhoto} onClose={() => setOpenPhoto(null)} onDownload={() => {}} />}
    </div>
  );
}

// Six folders side by side. Click one and it opens, with the others folding to the side.
export default function SiteFolders({ sites = SITES }) {
  const [active, setActive] = useState(null);
  const refs = useRef([]);
  const total = sites.length;

  useEffect(() => {
    if (active === null) return undefined;
    const onKey = (event) => { if (event.key === "Escape") setActive(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  function open(index) {
    setActive(index);
    // On phones the folders stack, so bring the opened one into view.
    requestAnimationFrame(() => refs.current[index]?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  return (
    <div className={`folders ${active !== null ? "has-open" : ""}`}>
      {sites.map((site, index) => {
        const isOpen = active === index;
        return (
          <section
            key={site.id}
            ref={(node) => { refs.current[index] = node; }}
            className={`folder ${isOpen ? "is-open" : ""}`}
            style={{ "--folder-accent": site.color === "#1A3A2A" ? "#D4A017" : site.color }}
            aria-label={site.name}
          >
            <button type="button" className="folder-face" aria-expanded={isOpen} aria-controls={`folder-${site.id}`} onClick={() => (isOpen ? setActive(null) : open(index))}>
              <img src={site.imgs[0]} alt="" loading="lazy" />
              <span className="folder-shade" aria-hidden="true" />
              <span className="folder-number">{String(index + 1).padStart(2, "0")}</span>
              <span className="folder-label">
                <Icon name={site.icon} size={20} />
                <strong>{site.name}</strong>
                <small>{isOpen ? "Open" : "Open folder"}</small>
              </span>
            </button>
            {isOpen && (
              <div id={`folder-${site.id}`} className="folder-body" role="region" aria-label={`${site.name} details`}>
                <FolderContent
                  site={site}
                  index={index}
                  total={total}
                  onPrev={() => open((index - 1 + total) % total)}
                  onNext={() => open((index + 1) % total)}
                  onClose={() => setActive(null)}
                />
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
