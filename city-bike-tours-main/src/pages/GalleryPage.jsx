import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import RoundaboutCarousel from "../components/RoundaboutCarousel";
import Footer from "../components/Footer";
import Icon from "../components/Icon";
import Lightbox from "../components/Lightbox";
import Stamp from "../components/Stamp";
import { SITES } from "../data";
import { useCustomer } from "../auth/CustomerAuth";
import { useLiveData } from "../hooks/LiveDataContext";
import { usePolling } from "../hooks/usePolling";
import { downloadMedia } from "../utils/download";
import { prepareImage } from "../utils/images";

function useDownloads() {
  const [notice, setNotice] = useState("");
  const download = useCallback(async (item) => {
    setNotice("");
    try { await downloadMedia({ kind: item.kind, id: item.id, name: item.title }); }
    catch (error) { setNotice(error.message); }
  }, []);
  return { download, notice };
}

// ─── OFFICIAL PHOTOS (posted by the team) ────────────────────────────────────

function OfficialGallery() {
  const { content, errors } = useLiveData();
  const navigate = useNavigate();
  const { download, notice } = useDownloads();
  const [openAt, setOpenAt] = useState(null);
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const portfolioRef = useRef(null);

  // Pictures posted from the dashboard first, then the built-in photos of the six sites.
  const items = useMemo(() => [
    ...content.filter((item) => item.contentType === "picture" && item.mediaUrl).map((item) => ({
      key: `content-${item.id}`, kind: "content", id: item.id, siteId: item.siteId, src: item.mediaUrl, title: item.title, story: item.bodyText, downloadable: Boolean(item.downloadable),
    })),
    ...SITES.flatMap((site) => site.imgs.map((src, index) => ({
      key: `${site.id}-${index}`, siteId: site.id, src, title: `${site.name} — photo ${index + 1}`, story: site.short, downloadable: false,
    }))),
  ], [content]);
  const visibleItems = showAllPhotos ? items : items.slice(0, 10);

  function showAllGalleryPhotos() {
    setShowAllPhotos(true);
    window.requestAnimationFrame(() => portfolioRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  function openCarouselPhoto(index) {
    const item = items[index];
    if (item?.siteId && SITES.some((site) => site.id === item.siteId)) {
      navigate(`/gallery/${item.siteId}`);
      return;
    }
    setOpenAt(index);
  }

  return (
    <>
      <section id="official-carousel" className="gallery-section" aria-labelledby="carousel-heading">
        <div className="text-center mb-10">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#D4A017" }}>— Featured photos</p>
          <h2 id="carousel-heading" className="font-display font-bold" style={{ fontSize: "clamp(1.6rem, 3vw, 2.35rem)", color: "#F5EDD9" }}>Pictures from City Bike Tours</h2>
        </div>
        {errors.content && <p role="alert" className="mb-6 text-center" style={{ color: "#F5A58D" }}>The latest team photos couldn't be loaded. Please try again later.</p>}
        <RoundaboutCarousel
          items={items}
          label="Pictures from City Bike Tours"
          paused={openAt !== null}
          onOpen={openCarouselPhoto}
          openOnAnyPhoto
          onDownload={download}
          renderCaption={(item) => (<><strong>{item.title}</strong>{item.story && <span>{item.story}</span>}</>)}
        />
      </section>
      <section id="photos" className="gallery-section" aria-labelledby="official-heading">
        <div className="text-center mb-10">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#D4A017" }}>— Our collection</p>
          <h2 id="official-heading" className="font-display font-bold" style={{ fontSize: "clamp(2rem, 4vw, 3rem)", color: "#F5EDD9" }}>Gallery</h2>
          <p className="mt-3 max-w-xl mx-auto text-sm" style={{ color: "rgba(245,237,217,0.75)" }}>Explore photos of the sites and rides. Team-approved photos marked for download can be saved.</p>
        </div>
        <div ref={portfolioRef} id="all-website-photos" className="rr-gallery-portfolio" aria-label="Website photo portfolio">
          {visibleItems.map((item) => {
            const index = items.indexOf(item);
            return (
              <figure key={item.key} className="rr-gallery-portfolio-item">
                <button type="button" className="rr-gallery-portfolio-open" onClick={() => setOpenAt(index)} aria-label={`View ${item.title}`}>
                  <img src={item.src} alt={item.title} loading="lazy" />
                  <span>{item.title}</span>
                </button>
                {item.downloadable && <button type="button" className="rr-photo-download" onClick={() => download(item)} aria-label={`Download ${item.title}`}>Download</button>}
              </figure>
            );
          })}
        </div>
        {items.length > 10 && (
          <div className="rr-gallery-load-more">
            <p aria-live="polite">{showAllPhotos ? `Showing all ${items.length} website photos.` : `Showing 10 of ${items.length} website photos.`}</p>
            {!showAllPhotos && (
              <button type="button" onClick={showAllGalleryPhotos}>
                Load more images ({items.length - 10} remaining)
              </button>
            )}
          </div>
        )}
        <OfficialUpdates />
        {notice && <p role="alert" className="auth-error" style={{ maxWidth: "36rem", margin: "1rem auto 0" }}>{notice}</p>}
        {openAt !== null && <Lightbox items={items} index={openAt} onChange={setOpenAt} onClose={() => setOpenAt(null)} onDownload={download} />}
      </section>
    </>
  );
}

// ─── RIDER STORIES (uploaded by customers) ───────────────────────────────────

function UploadForm({ onUploaded, remainingUploads }) {
  const { api } = useCustomer();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [title, setTitle] = useState("");
  const [story, setStory] = useState("");
  const [siteId, setSiteId] = useState("");
  const [bookingCode, setBookingCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [thanks, setThanks] = useState("");
  const [codeVerified, setCodeVerified] = useState(false);

  useEffect(() => {
    if (!file) { setPreview(""); return undefined; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  if (!codeVerified) {
    return (
      <div className="connect-gate" style={{ textAlign: "center", padding: "2rem" }}>
        <p style={{ marginBottom: "1rem", color: "#F5EDD9" }}>Enter your booking code to upload photos</p>
        <input
          type="text"
          maxLength={6}
          value={bookingCode}
          onChange={(e) => setBookingCode(e.target.value.toUpperCase())}
          placeholder="1234AB"
          style={{
            width: "min(200px, 90%)",
            padding: "0.75rem 1rem",
            borderRadius: "4px",
            border: "1px solid rgba(245,237,217,0.2)",
            backgroundColor: "rgba(245,237,217,0.05)",
            color: "#F5EDD9",
            fontFamily: "monospace",
            fontSize: "1.1rem",
            textAlign: "center",
            textTransform: "uppercase",
            marginBottom: "1rem",
          }}
        />
        <button
          onClick={() => {
            if (/^\d{4}[A-Z]{2}$/.test(bookingCode)) {
              setCodeVerified(true);
            } else {
              setError("Please enter a valid booking code (4 digits + 2 letters).");
            }
          }}
          className="auth-primary"
          style={{ marginTop: "0.5rem" }}
        >
          Verify Code
        </button>
        {error && <p role="alert" className="auth-error" style={{ marginTop: "1rem" }}>{error}</p>}
      </div>
    );
  }

  async function submit(event) {
    event.preventDefault();
    if (!file) { setError("Choose a photo or video first."); return; }
    setBusy(true); setError(""); setThanks("");
    try {
      const isVideo = file.type.startsWith("video/");
      if (isVideo && file.size > 4 * 1024 * 1024) throw new Error("Videos must be 4MB or smaller.");
      const ready = isVideo ? file : await prepareImage(file);
      const form = new FormData();
      form.append("file", ready);
      form.append("title", title);
      form.append("story", story);
      form.append("bookingCode", bookingCode);
      if (siteId) form.append("siteId", siteId);
      const result = await api("/api/community/photos", { method: "POST", form });
      setThanks(result.message || "Thank you! Your media will appear once our team has looked at it.");
      setFile(null); setTitle(""); setStory(""); setSiteId("");
      onUploaded();
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }

  return (
    <form onSubmit={submit} className="auth-form upload-form">
      <label className={`upload-drop ${preview ? "has-preview" : ""}`}>
        {preview ? file?.type.startsWith("video/") ? <video src={preview} muted controls aria-label="Preview of your video" /> : <img src={preview} alt="Preview of your photo" /> : <span><Icon name="image" size={28} /><br />Choose a photo or video</span>}
        <input type="file" accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm" onChange={(event) => { setFile(event.target.files?.[0] || null); setError(""); }} />
      </label>
      <label>Title
        <input type="text" required maxLength={120} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Sunset at the Parliament lawns" />
      </label>
      <label>Which stop is it from? <span className="auth-optional">optional</span>
        <select value={siteId} onChange={(e) => setSiteId(e.target.value)}>
          <option value="">Not sure / somewhere else</option>
          {SITES.map((site) => <option key={site.id} value={site.id}>{site.name}</option>)}
        </select>
      </label>
      <label>Your story <span className="auth-optional">optional</span>
        <textarea rows={4} maxLength={1500} value={story} onChange={(e) => setStory(e.target.value)} placeholder="Tell us about your ride, who you went with, what you'll remember…" />
      </label>
      {error && <p role="alert" className="auth-error">{error}</p>}
      {thanks && <p role="status" className="auth-success">{thanks}</p>}
      <button type="submit" className="auth-primary" disabled={busy}>{busy ? "Uploading…" : `Share my ${file?.type.startsWith("video/") ? "video" : "photo"}`}</button>
      <p className="connect-muted" style={{ fontSize: "0.75rem" }}>Uploads are public and will appear in the gallery only after our team approves them. Approved media may be downloadable. Images are resized automatically; videos must be 4MB or smaller. Only share media you took or have permission to share.</p>
    </form>
  );
}

function RiderStories() {
  const { api } = useCustomer();
  const { download, notice } = useDownloads();
  const [photos, setPhotos] = useState(null);
  const [failed, setFailed] = useState("");
  const [openAt, setOpenAt] = useState(null);

  const load = useCallback(async () => {
    try {
      const result = await api("/api/community/photos");
      setPhotos(result.photos);
      setFailed("");
    }
    catch (err) { setFailed(err.message); }
  }, [api]);
  usePolling(load, 60000);

  async function remove(id) {
    if (!window.confirm("Remove this media from the gallery?")) return;
    try { await api(`/api/community/photos/${id}`, { method: "DELETE" }); await load(); }
    catch (err) { window.alert(err.message); }
  }

  const items = useMemo(() => (photos || []).map((p) => ({
    key: p.id, kind: "community", id: p.id, src: p.imageUrl, mediaType: p.mediaType || "image", title: p.title, story: p.story, credit: p.authorName, postedAt: p.createdAt, visibility: p.visibility || "public",
    downloadable: p.status === "approved" && p.visibility !== "private" && p.downloadable, status: p.status, mine: p.mine,
  })), [photos]);

  return (
    <section id="rider-stories" className="gallery-section" aria-labelledby="stories-heading">
      <div className="text-center mb-10">
        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#D4A017" }}>— Rider stories</p>
        <h2 id="stories-heading" className="font-display font-bold" style={{ fontSize: "clamp(1.6rem, 3vw, 2.35rem)", color: "#F5EDD9" }}>Your photos, your stories</h2>
        <p className="mt-3 max-w-xl mx-auto text-sm" style={{ color: "rgba(245,237,217,0.75)" }}>Rode with us? Share your photos using your booking code.</p>
      </div>

      {failed ? <p role="alert" className="text-center" style={{ color: "#F5A58D" }}>Rider photos couldn't be loaded. Please try again later.</p> : !photos ? <p className="connect-muted text-center">Loading rider photos…</p> : items.length === 0 ? (
        <p className="connect-muted glass-soft text-center" style={{ padding: "1.5rem", borderRadius: 4, maxWidth: "36rem", margin: "0 auto" }}>No rider media yet — yours could be the first.</p>
      ) : (
        <div className="rr-rider-masonry" aria-label="Rider photos and videos">
          {items.map((item, index) => (
            <article key={item.key} className="rr-rider-masonry-card">
              <button type="button" className="rr-rider-media-open" onClick={() => setOpenAt(index)} aria-label={`Open ${item.mediaType === "video" ? "video" : "photo"}: ${item.title}`}>
                {item.mediaType === "video" ? <video src={item.src} muted preload="metadata" aria-hidden="true" /> : <img src={item.src} alt={item.title} loading="lazy" />}
                {item.mediaType === "video" && <span className="rr-rider-video-badge">VIDEO</span>}
              </button>
              <div className="rr-rider-masonry-copy">
                <strong>{item.title}</strong>
                {item.story && <p>{item.story}</p>}
                {item.postedAt && <Stamp value={item.postedAt} className="gallery-stamp" />}
                <em>— {item.credit}{item.status !== "approved" ? ` · ${item.status === "pending" ? "waiting for approval" : "not approved"}` : ""}</em>
                <div className="rr-rider-card-actions">
                  {item.downloadable && <button type="button" className="rr-photo-download" onClick={() => download(item)}>Download</button>}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
      {notice && <p role="alert" className="auth-error" style={{ maxWidth: "36rem", margin: "1rem auto 0" }}>{notice}</p>}

      <details className="connect-panel glass stories-upload rr-gallery-upload-disclosure">
        <summary className="font-display">Share a photo or video</summary>
        <UploadForm onUploaded={load} />
      </details>

      {openAt !== null && <Lightbox items={items} index={openAt} onChange={setOpenAt} onClose={() => setOpenAt(null)} onDownload={download} />}
    </section>
  );
}

// ─── TEAM UPDATES (kept inside the official website gallery section) ─────────

function OfficialUpdates() {
  const { content } = useLiveData();
  const updates = content.filter((item) => item.contentType !== "picture");
  if (!updates.length) return null;
  return (
    <div className="rr-gallery-updates" aria-labelledby="updates-heading">
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#D4A017" }}>— From the team</p>
        <h2 id="updates-heading" className="font-display font-bold text-3xl" style={{ color: "#F5EDD9" }}>Videos &amp; updates</h2>
      </div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {updates.map((item) => (
          <article key={item.id} className="overflow-hidden rounded-sm glass">
            {item.contentType === "video" && item.mediaUrl && (
              <div className="p-6 pb-0"><a href={item.mediaUrl} target="_blank" rel="noreferrer" className="font-semibold underline" style={{ color: "#D4A017" }}>Watch video: {item.title}</a></div>
            )}
            <div className="p-6">
              <p className="mb-2 text-xs font-bold uppercase tracking-widest" style={{ color: "#D4A017" }}>{item.contentType}</p>
              <h3 className="font-display font-bold text-xl" style={{ color: "#F5EDD9" }}>{item.title}</h3>
              {item.bodyText && <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed" style={{ color: "rgba(245,237,217,0.8)" }}>{item.bodyText}</p>}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

// ─── RIDER RATING SECTION ─────────────────────────────────────────────────────

function RatingSection() {
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <section id="rider-rating" className="gallery-section reveal" style={{ marginTop: "3rem" }}>
      <div className="text-center mb-10">
        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#D4A017" }}>— Rate your ride</p>
        <h2 id="rating-heading" className="font-display font-bold" style={{ fontSize: "clamp(1.6rem, 3vw, 2.35rem)", color: "#F5EDD9" }}>How was your experience?</h2>
      </div>
      {submitted ? (
        <div className="max-w-md mx-auto text-center" style={{ padding: "2rem", backgroundColor: "rgba(26,58,42,0.4)", borderRadius: "8px", border: "1px solid rgba(212,160,23,0.3)" }}>
          <div style={{
            width: "48px", height: "48px", borderRadius: "50%", backgroundColor: "#25D366",
            display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem"
          }}>
            <Icon name="mapPin" size={24} style={{ color: "#0D0805" }} />
          </div>
          <h3 style={{ color: "#F5EDD9", marginBottom: "0.5rem" }}>Thank you for your feedback!</h3>
          <p style={{ color: "rgba(245,237,217,0.7)", fontSize: "0.9rem" }}>Your rating and comment help other riders discover Gaborone's heritage.</p>
        </div>
      ) : (
        <div className="max-w-md mx-auto" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                style={{
                  background: "none",
                  border: "none",
                  color: star <= rating ? "#D4A017" : "rgba(245,237,217,0.3)",
                  fontSize: "1.5rem",
                  cursor: "pointer",
                  padding: "0.25rem",
                  transition: "transform 0.1s",
                }}
                onMouseEnter={() => setRating(star)}
                onMouseLeave={() => setRating(rating)}
              >
                ★
              </button>
            ))}
          </div>
          <label style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <span style={{ color: "#E8DFCC", fontSize: "0.875rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em" }}>Your comment</span>
            <textarea
              rows={4}
              maxLength={500}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your ride experience…"
              style={{
                width: "100%",
                backgroundColor: "rgba(245,237,217,0.05)",
                border: "1px solid rgba(245,237,217,0.15)",
                color: "#F5EDD9",
                borderRadius: "4px",
                padding: "0.875rem",
                fontFamily: "Outfit, sans-serif",
                fontSize: "0.9rem",
                resize: "vertical",
              }}
            />
          </label>
          <button
            onClick={() => setSubmitted(true)}
            disabled={rating === 0 || !comment.trim()}
            className="submit-rating"
            style={{
              backgroundColor: rating === 0 || !comment.trim() ? "rgba(245,237,217,0.2)" : "#D4A017",
              color: "#0D0805",
              border: "none",
              padding: "0.875rem 1.5rem",
              borderRadius: "4px",
              fontWeight: 700,
              fontSize: "0.9rem",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              cursor: rating === 0 || !comment.trim() ? "not-allowed" : "pointer",
              opacity: rating === 0 || !comment.trim() ? 0.5 : 1,
              alignSelf: "flex-start",
            }}
          >
            Submit Rating
          </button>
        </div>
      )}
    </section>
  );
}

export default function GalleryPage() {
  const { hash } = useLocation();

  // The router doesn't scroll to #anchors by itself, and the shared scroll-to-top runs after this page mounts.
  useEffect(() => {
    if (!hash) return undefined;
    const timer = setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth", block: "start" }), 250);
    return () => clearTimeout(timer);
  }, [hash]);

  return (
    <>
      <main className="gallery-page rr rr-bg rr-gallery-page">
        <header className="rr-wrap rr-gallery-page-heading" style={{ textAlign: "left", marginLeft: 0, paddingLeft: 0, maxWidth: "none" }}>
          <p className="rr-kicker">City Bike Tours · Photo stories</p>
          <h1 className="font-display" style={{ textAlign: "left" }}>
            Your story. <span style={{ color: "#D4A017" }}>Our story.</span>
          </h1>
          <p style={{ textAlign: "left" }}>Share your ride, celebrate our nation's story — one photo at a time.</p>
        </header>
        <div className="rr-wrap gallery-rr gallery-main-content-wrapper">
          <RiderStories />
          <OfficialGallery />
        </div>
      </main>
      <Footer />
    </>
  );
}
