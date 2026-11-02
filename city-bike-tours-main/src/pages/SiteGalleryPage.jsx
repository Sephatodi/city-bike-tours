import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router";
import Footer from "../components/Footer";
import FoodStops from "../components/FoodStops";
import Icon from "../components/Icon";
import Lightbox from "../components/Lightbox";
import RrIcon from "../components/RrIcon";
import SiteVideo from "../components/SiteVideo";
import Stamp from "../components/Stamp";
import { useCustomer } from "../auth/CustomerAuth";
import { FOOD_STOPS, SITES } from "../data";
import { usePolling } from "../hooks/usePolling";

const PAGE_SIZE = 24;

// One page per heritage site with every picture we have of it. To show more pictures, add image paths to that
// site's `imgs` list in src/data.js (and `videos` for video).
export default function SiteGalleryPage() {
  const { siteId } = useParams();
  const index = SITES.findIndex((item) => item.id === siteId);
  const site = SITES[index];
  const { api } = useCustomer();
  const [shown, setShown] = useState(PAGE_SIZE);
  const [openAt, setOpenAt] = useState(null);
  const [riderPhotos, setRiderPhotos] = useState([]);

  useEffect(() => { setShown(PAGE_SIZE); setOpenAt(null); }, [siteId]);
  useEffect(() => {
    if (!site) return undefined;
    const previous = document.title;
    document.title = `${site.name} · Heritage photos · City Bike Tours`;
    return () => { document.title = previous; };
  }, [site]);

  const load = useCallback(async () => {
    try { setRiderPhotos(((await api("/api/community/photos")).photos || []).filter((photo) => photo.siteId === siteId && photo.status === "approved")); }
    catch { /* the section simply stays hidden */ }
  }, [api, siteId]);
  usePolling(load, 120000, Boolean(site));

  const items = useMemo(() => (site ? site.imgs.filter(Boolean).map((src, i) => ({ key: `${site.id}-${i}`, src, title: `${site.name} — photo ${i + 1}`, story: site.short, downloadable: false })) : []), [site]);
  const riderItems = useMemo(() => riderPhotos.map((photo) => ({ key: photo.id, src: photo.imageUrl, title: photo.title, story: photo.story, credit: photo.authorName, downloadable: false })), [riderPhotos]);
  const food = useMemo(() => {
    if (!site) return [];
    const name = site.name.toLowerCase();
    return FOOD_STOPS.filter((stop) => stop.near && (stop.near.toLowerCase().includes(name) || name.includes(stop.near.toLowerCase())));
  }, [site]);

  if (!site) return <Navigate to="/gallery" replace />;
  const prev = SITES[(index - 1 + SITES.length) % SITES.length];
  const next = SITES[(index + 1) % SITES.length];
  const videos = site.videos || [];

  return (
    <>
      <main className="rr rr-bg site-page">
        <div className="rr-wrap">
          <nav className="sp-nav" aria-label="Site navigation">
            <Link to="/gallery#heritage" className="rr-btn-ghost"><RrIcon name="left" size={16} /> All six sites</Link>
            <div>
              <Link to={`/gallery/${prev.id}`} className="rr-btn-ghost" aria-label={`Previous site: ${prev.name}`}><RrIcon name="left" size={16} /> Previous</Link>
              <Link to={`/gallery/${next.id}`} className="rr-btn-ghost" aria-label={`Next site: ${next.name}`}>Next <RrIcon name="right" size={16} /></Link>
            </div>
          </nav>

          <header className="sp-head rr-plate-elevated rr-pad">
            <span className="rr-pill">Site {String(index + 1).padStart(2, "0")} of {SITES.length}</span>
            <h1><Icon name={site.icon} size={34} /> {site.name}</h1>
            <p className="sp-street"><RrIcon name="pin" size={15} /> {site.street}, Gaborone</p>
            <p className="sp-short">{site.short}</p>
            <p className="sp-history">{site.history}</p>
          </header>

          <section aria-labelledby="photos-heading">
            <div className="sp-section-head">
              <h2 id="photos-heading">Photos</h2>
              <span className="rr-chip"><RrIcon name="camera" size={13} /> {items.length} photo{items.length === 1 ? "" : "s"}</span>
            </div>
            <div className="sp-grid">
              {items.slice(0, shown).map((item, i) => (
                <button key={item.key} type="button" className="sp-photo" onClick={() => setOpenAt(i)} aria-label={`Open ${item.title}`}>
                  <img src={item.src} alt={item.title} loading={i < 8 ? "eager" : "lazy"} decoding="async" />
                </button>
              ))}
            </div>
            {shown < items.length && (
              <div className="sp-more"><button type="button" className="rr-btn-ghost" onClick={() => setShown((count) => count + PAGE_SIZE)}>Load more photos ({items.length - shown} left)</button></div>
            )}
          </section>

          {videos.length > 0 && (
            <section aria-labelledby="videos-heading">
              <div className="sp-section-head"><h2 id="videos-heading">Videos</h2></div>
              <div className="sp-videos">{videos.map((video) => <figure key={video.src}><SiteVideo video={video} /><figcaption>{video.title}</figcaption></figure>)}</div>
            </section>
          )}

          {riderItems.length > 0 && (
            <section aria-labelledby="riders-heading">
              <div className="sp-section-head"><h2 id="riders-heading">Photos from riders</h2></div>
              <div className="sp-grid">
                {riderPhotos.map((photo) => (
                  <figure key={photo.id} className="sp-rider">
                    <img src={photo.imageUrl} alt={photo.title} loading="lazy" decoding="async" />
                    <figcaption><strong>{photo.title}</strong><span>{photo.authorName}</span><Stamp value={photo.createdAt} compact /></figcaption>
                  </figure>
                ))}
              </div>
            </section>
          )}

          {food.length > 0 && <FoodStops stops={food} kicker="NEAR THIS STOP" title="Eat and drink nearby" intro={`Cafés and eateries close to ${site.name}.`} />}

          <section className="sp-cta rr-plate-elevated rr-pad">
            <div><h2>Ride this route</h2><p className="rr-muted">See {site.name} and five more heritage sites on one guided ride from Main Mall.</p></div>
            <Link to="/schedule#pricing" className="rr-btn-primary">See rides and prices</Link>
          </section>
        </div>
      </main>
      {openAt !== null && <Lightbox items={items} index={openAt} onChange={setOpenAt} onClose={() => setOpenAt(null)} onDownload={() => {}} />}
      <Footer />
    </>
  );
}
