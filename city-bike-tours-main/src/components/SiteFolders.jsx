import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import { SITES } from "../data";

export default function SiteFolders({ content = [] }) {
  const [active, setActive] = useState(0);
  const startX = useRef(null);
  const folders = useMemo(() => SITES.map((site) => ({
    ...site,
    extra: content.filter((item) => item.mediaUrl && ((item.title + " " + (item.bodyText || "")).toLowerCase().includes(site.name.toLowerCase()))),
  })), [content]);
  const move = (step) => setActive((value) => (value + step + folders.length) % folders.length);

  useEffect(() => {
    const onKey = (event) => {
      if (!event.target.closest?.(".site-folders-carousel")) return;
      if (event.key === "ArrowRight") { event.preventDefault(); move(1); }
      if (event.key === "ArrowLeft") { event.preventDefault(); move(-1); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [folders.length]);

  return (
    <div className="site-folders-carousel" aria-label="Six heritage sites carousel"
      onPointerDown={(event) => { startX.current = event.clientX; }}
      onPointerUp={(event) => { if (startX.current === null) return; const delta = event.clientX - startX.current; startX.current = null; if (Math.abs(delta) > 45) move(delta < 0 ? 1 : -1); }}>
      <div className="site-folders-track">
        {folders.map((site, index) => {
          let offset = (index - active + folders.length) % folders.length;
          if (offset > folders.length / 2) offset -= folders.length;
          const visible = Math.abs(offset) <= 1;
          return (
            <Link key={site.id} className={`site-folder ${offset === 0 ? "is-active" : ""}`}
              to={`/gallery/${site.id}`} aria-hidden={!visible} tabIndex={visible ? 0 : -1}
              style={{ "--folder-offset": offset, opacity: visible ? (offset === 0 ? 1 : .58) : 0, pointerEvents: visible ? "auto" : "none" }}>
              <img className="site-folder-image" src={site.imgs[0]} alt="" loading="lazy" />
              <span className="site-folder-shade" />
              <span className="site-folder-number">STOP {String(index + 1).padStart(2, "0")}</span>
              <span className="site-folder-copy"><strong>{site.name}</strong><small>{site.street} · {site.imgs.length + site.extra.length} photos</small><em>Open heritage site ↗</em></span>
            </Link>
          );
        })}
      </div>
      <div className="site-folders-controls">
        <button type="button" onClick={() => move(-1)} aria-label="Previous heritage site">←</button>
        <div className="site-folders-dots">{folders.map((site, index) => <button key={site.id} type="button" className={index === active ? "active" : ""} aria-label={`Show ${site.name}`} aria-current={index === active ? "true" : undefined} onClick={() => setActive(index)} />)}</div>
        <span>{String(active + 1).padStart(2, "0")} / {String(folders.length).padStart(2, "0")}</span>
        <button type="button" onClick={() => move(1)} aria-label="Next heritage site">→</button>
      </div>
    </div>
  );
}
