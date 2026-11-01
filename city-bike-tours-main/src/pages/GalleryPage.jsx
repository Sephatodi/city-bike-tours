import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router";
import { SITES } from "../data";
import { useLiveData } from "../hooks/LiveDataContext";
import Footer from "../components/Footer";
import { backendUrl } from "../api/backend";
import { useCustomer } from "../auth/CustomerAuth";
import SiteFolders from "../components/SiteFolders";
import "../rr-theme.css";
import "../gallery-reviews.css";

const siteLabel = (site, index) => `STOP ${String(index + 1).padStart(2, "0")} · ${site.street.toUpperCase()}`;

export default function GalleryPage() {
  const { hash } = useLocation();
  const { content = [] } = useLiveData();
  const { api, isSignedIn, token } = useCustomer();
  const [riderPhotos, setRiderPhotos] = useState([]);
  const [filter, setFilter] = useState("all");
  const [limit, setLimit] = useState(24);
  const [lightbox, setLightbox] = useState(-1);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadStory, setUploadStory] = useState("");
  const [uploadSite, setUploadSite] = useState("");
  const [uploadBusy, setUploadBusy] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");

  const publishedPictures = useMemo(() => content.filter((item) => item.isPublished !== false && item.mediaUrl && item.contentType === "picture"), [content]);
  useEffect(() => { const controller = new AbortController(); fetch(backendUrl("/api/community/photos"), { signal: controller.signal, cache: "no-store" }).then((response) => response.ok ? response.json() : null).then((data) => { if (!controller.signal.aborted && Array.isArray(data?.photos)) setRiderPhotos(data.photos.filter((photo) => photo.status === "approved")); }).catch(() => {}); return () => controller.abort(); }, []);
  const photos = useMemo(() => [
    ...SITES.flatMap((item, siteIndex) => item.imgs.map((src, photoIndex) => ({
      key: `${item.id}-${photoIndex}`, src, title: item.name, siteId: item.id, siteIndex,
    }))),
    ...riderPhotos.map((photo) => ({ key: `rider-${photo.id}`, src: photo.imageUrl, title: photo.title, siteId: photo.siteId || "community", siteIndex: SITES.findIndex((s) => s.id === photo.siteId), authorName: photo.authorName })),
    ...publishedPictures.map((item) => ({
      key: `published-${item.id}`, src: item.mediaUrl, title: item.title,
      siteId: item.siteId || "community", siteIndex: SITES.findIndex((s) => s.id === item.siteId), downloadable: item.downloadable === true, downloadKind: "content", downloadId: item.id,
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
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, filteredPhotos.length]);

  const openPhoto = (index) => setLightbox(index);
  const downloadPhoto = async (photo) => {
    if (!isSignedIn || !photo.downloadable || !photo.downloadKind || !photo.downloadId) return;
    try {
      const response = await fetch(backendUrl(`/api/download?kind=${photo.downloadKind}&id=${encodeURIComponent(photo.downloadId)}`), { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
      if (!response.ok) throw new Error("This photo is not currently available to download.");
      const blob = await response.blob(); const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a"); anchor.href = url; anchor.download = `${(photo.title || "city-bike-tours-photo").replace(/[^a-z0-9-_]+/gi, "-")}.jpg`;
      document.body.appendChild(anchor); anchor.click(); anchor.remove(); URL.revokeObjectURL(url);
    } catch (error) { setUploadMessage(error.message || "Could not download this photo."); }
  };

  return (
    <>
      <main className="rr rr-page rr-gallery-page">
        <div className="rr-container">
          <header className="rr-hero rr-gallery-hero">
            <p className="rr-kicker">City Bike Tours · Gaborone heritage</p>
            <h1>See the city.<br /><em>Feel its stories.</em></h1>
            <p className="rr-muted">Explore Gaborone's heritage landmarks through a moving carousel, a collection of site cards and photographs from the journey.</p>
          </header>

          <section className="rr-gallery-collection" aria-labelledby="gallery-collection-title">
            <div className="rr-gallery-section-heading"><div><p className="rr-kicker">The heritage collection</p><h2 id="gallery-collection-title">Sites along the journey</h2></div><span className="rr-chip">06 locations</span></div>
            <SiteFolders content={content} />
          </section>

          <section className="rr-photo-wall" aria-labelledby="photo-wall-heading">
            <div className="rr-gallery-section-heading"><div><p className="rr-kicker">The complete collection</p><h2 id="photo-wall-heading">All photos</h2><p className="rr-muted">Browse heritage-site photographs, published team images and approved photographs shared by riders.</p></div><span className="rr-chip">{filteredPhotos.length} photos</span></div>
            <div className="rr-photo-filters"><button type="button" className={filter === "all" ? "active" : ""} onClick={() => { setFilter("all"); setLimit(24); }}>All · {photos.length}</button>{SITES.map((item) => <button type="button" key={item.id} className={filter === item.id ? "active" : ""} onClick={() => { setFilter(item.id); setLimit(24); }}>{item.name} · {photos.filter((photo) => photo.siteId === item.id).length}</button>)}</div>
            <div className="rr-photo-grid">{filteredPhotos.slice(0, limit).map((photo, index) => <article className="rr-photo-tile" key={photo.key}>
              <button type="button" className="rr-photo-open" onClick={() => openPhoto(index)} aria-label={`View ${photo.title} photograph`}><img src={photo.src} alt={photo.title} loading="lazy" decoding="async" /><span>{photo.title}{photo.authorName ? ` · ${photo.authorName}` : ""}</span></button>
              {isSignedIn && photo.downloadable && photo.downloadKind && <button type="button" className="rr-photo-download" onClick={() => downloadPhoto(photo)}>Download photo ↓</button>}
            </article>)}</div>
            {limit < filteredPhotos.length && <button type="button" className="rr-btn-ghost rr-load-more" onClick={() => setLimit((value) => Math.min(value + 24, filteredPhotos.length))}>Load more photos</button>}
          </section>

          {stories.length > 0 && <section className="rr-rider-stories" aria-labelledby="rider-stories-heading">
            <div className="rr-gallery-section-heading"><div><p className="rr-kicker">Shared by the community</p><h2 id="rider-stories-heading">Rider photographs</h2><p className="rr-muted">Approved rider uploads appear here in a simple photo grid and in the complete collection above.</p></div></div>
            <div className="rr-rider-photo-grid">{stories.map((story) => <article className="rr-plate rr-rider-photo-card" key={story.id}><img src={story.imageUrl} alt={story.title} loading="lazy" /><div><p className="rr-kicker">{story.authorName}</p><h3>{story.title}</h3>{story.story && <p className="rr-muted">{story.story}</p>}</div></article>)}</div>
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
