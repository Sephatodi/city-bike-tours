import { useCallback, useState } from "react";
import { Link, useNavigate } from "react-router";
import RoundaboutCarousel from "./RoundaboutCarousel";
import RrIcon from "./RrIcon";
import Icon from "./Icon";
import { SITES } from "../data";

// The gallery's centrepiece: a roundabout of the six sites, details for the one in front, and six buttons.
// Every button (and the front photo) opens that site's own page with all of its pictures.
export default function SiteShowcase() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const onActiveChange = useCallback((index) => setCurrent(index), []);
  const site = SITES[current] || SITES[0];

  const items = SITES.map((item) => ({ key: item.id, src: item.imgs[0], title: item.name, story: item.street }));

  return (
    <section id="heritage" className="showcase" aria-labelledby="showcase-heading">
      <header className="showcase-hero">
        <div>
          <p className="rr-pill">An immersive heritage journey</p>
          <h1 id="showcase-heading">Six sites.<br /><em>One living story.</em></h1>
        </div>
        <div className="showcase-intro">
          <p>Journey through the places that shaped a nation. Move through the collection to reveal each landmark and the story it holds.</p>
          <span className="rr-label">Scroll the roundabout</span>
        </div>
      </header>

      <RoundaboutCarousel
        items={items}
        label="The six heritage sites"
        onActiveChange={onActiveChange}
        onOpen={(index) => navigate(`/gallery/${SITES[index].id}`)}
        renderOverlay={(item, index) => (
          <>
            <span className="showcase-num">{String(index + 1).padStart(2, "0")}</span>
            <span className="showcase-name">{item.title}</span>
            <span className="showcase-street">{item.story} · Gaborone</span>
          </>
        )}
      />

      <div className="showcase-info" aria-live="polite">
        <span className="showcase-site">Site {String(current + 1).padStart(2, "0")}</span>
        <Icon name={site.icon} size={30} />
        <div>
          <h2>{site.name}</h2>
          <p>{site.short}</p>
        </div>
        <dl>
          <div><dt>Location</dt><dd>{site.street}, Gaborone</dd></div>
          <div><dt>Photos</dt><dd>{site.imgs.length}</dd></div>
          {site.established && <div><dt>Established</dt><dd>{site.established}</dd></div>}
          {site.legacy && <div><dt>Legacy</dt><dd>{site.legacy}</dd></div>}
        </dl>
      </div>

      <div className="showcase-route">
        <p className="rr-label">The complete route</p>
        <h2>Sites along the heritage journey</h2>
        <p className="rr-muted">Choose a stop to see all of its pictures.</p>
        <div className="showcase-buttons">
          {SITES.map((item, index) => (
            <Link key={item.id} to={`/gallery/${item.id}`} className={`showcase-button ${index === current ? "is-current" : ""}`} aria-current={index === current ? "true" : undefined}>
              <span className="showcase-button-num">{String(index + 1).padStart(2, "0")}</span>
              <Icon name={item.icon} size={26} />
              <span className="showcase-button-text"><strong>{item.name}</strong><small>{item.imgs.length} photo{item.imgs.length === 1 ? "" : "s"} · {item.street}</small></span>
              <RrIcon name="up" size={16} className="showcase-button-arrow" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
