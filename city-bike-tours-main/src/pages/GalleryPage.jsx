import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import { SITES } from "../data";
import { useLiveData } from "../hooks/LiveDataContext";
import Footer from "../components/Footer";
import { backendUrl } from "../api/backend";
import { useCustomer } from "../auth/CustomerAuth";
import "../rr-theme.css";
import "../gallery-reviews.css";

const siteLabel = (site, index) => `STOP ${String(index + 1).padStart(2, "0")} · ${site.street.toUpperCase()}`;

export default function GalleryPage() {
  const { hash } = useLocation();
  const { content = [] } = useLiveData();
  const { api, isSignedIn } = useCustomer();
  const [active, setActive] = useState(0);
  const [riderPhotos, setRiderPhotos] = useState([]);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(true);
  const carouselRef = useRef(null);
  const [filter, setFilter] = useState("all");
  const [limit, setLimit] = useState(24);
  const [lightbox, setLightbox] = useState(-1);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadStory, setUploadStory] = useState("");
  const [uploadSite, setUploadSite] = useState("");
  const [uploadBusy, setUploadBusy] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const previewTimer = useRef(null);
  const pointerStart = useRef(null);
  const site = SITES[active] || SITES[0];

  const publishedPictures = useMemo(() => content.filter((item) => item.isPublished !== false && item.mediaUrl && item.contentType === "picture"), [content]);
  useEffect(() => { const controller = new AbortController(); fetch(backendUrl("/api/community/photos"), { signal: controller.signal, cache: "no-store" }).then((response) => response.ok ? response.json() : null).then((data) => { if (!controller.signal.aborted && Array.isArray(data?.photos)) setRiderPhotos(data.photos.filter((photo) => photo.status === "approved")); }).catch(() => {}); return () => controller.abort(); }, []);
  const photos = useMemo(() => [
    ...SITES.flatMap((item, siteIndex) => item.imgs.map((src, photoIndex) => ({
      key: `${item.id}-${photoIndex}`, src, title: item.name, siteId: item.id, siteIndex,
    }))),
    ...riderPhotos.map((photo) => ({ key: `rider-${photo.id}`, src: photo.imageUrl, title: photo.title, siteId: photo.siteId || "community", siteIndex: SITES.findIndex((s) => s.id === photo.siteId), authorName: photo.authorName })),
    ...publishedPictures.map((item) => ({
      key: `published-${item.id}`, src: item.mediaUrl, title: item.title,
      siteId: item.siteId || "community", siteIndex: SITES.findIndex((s) => s.id === item.siteId),
    })),
  ], [publishedPictures, riderPhotos]);
  const filteredPhotos = useMemo(() => filter === "all" ? photos : photos.filter((photo) => photo.siteId === filter), [photos, filter]);
  const stories = riderPhotos.slice().sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

  const submitPhoto = async (event) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    if (!uploadFile || !uploadTitle.trim()) return;
    setUploadBusy(true); setUploadMessage("");
    const form = new FormData();
    form.set("file", uploadFile); form.set("title", uploadTitle.trim());
    form.set("story", uploadStory.trim()); form.set("siteId", uploadSite);
    try {
      const result = await api("/api/community/photos", { method: "POST", form });
      setUploadFile(null); setUploadTitle(""); setUploadStory(""); setUploadSite("");
      setUploadMessage(result.message || "Your photo was submitted for review.");
      formElement.reset();
    } catch (error) { setUploadMessage(error.message || "Your photo could not be uploaded."); }
    finally { setUploadBusy(false); }
  };

  const move = useCallback((step) => setActive((current) => (current + step + SITES.length) % SITES.length), []);
  useEffect(() => {
    if (paused || !inView || window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.hidden) return undefined;
    const timer = window.setInterval(() => move(1), 5600);
    return () => window.clearInterval(timer);
  }, [paused, inView, move]);
  useEffect(() => {
    const node = carouselRef.current;
    if (!node || !("IntersectionObserver" in window)) return undefined;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.15 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!hash) return undefined;
    const timer = window.setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth" }), 200);
    return () => window.clearTimeout(timer);
  }, [hash]);
  useEffect(() => {
    const onKey = (event) => {
      if (lightbox >= 0) {
        if (event.key === "Escape") setLightbox(-1);
        if (event.key === "ArrowRight") setLightbox((v) => (v + 1) % filteredPhotos.length);
        if (event.key === "ArrowLeft") setLightbox((v) => (v - 1 + filteredPhotos.length) % filteredPhotos.length);
        return;
      }
      if (event.key === "ArrowRight") move(1);
      if (event.key === "ArrowLeft") move(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [move, lightbox, filteredPhotos.length]);
  useEffect(() => () => window.clearTimeout(previewTimer.current), []);

  const choosePreview = (index) => {
    window.clearTimeout(previewTimer.current);
    previewTimer.current = window.setTimeout(() => setActive(index), 180);
  };
  const openPhoto = (index) => setLightbox(index);

  return (
    <>
      <main className="rr rr-page rr-gallery-page">
        <div className="rr-container">
          <header className="rr-hero rr-gallery-hero">
            <p className="rr-kicker">City Bike Tours · Gaborone heritage</p>
            <h1>See the city.<br /><em>Feel its stories.</em></h1>
            <p className="rr-muted">Explore Gaborone's heritage landmarks through a moving carousel, a collection of site cards and photographs from the journey.</p>
          </header>

          <section ref={carouselRef} className="rr-roundabout-wrap" aria-label="Heritage sites carousel"
            onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false); }}>
            <div className="rr-roundabout" onPointerDown={(event) => { pointerStart.current = event.clientX; }}
              onPointerUp={(event) => { if (pointerStart.current === null) return; const delta = event.clientX - pointerStart.current; pointerStart.current = null; if (Math.abs(delta) > 45) move(delta < 0 ? 1 : -1); }}>
              {SITES.map((item, index) => {
                let offset = (index - active + SITES.length) % SITES.length;
                if (offset > SITES.length / 2) offset -= SITES.length;
                const visible = Math.abs(offset) <= 1;
                return <article key={item.id} className={`rr-roundabout-slide ${offset === 0 ? "is-active" : ""}`}
                  aria-hidden={!visible} style={{ "--slide-offset": offset, opacity: visible ? (offset === 0 ? 1 : .58) : 0, pointerEvents: visible ? "auto" : "none", transform: `translateX(${offset * 72}%) translateZ(${-Math.abs(offset) * 150}px) rotateY(${offset * -24}deg) scale(${1 - Math.abs(offset) * .12})` }}>
                  <Link to={`/gallery/${item.id}`} tabIndex={offset === 0 ? 0 : -1} className="rr-roundabout-photo" aria-label={`Open photo collection for ${item.name}`}>
                    <img src={item.imgs[0]} alt={item.name} fetchPriority={offset === 0 ? "high" : "auto"} />
                    <span className="rr-roundabout-overlay"><small>STOP {String(index + 1).padStart(2, "0")} · {item.street}</small><strong>{item.name}</strong></span>
                  </Link>
                </article>;
              })}
              <button type="button" className="rr-roundabout-arrow prev" onClick={() => move(-1)} aria-label="Previous site">←</button>
              <button type="button" className="rr-roundabout-arrow next" onClick={() => move(1)} aria-label="Next site">→</button>
            </div>
            <div className="rr-roundabout-footer">
              <div className="rr-roundabout-dots" aria-label="Choose a heritage stop">
                {SITES.map((item, index) => <button key={item.id} type="button" className={index === active ? "active" : ""} aria-label={`Show ${item.name}`} aria-current={index === active ? "true" : undefined} onClick={() => setActive(index)} />)}
              </div>
              <span className="rr-roundabout-count">{String(active + 1).padStart(2, "0")} / {String(SITES.length).padStart(2, "0")}</span>
            </div>
            <div className="rr-roundabout-caption" aria-live="polite"><span>{site.street}</span><strong>{site.name}</strong><p>{site.short}</p></div>
          </section>

          <section className="rr-gallery-collection" aria-labelledby="gallery-collection-title">
            <div className="rr-gallery-section-heading"><div><p className="rr-kicker">The heritage collection</p><h2 id="gallery-collection-title">Sites along the journey</h2></div><span className="rr-chip">06 locations</span></div>
            <div className="rr-gallery-grid">{SITES.map((item, index) => <Link key={item.id} to={`/gallery/${item.id}`} className={`rr-plate rr-gallery-card ${index === active ? "is-featured" : ""}`} aria-current={index === active ? "true" : undefined}
              onMouseEnter={() => choosePreview(index)} onFocus={() => choosePreview(index)} onMouseLeave={() => window.clearTimeout(previewTimer.current)} onBlur={() => window.clearTimeout(previewTimer.current)}>
              <div className="rr-gallery-card-image"><img src={item.imgs[0]} alt={item.name} loading="lazy" decoding="async" /></div>
              <div className="rr-gallery-card-copy"><p className="rr-kicker">{siteLabel(item, index)}</p><h3>{item.name}</h3><p className="rr-muted">{item.short}</p><span className="rr-gallery-card-link">Explore site ↗</span></div>
            </Link>)}</div>
          </section>

          <section className="rr-photo-wall" aria-labelledby="photo-wall-heading">
            <div className="rr-gallery-section-heading"><div><p className="rr-kicker">The complete collection</p><h2 id="photo-wall-heading">All photos</h2><p className="rr-muted">Browse photographs from the heritage sites and published website gallery.</p></div><span className="rr-chip">{filteredPhotos.length} photos</span></div>
            <div className="rr-photo-filters"><button type="button" className={filter === "all" ? "active" : ""} onClick={() => { setFilter("all"); setLimit(24); }}>All · {photos.length}</button>{SITES.map((item) => <button type="button" key={item.id} className={filter === item.id ? "active" : ""} onClick={() => { setFilter(item.id); setLimit(24); }}>{item.name} · {photos.filter((photo) => photo.siteId === item.id).length}</button>)}</div>
            <div className="rr-photo-grid">{filteredPhotos.slice(0, limit).map((photo, index) => <button type="button" key={photo.key} onClick={() => openPhoto(index)} aria-label={`View ${photo.title} photograph`}><img src={photo.src} alt={photo.title} loading="lazy" decoding="async" /><span>{photo.title}</span></button>)}</div>
            {limit < filteredPhotos.length && <button type="button" className="rr-btn-ghost rr-load-more" onClick={() => setLimit((value) => Math.min(value + 24, filteredPhotos.length))}>Load more photos</button>}
          </section>

          {stories.length > 0 && <section className="rr-rider-stories" aria-labelledby="rider-stories-heading"><div className="rr-gallery-section-heading"><div><p className="rr-kicker">Shared by the community</p><h2 id="rider-stories-heading">Rider stories</h2></div><Link to="/connect" className="rr-btn-ghost">Share your ride ↗</Link></div>
            <div className="rr-story-strip">{stories.slice(0, 3).map((story) => <article className="rr-plate" key={story.id}><img src={story.imageUrl} alt={story.title} loading="lazy" /><div><p className="rr-kicker">{story.authorName}</p><h3>{story.title}</h3>{story.story && <p className="rr-muted">{story.story}</p>}</div></article>)}</div>
            <p className="rr-muted rr-story-note">Only rider photographs approved by the City Bike Tours team are shown here.</p>
          </section>}
          <section className="rr-photo-upload rr-plate-elevated" aria-labelledby="share-photo-heading">
            <div><p className="rr-kicker">Your turn to share</p><h2 id="share-photo-heading">Add a photograph from your ride</h2><p className="rr-muted">Uploads are reviewed by the team before they appear in the public gallery.</p></div>
            {isSignedIn ? <form className="rr-upload-form" onSubmit={submitPhoto}>
              <label>Photo title<input required maxLength={120} value={uploadTitle} onChange={(event) => setUploadTitle(event.target.value)} /></label>
              <label>Photo<input required type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(event) => setUploadFile(event.target.files?.[0] || null)} /></label>
              <label>Heritage stop<select value={uploadSite} onChange={(event) => setUploadSite(event.target.value)}><option value="">Community ride</option>{SITES.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
              <label>Your story <span>(optional)</span><textarea rows={3} maxLength={1500} value={uploadStory} onChange={(event) => setUploadStory(event.target.value)} /></label>
              {uploadMessage && <p role="status" className="rr-upload-message">{uploadMessage}</p>}
              <button type="submit" className="rr-btn-primary" disabled={uploadBusy || !uploadFile || !uploadTitle.trim()}>{uploadBusy ? "Uploading…" : "Submit photo for review"}</button>
            </form> : <p className="rr-muted">Please <Link to="/login?next=/gallery">sign in</Link> to share a ride photograph.</p>}
          </section>
        </div>
      </main>
      {lightbox >= 0 && filteredPhotos[lightbox] && <div className="rr-lightbox" role="dialog" aria-modal="true" aria-label="Photo viewer" onClick={() => setLightbox(-1)}>
        <button type="button" className="rr-lightbox-close" onClick={() => setLightbox(-1)} aria-label="Close photo viewer">×</button>
        <button type="button" className="rr-lightbox-prev" onClick={(event) => { event.stopPropagation(); setLightbox((v) => (v - 1 + filteredPhotos.length) % filteredPhotos.length); }} aria-label="Previous photo">←</button>
        <figure onClick={(event) => event.stopPropagation()}><img src={filteredPhotos[lightbox].src} alt={filteredPhotos[lightbox].title} /><figcaption>{filteredPhotos[lightbox].title} · {lightbox + 1} / {filteredPhotos.length}</figcaption></figure>
        <button type="button" className="rr-lightbox-next" onClick={(event) => { event.stopPropagation(); setLightbox((v) => (v + 1) % filteredPhotos.length); }} aria-label="Next photo">→</button>
      </div>}
      <Footer />
    </>
  );
}
